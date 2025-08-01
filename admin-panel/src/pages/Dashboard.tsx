import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Wallet, 
  DollarSign, 
  TrendingUp,
  Activity,
  Shield,
  AlertTriangle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { apiService } from '../services/apiService';
import type { DashboardStats } from '../types';
import { formatUSD, getChainColor, generateChartColors } from '../utils';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
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
        <button 
          onClick={loadDashboardData}
          className="mt-4 btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: '+12%',
      positive: true,
      color: 'text-blue-400'
    },
    {
      title: 'Active Wallets',
      value: Object.values(stats.activeWallets).reduce((a, b) => a + b, 0).toLocaleString(),
      icon: Wallet,
      change: '+8%',
      positive: true,
      color: 'text-green-400'
    },
    {
      title: 'Platform Fees',
      value: formatUSD(stats.platformFees.total),
      icon: DollarSign,
      change: '+24%',
      positive: true,
      color: 'text-primary-400'
    },
    {
      title: 'SHIBAU Usage',
      value: stats.platformFees.shibauUsage.toLocaleString(),
      icon: TrendingUp,
      change: '+18%',
      positive: true,
      color: 'text-accent-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-dark-700 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
              <div className="flex items-center mt-4">
                {stat.positive ? (
                  <ChevronUp className="h-4 w-4 text-green-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-red-400" />
                )}
                <span className={`text-sm ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
                <span className="text-dark-400 text-sm ml-2">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Wallets by Chain */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Active Wallets by Chain</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(stats.activeWallets).map(([chain, count]) => (
              <div key={chain} className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getChainColor(chain) }}
                />
                <div>
                  <p className="text-white font-medium">{chain}</p>
                  <p className="text-dark-400 text-sm">{count.toLocaleString()} wallets</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-dark-300">API Status</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-400 text-sm">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-300">Database</span>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-green-400 text-sm">Healthy</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-dark-300">Security</span>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span className="text-green-400 text-sm">Secure</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Balance Distribution Chart */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Token Balances by Chain</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData.balancesByChain}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="chain" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="#d4af37" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Platform Fee Collection */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Platform Fee Collection</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.chartData.feeCollection}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.chartData.feeCollection.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={generateChartColors(stats.chartData.feeCollection.length)[index]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Transaction Activity Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Transaction Activity (Last 30 Days)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.chartData.transactionCounts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="ETH" stroke="#627EEA" strokeWidth={2} />
              <Line type="monotone" dataKey="BTC" stroke="#F7931A" strokeWidth={2} />
              <Line type="monotone" dataKey="BNB" stroke="#F3BA2F" strokeWidth={2} />
              <Line type="monotone" dataKey="MATIC" stroke="#8247E5" strokeWidth={2} />
              <Line type="monotone" dataKey="TRX" stroke="#FF060A" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-dark-700 rounded-lg">
            <Activity className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-white">New user registration</p>
              <p className="text-dark-400 text-sm">2 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-dark-700 rounded-lg">
            <Shield className="h-5 w-5 text-yellow-400" />
            <div>
              <p className="text-white">Device change request</p>
              <p className="text-dark-400 text-sm">5 minutes ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-dark-700 rounded-lg">
            <DollarSign className="h-5 w-5 text-primary-400" />
            <div>
              <p className="text-white">Large transaction detected</p>
              <p className="text-dark-400 text-sm">8 minutes ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;