const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/keys');
const User = require('../models/User');

/**
 * Middleware to verify JWT token
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided',
      });
    }
    
    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use: Bearer <token>',
      });
    }
    
    // Extract token
    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, jwtSecret);
    
    // Find user
    const user = await User.findById(decoded.userId).select('-securityCodeHash -hashKeyHash -twoFactorSecret');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found',
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated',
      });
    }
    
    // Check if user is locked
    if (user.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked',
        reason: user.lockReason,
      });
    }
    
    // Add user to request object
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Authentication error',
    });
  }
};

/**
 * Middleware to verify device info matches stored device
 */
const deviceMiddleware = (req, res, next) => {
  try {
    const { deviceInfo } = req.body;
    const user = req.user;
    
    if (!deviceInfo) {
      return res.status(400).json({
        success: false,
        message: 'Device info is required',
      });
    }
    
    // Verify device matches stored device
    if (!user.verifyDevice(deviceInfo)) {
      // Mark as suspicious device change
      return res.status(403).json({
        success: false,
        message: 'Device verification failed',
        code: 'DEVICE_MISMATCH',
      });
    }
    
    next();
  } catch (error) {
    console.error('Device middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Device verification error',
    });
  }
};

/**
 * Middleware to verify 2FA code
 */
const twoFactorMiddleware = async (req, res, next) => {
  try {
    const { twoFactorCode } = req.body;
    const user = req.user;
    
    if (!twoFactorCode) {
      return res.status(400).json({
        success: false,
        message: '2FA code is required',
      });
    }
    
    if (!user.twoFactorEnabled) {
      return res.status(400).json({
        success: false,
        message: '2FA is not enabled for this account',
      });
    }
    
    // Verify 2FA code using otplib
    const { authenticator } = require('otplib');
    const isValid = authenticator.verify({
      token: twoFactorCode,
      secret: user.twoFactorSecret,
    });
    
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid 2FA code',
      });
    }
    
    // Update last verification time
    user.lastTwoFactorVerification = new Date();
    await user.save();
    
    next();
  } catch (error) {
    console.error('2FA middleware error:', error);
    return res.status(500).json({
      success: false,
      message: '2FA verification error',
    });
  }
};

/**
 * Combined middleware for high-security operations (auth + device + 2FA)
 */
const highSecurityMiddleware = [authMiddleware, deviceMiddleware, twoFactorMiddleware];

/**
 * Generate JWT token
 * @param {string} userId - User ID
 * @param {object} payload - Additional payload data
 * @returns {string} - JWT token
 */
const generateToken = (userId, payload = {}) => {
  return jwt.sign(
    {
      userId,
      ...payload,
    },
    jwtSecret,
    {
      expiresIn: '24h', // Token expires in 24 hours
    }
  );
};

/**
 * Verify JWT token without middleware
 * @param {string} token - JWT token
 * @returns {object} - Decoded token or null
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    return null;
  }
};

module.exports = {
  authMiddleware,
  deviceMiddleware,
  twoFactorMiddleware,
  highSecurityMiddleware,
  generateToken,
  verifyToken,
};