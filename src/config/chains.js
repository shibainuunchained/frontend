const dotenv = require('dotenv');

dotenv.config();

const chains = {
  ethereum: {
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: process.env.ETH_RPC_URL,
    chainId: 1,
    explorer: 'https://etherscan.io',
    decimals: 18,
  },
  bsc: {
    name: 'Binance Smart Chain',
    symbol: 'BNB',
    rpcUrl: process.env.BSC_RPC_URL,
    chainId: 56,
    explorer: 'https://bscscan.com',
    decimals: 18,
  },
  polygon: {
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: process.env.POLYGON_RPC_URL,
    chainId: 137,
    explorer: 'https://polygonscan.com',
    decimals: 18,
  },
  bitcoin: {
    name: 'Bitcoin',
    symbol: 'BTC',
    apiUrl: process.env.BTC_API_URL,
    testnetApiUrl: process.env.BTC_TESTNET_API_URL,
    explorer: 'https://blockstream.info',
    decimals: 8,
  },
  tron: {
    name: 'Tron',
    symbol: 'TRX',
    rpcUrl: process.env.TRON_RPC_URL,
    explorer: 'https://tronscan.org',
    decimals: 6,
  },
};

// ERC20 Token ABI (standard functions)
const erc20ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: false,
    inputs: [
      { name: '_to', type: 'address' },
      { name: '_value', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
];

// Common token addresses
const tokens = {
  ethereum: {
    USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    USDC: '0xA0b86a33E6441c66c5B91266a48c1Be6b8996825',
    LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
  },
  bsc: {
    USDT: '0x55d398326f99059fF775485246999027B3197955',
    BUSD: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    CAKE: '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82',
  },
  polygon: {
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
  },
  tron: {
    USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  },
};

module.exports = {
  chains,
  erc20ABI,
  tokens,
};