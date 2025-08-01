export interface User {
  _id: string;
  username: string;
  ethAddress: string;
  btcAddress: string;
  tronAddress: string;
  bnbAddress?: string;
  maticAddress?: string;
  securityKey: string; // hashed
  deviceInfo: {
    fingerprint: string;
    userAgent: string;
    ip: string;
    timestamp: Date;
  };
  newDeviceFound: boolean;
  newDeviceInfo?: {
    fingerprint: string;
    userAgent: string;
    ip: string;
    timestamp: Date;
  };
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletBalance {
  chain: 'ETH' | 'BTC' | 'BNB' | 'MATIC' | 'TRX';
  native: {
    symbol: string;
    balance: string;
    usdValue: number;
  };
  tokens: Array<{
    address: string;
    symbol: string;
    name: string;
    balance: string;
    decimals: number;
    usdValue: number;
  }>;
}

export interface Transaction {
  _id: string;
  userId: string;
  username: string;
  chain: 'ETH' | 'BTC' | 'BNB' | 'MATIC' | 'TRX';
  type: 'native' | 'token';
  symbol: string;
  amount: string;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  fee?: string;
  toAddress: string;
  fromAddress: string;
}

export interface DeviceRequest {
  _id: string;
  userId: string;
  username: string;
  oldDeviceInfo: {
    fingerprint: string;
    userAgent: string;
    ip: string;
    timestamp: Date;
  };
  newDeviceInfo: {
    fingerprint: string;
    userAgent: string;
    ip: string;
    timestamp: Date;
  };
  requestDate: Date;
  status: 'pending' | 'approved' | 'rejected';
}

export interface DashboardStats {
  totalUsers: number;
  activeWallets: {
    ETH: number;
    BTC: number;
    BNB: number;
    MATIC: number;
    TRX: number;
  };
  platformFees: {
    total: number;
    thisMonth: number;
    shibauUsage: number;
  };
  chartData: {
    balancesByChain: Array<{
      chain: string;
      value: number;
    }>;
    feeCollection: Array<{
      name: string;
      value: number;
    }>;
    transactionCounts: Array<{
      date: string;
      ETH: number;
      BTC: number;
      BNB: number;
      MATIC: number;
      TRX: number;
    }>;
  };
}

export interface AdminAuth {
  token: string;
  user: {
    id: string;
    username: string;
    role: 'admin';
  };
  expiresAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}