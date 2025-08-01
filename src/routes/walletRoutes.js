const express = require('express');
const router = express.Router();

// Controllers
const {
  getBalances,
  getChainBalance,
  sendCrypto,
  estimateFee,
  getWalletAddresses,
  getSupportedTokens,
  getTransactionHistory,
} = require('../controllers/walletController');

// Middleware
const {
  authMiddleware,
  highSecurityMiddleware,
} = require('../middlewares/authMiddleware');
const {
  balanceLimiter,
  transactionLimiter,
} = require('../middlewares/rateLimit');

/**
 * @route   GET /api/wallet/balances
 * @desc    Get balances for all supported chains
 * @access  Private
 */
router.get('/balances', authMiddleware, balanceLimiter, getBalances);

/**
 * @route   GET /api/wallet/balance/:chain
 * @desc    Get balance for a specific chain
 * @access  Private
 */
router.get('/balance/:chain', authMiddleware, balanceLimiter, getChainBalance);

/**
 * @route   POST /api/wallet/send
 * @desc    Send transaction with 2FA, device verification, and fee deduction
 * @access  Private (High Security)
 */
router.post('/send', transactionLimiter, highSecurityMiddleware, sendCrypto);

/**
 * @route   POST /api/wallet/estimate-fee
 * @desc    Estimate transaction fee
 * @access  Private
 */
router.post('/estimate-fee', authMiddleware, estimateFee);

/**
 * @route   GET /api/wallet/addresses
 * @desc    Get wallet addresses for all chains
 * @access  Private
 */
router.get('/addresses', authMiddleware, getWalletAddresses);

/**
 * @route   GET /api/wallet/tokens/:chain
 * @desc    Get supported tokens for a chain
 * @access  Private
 */
router.get('/tokens/:chain', authMiddleware, getSupportedTokens);

/**
 * @route   GET /api/wallet/history
 * @desc    Get transaction history
 * @access  Private
 */
router.get('/history', authMiddleware, getTransactionHistory);

module.exports = router;