import React, { useState, useEffect } from 'react';
import { 
  Filter, 
  ExternalLink, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Coins
} from 'lucide-react';
import { apiService } from '../services/apiService';
import { Transaction } from '../types';
import { formatDate, getExplorerUrl, getChainColor, formatBalance, shortenAddress } from '../utils';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  
  const [filters, setFilters] = useState({
    chain: '',
    type: '',
    startDate: '',
    endDate: '',
    limit: 25
  });

  useEffect(() => {
    loadTransactions();
  }, [currentPage, filters]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getTransactions({
        ...filters,
        page: currentPage
      });
      setTransactions(data.transactions);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      chain: '',
      type: '',
      startDate: '',
      endDate: '',
      limit: 25
    });
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400 bg-green-900/30';
      case 'pending': return 'text-yellow-400 bg-yellow-900/30';
      case 'failed': return 'text-red-400 bg-red-900/30';
      default: return 'text-dark-400 bg-dark-700';
    }
  };

  if (loading && currentPage === 1) {
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
        <button onClick={loadTransactions} className="mt-4 btn-primary">
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
          <h1 className="text-2xl font-bold text-white">Transactions</h1>
          <p className="text-dark-400">Monitor all transactions across chains</p>
        </div>
        <div className="text-sm text-dark-300">
          Showing {transactions.length} of {total.toLocaleString()} transactions
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-primary-400" />
          <h3 className="text-white font-medium">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Chain Filter */}
          <div>
            <label className="block text-dark-300 text-sm mb-2">Chain</label>
            <select
              value={filters.chain}
              onChange={(e) => handleFilterChange('chain', e.target.value)}
              className="input-field w-full"
            >
              <option value="">All Chains</option>
              <option value="ETH">Ethereum</option>
              <option value="BTC">Bitcoin</option>
              <option value="BNB">BNB Chain</option>
              <option value="MATIC">Polygon</option>
              <option value="TRX">Tron</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-dark-300 text-sm mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="input-field w-full"
            >
              <option value="">All Types</option>
              <option value="native">Native</option>
              <option value="token">Token</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-dark-300 text-sm mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange('startDate', e.target.value)}
              className="input-field w-full"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-dark-300 text-sm mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange('endDate', e.target.value)}
              className="input-field w-full"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-700">
                <th className="text-left py-4 px-4 text-dark-300 font-medium">Transaction</th>
                <th className="text-left py-4 px-4 text-dark-300 font-medium">User</th>
                <th className="text-left py-4 px-4 text-dark-300 font-medium">Chain</th>
                <th className="text-left py-4 px-4 text-dark-300 font-medium">Token/Amount</th>
                <th className="text-left py-4 px-4 text-dark-300 font-medium">Status</th>
                <th className="text-left py-4 px-4 text-dark-300 font-medium">Date</th>
                <th className="text-left py-4 px-4 text-dark-300 font-medium">Explorer</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id} className="table-row">
                  <td className="py-4 px-4">
                    <div>
                      <p className="text-white font-mono text-sm">{shortenAddress(tx.txHash)}</p>
                      <p className="text-dark-400 text-xs">
                        {shortenAddress(tx.fromAddress)} → {shortenAddress(tx.toAddress)}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-white">{tx.username}</p>
                    <p className="text-dark-400 text-xs">{tx.userId.slice(-8)}</p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getChainColor(tx.chain) }}
                      />
                      <span className="text-white">{tx.chain}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Coins className="h-4 w-4 text-primary-400" />
                      <div>
                        <p className="text-white font-medium">{tx.symbol}</p>
                        <p className="text-dark-400 text-sm">{formatBalance(tx.amount, 18)}</p>
                      </div>
                      <span className={`
                        text-xs px-2 py-1 rounded
                        ${tx.type === 'native' ? 'bg-primary-900/30 text-primary-400' : 'bg-accent-900/30 text-accent-400'}
                      `}>
                        {tx.type}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                      {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-dark-400" />
                      <span className="text-dark-300 text-sm">{formatDate(tx.timestamp)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <a
                      href={getExplorerUrl(tx.chain, tx.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-primary-400 hover:text-primary-300 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="text-sm">View</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {transactions.length === 0 && !loading && (
          <div className="text-center py-12">
            <Coins className="h-12 w-12 text-dark-500 mx-auto mb-4" />
            <p className="text-dark-400">No transactions found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-dark-400 text-sm">
            Page {currentPage} of {totalPages}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1 || loading}
              className="p-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum = Math.max(1, currentPage - 2) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    disabled={loading}
                    className={`
                      px-3 py-1 rounded transition-colors
                      ${pageNum === currentPage 
                        ? 'bg-primary-600 text-dark-900' 
                        : 'text-dark-300 hover:text-white hover:bg-dark-700'
                      }
                    `}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages || loading}
              className="p-2 text-dark-300 hover:text-white hover:bg-dark-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && currentPage > 1 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      )}
    </div>
  );
};

export default Transactions;