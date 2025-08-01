const { ethers } = require('ethers');
const TronWeb = require('tronweb');
const axios = require('axios');
const { chains, erc20ABI, tokens } = require('../config/chains');

/**
 * Gets native token balance for Ethereum-compatible chains
 * @param {string} address - Wallet address
 * @param {string} chain - Chain name (ethereum, bsc, polygon)
 * @returns {Promise<string>} - Balance in native token
 */
async function getEthCompatibleBalance(address, chain) {
  try {
    const chainConfig = chains[chain.toLowerCase()];
    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${chain}`);
    }
    
    const provider = new ethers.providers.JsonRpcProvider(chainConfig.rpcUrl);
    const balance = await provider.getBalance(address);
    
    return ethers.utils.formatEther(balance);
  } catch (error) {
    throw new Error(`Failed to get ${chain} balance: ${error.message}`);
  }
}

/**
 * Gets ERC20/BEP20 token balance
 * @param {string} address - Wallet address
 * @param {string} tokenAddress - Token contract address
 * @param {string} chain - Chain name
 * @returns {Promise<object>} - Token balance and info
 */
async function getTokenBalance(address, tokenAddress, chain) {
  try {
    const chainConfig = chains[chain.toLowerCase()];
    if (!chainConfig) {
      throw new Error(`Unsupported chain: ${chain}`);
    }
    
    const provider = new ethers.providers.JsonRpcProvider(chainConfig.rpcUrl);
    const contract = new ethers.Contract(tokenAddress, erc20ABI, provider);
    
    // Get balance, decimals, and symbol
    const [balance, decimals, symbol] = await Promise.all([
      contract.balanceOf(address),
      contract.decimals(),
      contract.symbol(),
    ]);
    
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);
    
    return {
      balance: formattedBalance,
      symbol,
      decimals: decimals.toString(),
      tokenAddress,
      chain,
    };
  } catch (error) {
    throw new Error(`Failed to get token balance: ${error.message}`);
  }
}

/**
 * Gets Bitcoin balance
 * @param {string} address - Bitcoin address
 * @param {boolean} testnet - Whether to use testnet
 * @returns {Promise<object>} - Balance and transaction info
 */
async function getBitcoinBalance(address, testnet = false) {
  try {
    const apiUrl = testnet ? chains.bitcoin.testnetApiUrl : chains.bitcoin.apiUrl;
    
    const response = await axios.get(`${apiUrl}/address/${address}`);
    const data = response.data;
    
    // Convert satoshis to BTC
    const balance = data.chain_stats.funded_txo_sum / 100000000;
    const unconfirmedBalance = data.mempool_stats.funded_txo_sum / 100000000;
    
    return {
      balance: balance.toString(),
      unconfirmedBalance: unconfirmedBalance.toString(),
      txCount: data.chain_stats.tx_count,
      symbol: 'BTC',
      decimals: 8,
      chain: 'bitcoin',
    };
  } catch (error) {
    if (error.response?.status === 404) {
      // Address not found means 0 balance
      return {
        balance: '0',
        unconfirmedBalance: '0',
        txCount: 0,
        symbol: 'BTC',
        decimals: 8,
        chain: 'bitcoin',
      };
    }
    throw new Error(`Failed to get Bitcoin balance: ${error.message}`);
  }
}

/**
 * Gets Tron balance
 * @param {string} address - Tron address
 * @returns {Promise<object>} - TRX balance and account info
 */
async function getTronBalance(address) {
  try {
    const tronWeb = new TronWeb({
      fullHost: chains.tron.rpcUrl,
    });
    
    // Get account info
    const account = await tronWeb.trx.getAccount(address);
    
    // Get TRX balance (in sun, 1 TRX = 1,000,000 sun)
    const balance = account.balance || 0;
    const formattedBalance = (balance / 1000000).toString();
    
    return {
      balance: formattedBalance,
      symbol: 'TRX',
      decimals: 6,
      chain: 'tron',
      bandwidth: account.bandwidth || 0,
      energy: account.energy || 0,
    };
  } catch (error) {
    if (error.message?.includes('account not found')) {
      return {
        balance: '0',
        symbol: 'TRX',
        decimals: 6,
        chain: 'tron',
        bandwidth: 0,
        energy: 0,
      };
    }
    throw new Error(`Failed to get Tron balance: ${error.message}`);
  }
}

/**
 * Gets TRC20 token balance
 * @param {string} address - Wallet address
 * @param {string} tokenAddress - Token contract address
 * @returns {Promise<object>} - Token balance and info
 */
async function getTRC20Balance(address, tokenAddress) {
  try {
    const tronWeb = new TronWeb({
      fullHost: chains.tron.rpcUrl,
    });
    
    // Get contract instance
    const contract = await tronWeb.contract().at(tokenAddress);
    
    // Get balance and token info
    const [balance, symbol, decimals] = await Promise.all([
      contract.balanceOf(address).call(),
      contract.symbol().call(),
      contract.decimals().call(),
    ]);
    
    // Format balance
    const formattedBalance = (balance / Math.pow(10, decimals)).toString();
    
    return {
      balance: formattedBalance,
      symbol,
      decimals: decimals.toString(),
      tokenAddress,
      chain: 'tron',
    };
  } catch (error) {
    throw new Error(`Failed to get TRC20 balance: ${error.message}`);
  }
}

/**
 * Gets all balances for a wallet address
 * @param {string} address - Wallet address
 * @param {string} chain - Chain name
 * @returns {Promise<object>} - All balances for the chain
 */
async function getAllBalances(address, chain) {
  try {
    const chainLower = chain.toLowerCase();
    const balances = {};
    
    switch (chainLower) {
      case 'ethereum':
      case 'eth':
        // Get ETH balance
        balances.native = await getEthCompatibleBalance(address, 'ethereum');
        balances.native_symbol = 'ETH';
        
        // Get popular ERC20 tokens
        balances.tokens = {};
        for (const [symbol, tokenAddress] of Object.entries(tokens.ethereum)) {
          try {
            const tokenBalance = await getTokenBalance(address, tokenAddress, 'ethereum');
            if (parseFloat(tokenBalance.balance) > 0) {
              balances.tokens[symbol] = tokenBalance;
            }
          } catch (error) {
            console.warn(`Failed to get ${symbol} balance:`, error.message);
          }
        }
        break;
        
      case 'bsc':
      case 'bnb':
        // Get BNB balance
        balances.native = await getEthCompatibleBalance(address, 'bsc');
        balances.native_symbol = 'BNB';
        
        // Get popular BEP20 tokens
        balances.tokens = {};
        for (const [symbol, tokenAddress] of Object.entries(tokens.bsc)) {
          try {
            const tokenBalance = await getTokenBalance(address, tokenAddress, 'bsc');
            if (parseFloat(tokenBalance.balance) > 0) {
              balances.tokens[symbol] = tokenBalance;
            }
          } catch (error) {
            console.warn(`Failed to get ${symbol} balance:`, error.message);
          }
        }
        break;
        
      case 'polygon':
      case 'matic':
        // Get MATIC balance
        balances.native = await getEthCompatibleBalance(address, 'polygon');
        balances.native_symbol = 'MATIC';
        
        // Get popular Polygon tokens
        balances.tokens = {};
        for (const [symbol, tokenAddress] of Object.entries(tokens.polygon)) {
          try {
            const tokenBalance = await getTokenBalance(address, tokenAddress, 'polygon');
            if (parseFloat(tokenBalance.balance) > 0) {
              balances.tokens[symbol] = tokenBalance;
            }
          } catch (error) {
            console.warn(`Failed to get ${symbol} balance:`, error.message);
          }
        }
        break;
        
      case 'bitcoin':
      case 'btc':
        balances.native = (await getBitcoinBalance(address)).balance;
        balances.native_symbol = 'BTC';
        balances.tokens = {}; // Bitcoin doesn't have native tokens
        break;
        
      case 'tron':
      case 'trx':
        // Get TRX balance
        const tronBalance = await getTronBalance(address);
        balances.native = tronBalance.balance;
        balances.native_symbol = 'TRX';
        balances.bandwidth = tronBalance.bandwidth;
        balances.energy = tronBalance.energy;
        
        // Get popular TRC20 tokens
        balances.tokens = {};
        for (const [symbol, tokenAddress] of Object.entries(tokens.tron)) {
          try {
            const tokenBalance = await getTRC20Balance(address, tokenAddress);
            if (parseFloat(tokenBalance.balance) > 0) {
              balances.tokens[symbol] = tokenBalance;
            }
          } catch (error) {
            console.warn(`Failed to get ${symbol} balance:`, error.message);
          }
        }
        break;
        
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
    
    return {
      chain: chainLower,
      address,
      ...balances,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to get all balances: ${error.message}`);
  }
}

/**
 * Gets balances for all supported chains
 * @param {object} wallets - User's wallet addresses
 * @returns {Promise<object>} - Balances for all chains
 */
async function getAllChainsBalances(wallets) {
  try {
    const allBalances = {};
    
    // Get Ethereum-compatible balances (same address for ETH, BSC, Polygon)
    if (wallets.ethereum?.address) {
      const ethAddress = wallets.ethereum.address;
      
      const [ethBalances, bscBalances, polygonBalances] = await Promise.all([
        getAllBalances(ethAddress, 'ethereum').catch(err => ({ error: err.message })),
        getAllBalances(ethAddress, 'bsc').catch(err => ({ error: err.message })),
        getAllBalances(ethAddress, 'polygon').catch(err => ({ error: err.message })),
      ]);
      
      allBalances.ethereum = ethBalances;
      allBalances.bsc = bscBalances;
      allBalances.polygon = polygonBalances;
    }
    
    // Get Bitcoin balance
    if (wallets.bitcoin?.address) {
      try {
        allBalances.bitcoin = await getAllBalances(wallets.bitcoin.address, 'bitcoin');
      } catch (error) {
        allBalances.bitcoin = { error: error.message };
      }
    }
    
    // Get Tron balance
    if (wallets.tron?.address) {
      try {
        allBalances.tron = await getAllBalances(wallets.tron.address, 'tron');
      } catch (error) {
        allBalances.tron = { error: error.message };
      }
    }
    
    return {
      balances: allBalances,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    throw new Error(`Failed to get all chains balances: ${error.message}`);
  }
}

module.exports = {
  getEthCompatibleBalance,
  getTokenBalance,
  getBitcoinBalance,
  getTronBalance,
  getTRC20Balance,
  getAllBalances,
  getAllChainsBalances,
};