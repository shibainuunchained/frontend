const User = require('../models/User');
const { getAllChainsBalances } = require('../utils/getBalance');
const { sendTransaction, estimateTransactionFee } = require('../utils/sendTx');
const { decrypt } = require('../utils/encrypt');
const { tokens } = require('../config/chains');

/**
 * Get balances for all supported chains
 */
const getBalances = async (req, res) => {
  try {
    const user = req.user;
    
    // Get balances for all chains
    const balanceData = await getAllChainsBalances(user.wallets);
    
    res.json({
      success: true,
      message: 'Balances retrieved successfully',
      data: balanceData,
    });
  } catch (error) {
    console.error('Get balances error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve balances',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get balance for a specific chain
 */
const getChainBalance = async (req, res) => {
  try {
    const user = req.user;
    const { chain } = req.params;
    
    if (!chain) {
      return res.status(400).json({
        success: false,
        message: 'Chain parameter is required',
      });
    }
    
    // Get wallet address for the specified chain
    const address = user.getWalletAddress(chain);
    if (!address) {
      return res.status(404).json({
        success: false,
        message: `No wallet found for chain: ${chain}`,
      });
    }
    
    // Get balance data
    const { getAllBalances } = require('../utils/getBalance');
    const balanceData = await getAllBalances(address, chain);
    
    res.json({
      success: true,
      message: `${chain} balance retrieved successfully`,
      data: balanceData,
    });
  } catch (error) {
    console.error('Get chain balance error:', error);
    res.status(500).json({
      success: false,
      message: `Failed to retrieve ${req.params.chain} balance`,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Send transaction with fee deduction
 */
const sendCrypto = async (req, res) => {
  try {
    const user = req.user;
    const { coinType, chain, recipient, amount, tokenAddress } = req.body;
    
    // Validate required fields
    if (!coinType || !chain || !recipient || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Coin type, chain, recipient, and amount are required',
      });
    }
    
    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number',
      });
    }
    
    // Get user's wallet for the specified chain
    const chainLower = chain.toLowerCase();
    let wallet;
    let encryptedPrivateKey;
    
    if (['ethereum', 'eth', 'bsc', 'bnb', 'polygon', 'matic'].includes(chainLower)) {
      wallet = user.wallets.ethereum;
      encryptedPrivateKey = wallet?.encryptedPrivateKey;
    } else if (['bitcoin', 'btc'].includes(chainLower)) {
      wallet = user.wallets.bitcoin;
      encryptedPrivateKey = wallet?.encryptedPrivateKey;
    } else if (['tron', 'trx'].includes(chainLower)) {
      wallet = user.wallets.tron;
      encryptedPrivateKey = wallet?.encryptedPrivateKey;
    } else {
      return res.status(400).json({
        success: false,
        message: `Unsupported chain: ${chain}`,
      });
    }
    
    if (!wallet || !encryptedPrivateKey) {
      return res.status(404).json({
        success: false,
        message: `No wallet found for chain: ${chain}`,
      });
    }
    
    // Platform fee deduction (implement SHIBAU token fee logic)
    const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE) || 0.1;
    const feeAmount = numericAmount * (platformFeePercentage / 100);
    
    // Check if user has sufficient platform fee balance
    if (user.platformFeeBalance < feeAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient platform fee balance (SHIBAU tokens required)',
        required: feeAmount,
        available: user.platformFeeBalance,
      });
    }
    
    // Prepare transaction parameters
    const txParams = {
      chain: chainLower,
      to: recipient,
      amount: numericAmount,
      encryptedPrivateKey,
      tokenAddress,
    };
    
    // Send transaction
    const txResult = await sendTransaction(txParams);
    
    // Deduct platform fee
    user.platformFeeBalance -= feeAmount;
    await user.save();
    
    res.json({
      success: true,
      message: 'Transaction sent successfully',
      data: {
        transaction: txResult,
        platformFee: {
          amount: feeAmount,
          currency: 'SHIBAU',
          remainingBalance: user.platformFeeBalance,
        },
      },
    });
  } catch (error) {
    console.error('Send transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Transaction failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Estimate transaction fee
 */
const estimateFee = async (req, res) => {
  try {
    const { chain, recipient, amount, tokenAddress } = req.body;
    
    // Validate required fields
    if (!chain || !recipient || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Chain, recipient, and amount are required',
      });
    }
    
    // Validate amount
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number',
      });
    }
    
    // Estimate transaction fee
    const feeEstimate = await estimateTransactionFee({
      chain,
      to: recipient,
      amount: numericAmount,
      tokenAddress,
    });
    
    // Calculate platform fee
    const platformFeePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE) || 0.1;
    const platformFee = numericAmount * (platformFeePercentage / 100);
    
    res.json({
      success: true,
      message: 'Fee estimated successfully',
      data: {
        networkFee: feeEstimate,
        platformFee: {
          amount: platformFee,
          currency: 'SHIBAU',
          percentage: platformFeePercentage,
        },
        total: {
          amount: numericAmount,
          networkFee: feeEstimate.estimatedFee,
          platformFee: platformFee,
        },
      },
    });
  } catch (error) {
    console.error('Fee estimation error:', error);
    res.status(500).json({
      success: false,
      message: 'Fee estimation failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get wallet addresses for all chains
 */
const getWalletAddresses = async (req, res) => {
  try {
    const user = req.user;
    
    const addresses = {
      ethereum: user.wallets.ethereum?.address,
      bitcoin: user.wallets.bitcoin?.address,
      tron: user.wallets.tron?.address,
    };
    
    res.json({
      success: true,
      message: 'Wallet addresses retrieved successfully',
      data: {
        addresses,
        note: 'Ethereum address is compatible with BSC and Polygon networks',
      },
    });
  } catch (error) {
    console.error('Get wallet addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve wallet addresses',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get supported tokens for a chain
 */
const getSupportedTokens = async (req, res) => {
  try {
    const { chain } = req.params;
    
    if (!chain) {
      return res.status(400).json({
        success: false,
        message: 'Chain parameter is required',
      });
    }
    
    const chainLower = chain.toLowerCase();
    const supportedTokens = tokens[chainLower];
    
    if (!supportedTokens) {
      return res.status(404).json({
        success: false,
        message: `No supported tokens found for chain: ${chain}`,
      });
    }
    
    res.json({
      success: true,
      message: `Supported tokens for ${chain} retrieved successfully`,
      data: {
        chain: chainLower,
        tokens: supportedTokens,
      },
    });
  } catch (error) {
    console.error('Get supported tokens error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve supported tokens',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Get transaction history (placeholder - would integrate with blockchain APIs)
 */
const getTransactionHistory = async (req, res) => {
  try {
    const user = req.user;
    const { chain, limit = 20, offset = 0 } = req.query;
    
    // This is a placeholder implementation
    // In a real application, you would query blockchain APIs for transaction history
    
    res.json({
      success: true,
      message: 'Transaction history retrieved successfully',
      data: {
        transactions: [], // Placeholder - implement blockchain API integration
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          total: 0,
        },
        note: 'Transaction history integration requires blockchain API implementation',
      },
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve transaction history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

module.exports = {
  getBalances,
  getChainBalance,
  sendCrypto,
  estimateFee,
  getWalletAddresses,
  getSupportedTokens,
  getTransactionHistory,
};