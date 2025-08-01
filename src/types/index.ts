export interface User {
  id: string
  username: string
  walletAddress: string
  deviceId: string
  isRegistered: boolean
}

export interface WalletBalance {
  address: string
  balance: string
  chain: SupportedChain
}

export interface Token {
  address: string
  symbol: string
  name: string
  decimals: number
  balance: string
  logoURI?: string
  chain: SupportedChain
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  token?: Token
  timestamp: number
  status: 'pending' | 'success' | 'failed'
  chain: SupportedChain
}

export type SupportedChain = 'ETH' | 'BNB' | 'MATIC' | 'BTC' | 'TRX'

export interface ChainConfig {
  name: string
  symbol: string
  chainId?: number
  rpcUrl: string
  explorerUrl: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export interface AuthData {
  recoveryHash: string
  securityCode: string
  totpCode: string
  deviceFingerprint: string
}

export interface RegisterData extends AuthData {
  username: string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface DeviceInfo {
  deviceId: string
  fingerprint: string
  model: string
  platform: string
  version: string
}