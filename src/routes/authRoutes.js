const express = require('express');
const router = express.Router();

// Controllers
const {
  register,
  login,
  deviceChangeRequest,
  verifyToken,
  regenerate2FA,
} = require('../controllers/authController');

// Middleware
const { authMiddleware } = require('../middlewares/authMiddleware');
const {
  authLimiter,
  registrationLimiter,
  deviceChangeLimiter,
} = require('../middlewares/rateLimit');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with wallet generation and 2FA setup
 * @access  Public
 */
router.post('/register', registrationLimiter, register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user with security code, hash key, device verification, and 2FA
 * @access  Public
 */
router.post('/login', authLimiter, login);

/**
 * @route   POST /api/auth/device-change-request
 * @desc    Request device change (marks user for admin review)
 * @access  Public
 */
router.post('/device-change-request', deviceChangeLimiter, deviceChangeRequest);

/**
 * @route   GET /api/auth/verify
 * @desc    Verify JWT token and get user info
 * @access  Private
 */
router.get('/verify', authMiddleware, verifyToken);

/**
 * @route   POST /api/auth/regenerate-2fa
 * @desc    Regenerate 2FA secret (requires current 2FA verification)
 * @access  Private
 */
router.post('/regenerate-2fa', authMiddleware, regenerate2FA);

module.exports = router;