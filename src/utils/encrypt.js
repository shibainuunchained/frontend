const crypto = require('crypto');
const { encryptionKey } = require('../config/keys');

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64; // 512 bits
const AUTH_TAG_LENGTH = 16; // 128 bits

/**
 * Derives a key from the base encryption key and salt
 */
function deriveKey(salt) {
  return crypto.pbkdf2Sync(encryptionKey, salt, 100000, KEY_LENGTH, 'sha512');
}

/**
 * Encrypts text using AES-256-GCM
 * @param {string} text - Text to encrypt
 * @returns {string} - Base64 encoded encrypted data with IV, salt, and auth tag
 */
function encrypt(text) {
  try {
    if (!text) {
      throw new Error('Text to encrypt cannot be empty');
    }
    
    if (!encryptionKey || encryptionKey.length < 32) {
      throw new Error('Invalid encryption key. Must be at least 32 characters.');
    }
    
    // Generate random salt and IV
    const salt = crypto.randomBytes(SALT_LENGTH);
    const iv = crypto.randomBytes(IV_LENGTH);
    
    // Derive key from base key and salt
    const key = deriveKey(salt);
    
    // Create cipher
    const cipher = crypto.createCipher(ALGORITHM, key);
    cipher.setAAD(Buffer.from('crypto-wallet', 'utf8')); // Additional authenticated data
    
    // Encrypt
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // Get authentication tag
    const authTag = cipher.getAuthTag();
    
    // Combine salt + iv + authTag + encrypted data
    const combined = Buffer.concat([salt, iv, authTag, encrypted]);
    
    return combined.toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypts AES-256-GCM encrypted text
 * @param {string} encryptedData - Base64 encoded encrypted data
 * @returns {string} - Decrypted text
 */
function decrypt(encryptedData) {
  try {
    if (!encryptedData) {
      throw new Error('Encrypted data cannot be empty');
    }
    
    if (!encryptionKey || encryptionKey.length < 32) {
      throw new Error('Invalid encryption key. Must be at least 32 characters.');
    }
    
    // Decode from base64
    const combined = Buffer.from(encryptedData, 'base64');
    
    // Extract components
    const salt = combined.subarray(0, SALT_LENGTH);
    const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const authTag = combined.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
    
    // Derive key from base key and salt
    const key = deriveKey(salt);
    
    // Create decipher
    const decipher = crypto.createDecipher(ALGORITHM, key);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from('crypto-wallet', 'utf8')); // Additional authenticated data
    
    // Decrypt
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Encrypts an object by encrypting each string value
 * @param {object} obj - Object to encrypt
 * @returns {object} - Object with encrypted values
 */
function encryptObject(obj) {
  const encrypted = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.length > 0) {
      encrypted[key] = encrypt(value);
    } else if (typeof value === 'object' && value !== null) {
      encrypted[key] = encryptObject(value);
    } else {
      encrypted[key] = value;
    }
  }
  
  return encrypted;
}

/**
 * Decrypts an object by decrypting each encrypted string value
 * @param {object} obj - Object with encrypted values
 * @returns {object} - Object with decrypted values
 */
function decryptObject(obj) {
  const decrypted = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string' && value.length > 0) {
      try {
        decrypted[key] = decrypt(value);
      } catch (error) {
        // If decryption fails, assume it's not encrypted
        decrypted[key] = value;
      }
    } else if (typeof value === 'object' && value !== null) {
      decrypted[key] = decryptObject(value);
    } else {
      decrypted[key] = value;
    }
  }
  
  return decrypted;
}

/**
 * Generates a secure random encryption key
 * @returns {string} - Base64 encoded random key
 */
function generateKey() {
  return crypto.randomBytes(KEY_LENGTH).toString('base64');
}

module.exports = {
  encrypt,
  decrypt,
  encryptObject,
  decryptObject,
  generateKey,
};