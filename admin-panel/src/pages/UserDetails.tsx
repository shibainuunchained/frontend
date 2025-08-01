import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Copy, 
  CheckCircle, 
  Shield, 
  ShieldCheck, 
  Smartphone,
  AlertTriangle,
  Wallet,
  ExternalLink
} from 'lucide-react';
import { apiService } from '../services/apiService';
import type { User, WalletBalance } from '../types';
import { formatDate, copyToClipboard, formatBalance, formatUSD, getChainColor } from '../utils';

const UserDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadUserData(id);
    }
  }, [id]);

  const loadUserData = async (userId: string) => {
    try {
      setLoading(true);
      setError('');
      const [userData, balanceData] = await Promise.all([
        apiService.getUser(userId),
        apiService.getUserBalances(userId)
      ]);
      setUser(userData);
      setBalances(balanceData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAddress = async (address: string) => {
    const success = await copyToClipboard(address);
    if (success) {
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400">{error || 'User not found'}</p>
        <Link to="/users" className="mt-4 btn-primary">
          Back to Users
        </Link>
      </div>
    );
  }

  const walletAddresses = [
    { chain: 'ETH', address: user.ethAddress },
    { chain: 'BTC', address: user.btcAddress },
    { chain: 'TRX', address: user.tronAddress },
    ...(user.bnbAddress ? [{ chain: 'BNB', address: user.bnbAddress }] : []),
    ...(user.maticAddress ? [{ chain: 'MATIC', address: user.maticAddress }] : [])
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link 
          to="/users"
          className="p-2 hover:bg-dark-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-dark-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{user.username}</h1>
          <p className="text-dark-400">User Details & Wallet Information</p>
        </div>
      </div>

      {/* User Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-dark-400 text-sm">Username</p>
              <p className="text-white font-medium">{user.username}</p>
            </div>
            <div>
              <p className="text-dark-400 text-sm">User ID</p>
              <p className="text-white font-mono text-sm">{user._id}</p>
            </div>
            <div>
              <p className="text-dark-400 text-sm">Joined</p>
              <p className="text-white">{formatDate(user.createdAt)}</p>
            </div>
            <div>
              <p className="text-dark-400 text-sm">Last Updated</p>
              <p className="text-white">{formatDate(user.updatedAt)}</p>
            </div>
          </div>
        </div>

        {/* Security Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Security Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-dark-300">Two-Factor Authentication</span>
              <div className="flex items-center space-x-2">
                {user.twoFactorEnabled ? (
                  <ShieldCheck className="h-5 w-5 text-green-400" />
                ) : (
                  <Shield className="h-5 w-5 text-yellow-400" />
                )}
                <span className={`text-sm ${user.twoFactorEnabled ? 'text-green-400' : 'text-yellow-400'}`}>
                  {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <div>
              <p className="text-dark-400 text-sm">Security Key (Hashed)</p>
              <p className="text-white font-mono text-sm">{user.securityKey.slice(0, 16)}...</p>
            </div>
          </div>
        </div>

        {/* Device Info */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Device Information</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Smartphone className={`h-5 w-5 ${user.newDeviceFound ? 'text-yellow-400' : 'text-green-400'}`} />
              <span className={`text-sm ${user.newDeviceFound ? 'text-yellow-400' : 'text-green-400'}`}>
                {user.newDeviceFound ? 'New Device Detected' : 'Device Verified'}
              </span>
            </div>
            <div>
              <p className="text-dark-400 text-sm">Device Fingerprint</p>
              <p className="text-white font-mono text-xs">{user.deviceInfo.fingerprint.slice(0, 20)}...</p>
            </div>
            <div>
              <p className="text-dark-400 text-sm">Last IP</p>
              <p className="text-white text-sm">{user.deviceInfo.ip}</p>
            </div>
            <div>
              <p className="text-dark-400 text-sm">User Agent</p>
              <p className="text-white text-xs truncate">{user.deviceInfo.userAgent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Addresses */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Wallet Addresses</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {walletAddresses.map(({ chain, address }) => (
            <div key={chain} className="p-4 bg-dark-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getChainColor(chain) }}
                  />
                  <span className="text-white font-medium">{chain}</span>
                </div>
                <button
                  onClick={() => handleCopyAddress(address)}
                  className="p-1 hover:bg-dark-600 rounded"
                >
                  {copiedAddress === address ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4 text-dark-400 hover:text-white" />
                  )}
                </button>
              </div>
              <p className="text-dark-300 font-mono text-sm break-all">{address}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Wallet Balances */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Wallet Balances</h3>
        {balances.length > 0 ? (
          <div className="space-y-6">
            {balances.map((balance) => (
              <div key={balance.chain} className="border border-dark-700 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: getChainColor(balance.chain) }}
                  />
                  <h4 className="text-white font-semibold">{balance.chain} Wallet</h4>
                </div>

                {/* Native Balance */}
                <div className="mb-4 p-3 bg-dark-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4 text-primary-400" />
                      <span className="text-white font-medium">{balance.native.symbol}</span>
                      <span className="text-xs px-2 py-1 bg-primary-900/30 text-primary-400 rounded">Native</span>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-medium">{formatBalance(balance.native.balance, 18)}</p>
                      <p className="text-dark-400 text-sm">{formatUSD(balance.native.usdValue)}</p>
                    </div>
                  </div>
                </div>

                {/* Token Balances */}
                {balance.tokens.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-dark-300 text-sm font-medium">Tokens:</p>
                    {balance.tokens.map((token, index) => (
                      <div key={index} className="flex items-center justify-between p-2 hover:bg-dark-700 rounded">
                        <div>
                          <p className="text-white font-medium">{token.symbol}</p>
                          <p className="text-dark-400 text-xs">{token.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-white">{formatBalance(token.balance, token.decimals)}</p>
                          <p className="text-dark-400 text-sm">{formatUSD(token.usdValue)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-dark-500 mx-auto mb-4" />
            <p className="text-dark-400">No balance data available</p>
          </div>
        )}
      </div>

      {/* New Device Warning */}
      {user.newDeviceFound && user.newDeviceInfo && (
        <div className="card border border-yellow-600 bg-yellow-900/10">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-6 w-6 text-yellow-400 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">New Device Detected</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-yellow-300 font-medium mb-2">New Device Info:</p>
                  <p className="text-dark-300">IP: {user.newDeviceInfo.ip}</p>
                  <p className="text-dark-300">Fingerprint: {user.newDeviceInfo.fingerprint.slice(0, 20)}...</p>
                  <p className="text-dark-300">Detected: {formatDate(user.newDeviceInfo.timestamp)}</p>
                </div>
                <div>
                  <p className="text-yellow-300 font-medium mb-2">Previous Device:</p>
                  <p className="text-dark-300">IP: {user.deviceInfo.ip}</p>
                  <p className="text-dark-300">Fingerprint: {user.deviceInfo.fingerprint.slice(0, 20)}...</p>
                  <p className="text-dark-300">Last Used: {formatDate(user.deviceInfo.timestamp)}</p>
                </div>
              </div>
              <Link 
                to="/device-requests"
                className="inline-flex items-center space-x-2 mt-4 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-dark-900 rounded-lg transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Review Device Requests</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDetails;