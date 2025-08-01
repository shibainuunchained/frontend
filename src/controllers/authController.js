const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const User = require('../models/User');
const { generateAllWallets } = require('../utils/generateWallets');
const { validateDeviceInfo, normalizeDeviceInfo, analyzeDeviceChange } = require('../utils/verifyDevice');
const { generateToken } = require('../middlewares/authMiddleware');

/**
 * Register a new user with wallet generation and 2FA setup
 */
const register = async (req, res) => {
  try {
    const { username, securityCode, hashKey, deviceInfo } = req.body;
    
    // Validate required fields
    if (!username || !securityCode || !hashKey || !deviceInfo) {
      return res.status(400).json({
        success: false,
        message: 'Username, security code, hash key, and device info are required',
      });
    }
    
    // Validate device info
    const deviceValidation = validateDeviceInfo(deviceInfo);
    if (!deviceValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device info',
        errors: deviceValidation.errors,
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists',
      });
    }
    
    // Normalize device info
    const normalizedDeviceInfo = normalizeDeviceInfo(deviceInfo);
    
    // Generate 2FA secret
    const twoFactorSecret = authenticator.generateSecret();
    
    // Generate wallets for all supported chains
    const { wallets } = await generateAllWallets();
    
    // Create user
    const user = new User({
      username,
      securityCodeHash: securityCode, // Will be hashed by pre-save middleware
      hashKeyHash: hashKey, // Will be hashed by pre-save middleware
      deviceInfo: normalizedDeviceInfo,
      twoFactorSecret,
      wallets,
    });
    
    await user.save();
    
    // Generate QR code for Google Authenticator
    const service = 'CryptoWallet';
    const account = username;
    const otpauth = authenticator.keyuri(account, service, twoFactorSecret);
    const qrCodeUrl = await qrcode.toDataURL(otpauth);
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Response without sensitive data
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          username: user.username,
          walletAddresses: {
            ethereum: user.wallets.ethereum.address,
            bitcoin: user.wallets.bitcoin.address,
            tron: user.wallets.tron.address,
          },
          twoFactorEnabled: user.twoFactorEnabled,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        token,
        qrCodeUrl,
        manualEntryKey: twoFactorSecret,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Login user with security code, hash key, device verification, and 2FA
 */
const login = async (req, res) => {
  try {
    const { securityCode, hashKey, deviceInfo, twoFactorCode } = req.body;
    
    // Validate required fields
    if (!securityCode || !hashKey || !deviceInfo || !twoFactorCode) {
      return res.status(400).json({
        success: false,
        message: 'Security code, hash key, device info, and 2FA code are required',
      });
    }
    
    // Validate device info
    const deviceValidation = validateDeviceInfo(deviceInfo);
    if (!deviceValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device info',
        errors: deviceValidation.errors,
      });
    }
    
    // Find user by trying to match against all users (security through obscurity)
    const users = await User.find({ isActive: true });
    let user = null;
    
    for (const candidate of users) {
      const securityMatch = await candidate.verifySecurityCode(securityCode);
      const hashMatch = await candidate.verifyHashKey(hashKey);
      
      if (securityMatch && hashMatch) {
        user = candidate;
        break;
      }
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    
    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked',
        reason: user.lockReason,
      });
    }
    
    // Normalize device info
    const normalizedDeviceInfo = normalizeDeviceInfo(deviceInfo);
    
    // Verify device
    if (!user.verifyDevice(normalizedDeviceInfo)) {
      // Analyze device change
      const analysis = analyzeDeviceChange(user.deviceInfo, normalizedDeviceInfo);
      
      return res.status(403).json({
        success: false,
        message: 'Device verification failed',
        code: 'DEVICE_MISMATCH',
        analysis: {
          riskLevel: analysis.riskLevel,
          reasons: analysis.reasons,
        },
      });
    }
    
    // Verify 2FA code
    const is2FAValid = authenticator.verify({
      token: twoFactorCode,
      secret: user.twoFactorSecret,
    });
    
    if (!is2FAValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid 2FA code',
      });
    }
    
    // Update login timestamp
    user.lastLogin = new Date();
    user.lastTwoFactorVerification = new Date();
    await user.save();
    
    // Generate JWT token
    const token = generateToken(user._id);
    
    // Response without sensitive data
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          walletAddresses: {
            ethereum: user.wallets.ethereum.address,
            bitcoin: user.wallets.bitcoin.address,
            tron: user.wallets.tron.address,
          },
          twoFactorEnabled: user.twoFactorEnabled,
          lastLogin: user.lastLogin,
          platformFeeBalance: user.platformFeeBalance,
        },
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Request device change (marks user for admin review)
 */
const deviceChangeRequest = async (req, res) => {
  try {
    const { securityCode, hashKey, deviceInfo, twoFactorCode } = req.body;
    
    // Validate required fields
    if (!securityCode || !hashKey || !deviceInfo || !twoFactorCode) {
      return res.status(400).json({
        success: false,
        message: 'Security code, hash key, device info, and 2FA code are required',
      });
    }
    
    // Validate device info
    const deviceValidation = validateDeviceInfo(deviceInfo);
    if (!deviceValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid device info',
        errors: deviceValidation.errors,
      });
    }
    
    // Find user by credentials
    const users = await User.find({ isActive: true });
    let user = null;
    
    for (const candidate of users) {
      const securityMatch = await candidate.verifySecurityCode(securityCode);
      const hashMatch = await candidate.verifyHashKey(hashKey);
      
      if (securityMatch && hashMatch) {
        user = candidate;
        break;
      }
    }
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }
    
    // Verify 2FA code using old device's secret
    const is2FAValid = authenticator.verify({
      token: twoFactorCode,
      secret: user.twoFactorSecret,
    });
    
    if (!is2FAValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid 2FA code',
      });
    }
    
    // Normalize new device info
    const normalizedDeviceInfo = normalizeDeviceInfo(deviceInfo);
    
    // Analyze device change
    const analysis = analyzeDeviceChange(user.deviceInfo, normalizedDeviceInfo);
    
    // Mark user for device change review
    user.newDeviceFound = true;
    user.pendingDeviceInfo = normalizedDeviceInfo;
    await user.save();
    
    // Log the device change request for admin review
    console.log(`Device change request for user ${user.username}:`, {
      userId: user._id,
      oldDevice: user.deviceInfo,
      newDevice: normalizedDeviceInfo,
      analysis,
      timestamp: new Date(),
    });
    
    res.json({
      success: true,
      message: 'Device change request submitted for admin review',
      data: {
        requestId: user._id,
        analysis: {
          riskLevel: analysis.riskLevel,
          reasons: analysis.reasons,
        },
        estimatedReviewTime: '24-48 hours',
      },
    });
  } catch (error) {
    console.error('Device change request error:', error);
    res.status(500).json({
      success: false,
      message: 'Device change request failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Verify token and get user info (for protected routes)
 */
const verifyToken = async (req, res) => {
  try {
    const user = req.user; // Set by authMiddleware
    
    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          username: user.username,
          walletAddresses: {
            ethereum: user.wallets.ethereum.address,
            bitcoin: user.wallets.bitcoin.address,
            tron: user.wallets.tron.address,
          },
          twoFactorEnabled: user.twoFactorEnabled,
          lastLogin: user.lastLogin,
          platformFeeBalance: user.platformFeeBalance,
          isActive: user.isActive,
          newDeviceFound: user.newDeviceFound,
        },
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Regenerate 2FA secret (requires current 2FA verification)
 */
const regenerate2FA = async (req, res) => {
  try {
    const { twoFactorCode } = req.body;
    const user = req.user;
    
    if (!twoFactorCode) {
      return res.status(400).json({
        success: false,
        message: '2FA code is required',
      });
    }
    
    // Verify current 2FA code
    const is2FAValid = authenticator.verify({
      token: twoFactorCode,
      secret: user.twoFactorSecret,
    });
    
    if (!is2FAValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid 2FA code',
      });
    }
    
    // Generate new 2FA secret
    const newTwoFactorSecret = authenticator.generateSecret();
    
    // Update user
    user.twoFactorSecret = newTwoFactorSecret;
    await user.save();
    
    // Generate QR code
    const service = 'CryptoWallet';
    const account = user.username;
    const otpauth = authenticator.keyuri(account, service, newTwoFactorSecret);
    const qrCodeUrl = await qrcode.toDataURL(otpauth);
    
    res.json({
      success: true,
      message: '2FA secret regenerated successfully',
      data: {
        qrCodeUrl,
        manualEntryKey: newTwoFactorSecret,
      },
    });
  } catch (error) {
    console.error('2FA regeneration error:', error);
    res.status(500).json({
      success: false,
      message: '2FA regeneration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  register,
  login,
  deviceChangeRequest,
  verifyToken,
  regenerate2FA,
};