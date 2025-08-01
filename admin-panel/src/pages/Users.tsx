import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Eye, 
  Shield, 
  ShieldCheck, 
  Smartphone,
  AlertTriangle,
  Copy,
  CheckCircle
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { User } from '../types';
import { shortenAddress, formatDate, copyToClipboard } from '../utils';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    // Filter users based on search term
    if (!searchTerm) {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.ethAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.btcAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.tronAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [users, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
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

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-400">{error}</p>
        <button onClick={loadUsers} className="mt-4 btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-white">Users Management</h1>
          <p className="text-dark-400">Manage registered users and their wallets</p>
        </div>
        <div className="text-sm text-dark-300">
          Total: {users.length} users
        </div>
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-dark-400" />
          <input
            type="text"
            placeholder="Search by username or wallet address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10 w-full"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-4 px-4 text-dark-300 font-medium">User</th>
                <th className="text-left py-4 px-4 text-dark-300 font-medium">Wallets</th>
                <th className="text-left py-4 px-4 text-dark-300 font-medium">Security</th>
                <th className="text-left py-4 px-4 text-dark-300 font-medium">Device Status</th>
                <th className="text-left py-4 px-4 text-dark-300 font-medium">Joined</th>
                <th className="text-left py-4 px-4 text-dark-300 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="table-row">
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-medium">{user.username}</p>
                      <p className="text-dark-400 text-sm">ID: {user._id.slice(-8)}</p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-blue-900/30 text-blue-400 rounded">ETH</span>
                        <button
                          onClick={() => handleCopyAddress(user.ethAddress)}
                          className="text-dark-300 hover:text-white flex items-center space-x-1"
                        >
                          <span className="font-mono text-sm">{shortenAddress(user.ethAddress)}</span>
                          {copiedAddress === user.ethAddress ? (
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-orange-900/30 text-orange-400 rounded">BTC</span>
                        <button
                          onClick={() => handleCopyAddress(user.btcAddress)}
                          className="text-dark-300 hover:text-white flex items-center space-x-1"
                        >
                          <span className="font-mono text-sm">{shortenAddress(user.btcAddress)}</span>
                          {copiedAddress === user.btcAddress ? (
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-red-900/30 text-red-400 rounded">TRX</span>
                        <button
                          onClick={() => handleCopyAddress(user.tronAddress)}
                          className="text-dark-300 hover:text-white flex items-center space-x-1"
                        >
                          <span className="font-mono text-sm">{shortenAddress(user.tronAddress)}</span>
                          {copiedAddress === user.tronAddress ? (
                            <CheckCircle className="h-3 w-3 text-green-400" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        {user.twoFactorEnabled ? (
                          <ShieldCheck className="h-4 w-4 text-green-400" />
                        ) : (
                          <Shield className="h-4 w-4 text-yellow-400" />
                        )}
                        <span className={`text-sm ${user.twoFactorEnabled ? 'text-green-400' : 'text-yellow-400'}`}>
                          {user.twoFactorEnabled ? '2FA Enabled' : '2FA Disabled'}
                        </span>
                      </div>
                      <p className="text-dark-400 text-xs">
                        Security Key: {user.securityKey.slice(0, 8)}...
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {user.newDeviceFound ? (
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm">New Device</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Smartphone className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 text-sm">Verified</span>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-dark-300 text-sm">{formatDate(user.createdAt)}</p>
                  </td>
                  <td className="py-4 px-4">
                    <Link
                      to={`/users/${user._id}`}
                      className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-600 hover:bg-primary-700 text-dark-900 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-dark-400">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;