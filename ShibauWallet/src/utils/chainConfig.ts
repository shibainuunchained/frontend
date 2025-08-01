import { ChainConfig, SupportedChain } from '../types'

export const CHAIN_CONFIGS: Record<SupportedChain, ChainConfig> = {
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    explorerUrl: 'https://etherscan.io',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
  },
  BNB: {
    name: 'BNB Smart Chain',
    symbol: 'BNB',
    chainId: 56,
    rpcUrl: 'https://bsc-dataseed.binance.org',
    explorerUrl: 'https://bscscan.com',
    nativeCurrency: {
      name: 'BNB',
      symbol: 'BNB',
      decimals: 18,
    },
  },
  MATIC: {
    name: 'Polygon',
    symbol: 'MATIC',
    chainId: 137,
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: {
      name: 'Polygon',
      symbol: 'MATIC',
      decimals: 18,
    },
  },
  BTC: {
    name: 'Bitcoin',
    symbol: 'BTC',
    rpcUrl: 'https://blockstream.info/api',
    explorerUrl: 'https://blockstream.info',
    nativeCurrency: {
      name: 'Bitcoin',
      symbol: 'BTC',
      decimals: 8,
    },
  },
  TRX: {
    name: 'Tron',
    symbol: 'TRX',
    rpcUrl: 'https://api.trongrid.io',
    explorerUrl: 'https://tronscan.org',
    nativeCurrency: {
      name: 'Tron',
      symbol: 'TRX',
      decimals: 6,
    },
  },
}

export const SUPPORTED_CHAINS: SupportedChain[] = ['ETH', 'BNB', 'MATIC', 'BTC', 'TRX']

export const getChainConfig = (chain: SupportedChain): ChainConfig => {
  return CHAIN_CONFIGS[chain]
}

export const isEVMChain = (chain: SupportedChain): boolean => {
  return ['ETH', 'BNB', 'MATIC'].includes(chain)
}