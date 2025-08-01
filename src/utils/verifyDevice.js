const crypto = require('crypto');

/**
 * Verifies if the provided device info matches the stored device info
 * @param {object} storedDeviceInfo - Device info from database
 * @param {object} providedDeviceInfo - Device info from request
 * @returns {boolean} - True if device matches
 */
function verifyDevice(storedDeviceInfo, providedDeviceInfo) {
  if (!storedDeviceInfo || !providedDeviceInfo) {
    return false;
  }
  
  // Primary check: device ID and fingerprint must match exactly
  const deviceIdMatch = storedDeviceInfo.deviceId === providedDeviceInfo.deviceId;
  const fingerprintMatch = storedDeviceInfo.fingerprint === providedDeviceInfo.fingerprint;
  
  return deviceIdMatch && fingerprintMatch;
}

/**
 * Generates a device fingerprint from device information
 * @param {object} deviceInfo - Device information
 * @returns {string} - SHA256 hash of device characteristics
 */
function generateDeviceFingerprint(deviceInfo) {
  const {
    platform,
    model,
    version,
    deviceId,
    userAgent,
    screenResolution,
    timezone,
    language,
  } = deviceInfo;
  
  // Combine device characteristics into a single string
  const deviceString = [
    platform || '',
    model || '',
    version || '',
    deviceId || '',
    userAgent || '',
    screenResolution || '',
    timezone || '',
    language || '',
  ].join('|');
  
  // Generate SHA256 hash
  return crypto.createHash('sha256').update(deviceString).digest('hex');
}

/**
 * Validates device info structure
 * @param {object} deviceInfo - Device info to validate
 * @returns {object} - Validation result with isValid and errors
 */
function validateDeviceInfo(deviceInfo) {
  const errors = [];
  
  if (!deviceInfo) {
    errors.push('Device info is required');
    return { isValid: false, errors };
  }
  
  if (!deviceInfo.deviceId || typeof deviceInfo.deviceId !== 'string') {
    errors.push('Device ID is required and must be a string');
  }
  
  if (deviceInfo.deviceId && deviceInfo.deviceId.length < 10) {
    errors.push('Device ID must be at least 10 characters long');
  }
  
  if (!deviceInfo.platform || typeof deviceInfo.platform !== 'string') {
    errors.push('Platform is required and must be a string');
  }
  
  // Optional but recommended fields
  if (deviceInfo.fingerprint && typeof deviceInfo.fingerprint !== 'string') {
    errors.push('Fingerprint must be a string if provided');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Normalizes device info by generating fingerprint if not provided
 * @param {object} deviceInfo - Raw device info
 * @returns {object} - Normalized device info with fingerprint
 */
function normalizeDeviceInfo(deviceInfo) {
  const normalized = { ...deviceInfo };
  
  // Generate fingerprint if not provided
  if (!normalized.fingerprint) {
    normalized.fingerprint = generateDeviceFingerprint(normalized);
  }
  
  // Ensure all fields are strings and trimmed
  Object.keys(normalized).forEach(key => {
    if (typeof normalized[key] === 'string') {
      normalized[key] = normalized[key].trim();
    }
  });
  
  return normalized;
}

/**
 * Checks if device change is suspicious
 * @param {object} oldDeviceInfo - Previous device info
 * @param {object} newDeviceInfo - New device info
 * @returns {object} - Analysis result with isSuspicious and reasons
 */
function analyzeDeviceChange(oldDeviceInfo, newDeviceInfo) {
  const suspiciousReasons = [];
  
  if (!oldDeviceInfo || !newDeviceInfo) {
    return { isSuspicious: false, reasons: [] };
  }
  
  // Check for complete device ID change
  if (oldDeviceInfo.deviceId !== newDeviceInfo.deviceId) {
    suspiciousReasons.push('Device ID changed completely');
  }
  
  // Check for platform change
  if (oldDeviceInfo.platform !== newDeviceInfo.platform) {
    suspiciousReasons.push('Platform changed');
  }
  
  // Check for model change (less suspicious for software updates)
  if (oldDeviceInfo.model && newDeviceInfo.model && 
      oldDeviceInfo.model !== newDeviceInfo.model) {
    suspiciousReasons.push('Device model changed');
  }
  
  // Check fingerprint change
  if (oldDeviceInfo.fingerprint !== newDeviceInfo.fingerprint) {
    suspiciousReasons.push('Device fingerprint changed');
  }
  
  return {
    isSuspicious: suspiciousReasons.length > 0,
    reasons: suspiciousReasons,
    riskLevel: suspiciousReasons.length >= 2 ? 'high' : 
               suspiciousReasons.length === 1 ? 'medium' : 'low',
  };
}

module.exports = {
  verifyDevice,
  generateDeviceFingerprint,
  validateDeviceInfo,
  normalizeDeviceInfo,
  analyzeDeviceChange,
};