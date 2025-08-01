const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  
  // Hashed security credentials
  securityCodeHash: {
    type: String,
    required: true,
  },
  hashKeyHash: {
    type: String,
    required: true,
  },
  
  // Device binding
  deviceInfo: {
    deviceId: {
      type: String,
      required: true,
    },
    platform: String,
    model: String,
    version: String,
    fingerprint: String,
  },
  
  // Device change management
  newDeviceFound: {
    type: Boolean,
    default: false,
  },
  pendingDeviceInfo: {
    deviceId: String,
    platform: String,
    model: String,
    version: String,
    fingerprint: String,
  },
  
  // 2FA
  twoFactorSecret: {
    type: String,
    required: true,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: true,
  },
  
  // Encrypted wallet data
  wallets: {
    ethereum: {
      address: String,
      encryptedPrivateKey: String,
      encryptedSeed: String,
    },
    bitcoin: {
      address: String,
      encryptedPrivateKey: String,
      encryptedSeed: String,
    },
    tron: {
      address: String,
      encryptedPrivateKey: String,
      encryptedSeed: String,
    },
  },
  
  // Platform fee balance
  platformFeeBalance: {
    type: Number,
    default: 0,
  },
  
  // Account status
  isActive: {
    type: Boolean,
    default: true,
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  lockReason: String,
  
  // Timestamps
  lastLogin: Date,
  lastTwoFactorVerification: Date,
  
}, {
  timestamps: true,
});

// Hash security code before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('securityCodeHash') && !this.isModified('hashKeyHash')) {
    return next();
  }
  
  try {
    // Hash security code and hash key if they are being set for the first time
    if (this.isModified('securityCodeHash') && !this.securityCodeHash.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(12);
      this.securityCodeHash = await bcrypt.hash(this.securityCodeHash, salt);
    }
    
    if (this.isModified('hashKeyHash') && !this.hashKeyHash.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(12);
      this.hashKeyHash = await bcrypt.hash(this.hashKeyHash, salt);
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Method to verify security code
userSchema.methods.verifySecurityCode = async function(securityCode) {
  return await bcrypt.compare(securityCode, this.securityCodeHash);
};

// Method to verify hash key
userSchema.methods.verifyHashKey = async function(hashKey) {
  return await bcrypt.compare(hashKey, this.hashKeyHash);
};

// Method to verify device
userSchema.methods.verifyDevice = function(deviceInfo) {
  return this.deviceInfo.deviceId === deviceInfo.deviceId &&
         this.deviceInfo.fingerprint === deviceInfo.fingerprint;
};

// Method to get wallet address by chain
userSchema.methods.getWalletAddress = function(chain) {
  const chainLower = chain.toLowerCase();
  
  // ETH-compatible chains use the same address
  if (['ethereum', 'eth', 'bsc', 'bnb', 'polygon', 'matic'].includes(chainLower)) {
    return this.wallets.ethereum?.address;
  }
  
  if (['bitcoin', 'btc'].includes(chainLower)) {
    return this.wallets.bitcoin?.address;
  }
  
  if (['tron', 'trx'].includes(chainLower)) {
    return this.wallets.tron?.address;
  }
  
  return null;
};

// Index for performance
userSchema.index({ username: 1 });
userSchema.index({ 'deviceInfo.deviceId': 1 });
userSchema.index({ 'wallets.ethereum.address': 1 });
userSchema.index({ 'wallets.bitcoin.address': 1 });
userSchema.index({ 'wallets.tron.address': 1 });

module.exports = mongoose.model('User', userSchema);