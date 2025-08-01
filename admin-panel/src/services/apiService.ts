import axios from 'axios';
import { 
  User, 
  WalletBalance, 
  Transaction, 
  DeviceRequest, 
  DashboardStats, 
  ApiResponse 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

class ApiService {
  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await axios.get<ApiResponse<DashboardStats>>(`${API_BASE_URL}/admin/dashboard`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch dashboard stats');
  }

  // Users
  async getUsers(): Promise<User[]> {
    const response = await axios.get<ApiResponse<User[]>>(`${API_BASE_URL}/admin/users`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch users');
  }

  async getUser(userId: string): Promise<User> {
    const response = await axios.get<ApiResponse<User>>(`${API_BASE_URL}/admin/user/${userId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch user');
  }

  async getUserBalances(userId: string): Promise<WalletBalance[]> {
    const response = await axios.get<ApiResponse<WalletBalance[]>>(`${API_BASE_URL}/admin/balances/${userId}`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch user balances');
  }

  // Device Requests
  async getDeviceRequests(): Promise<DeviceRequest[]> {
    const response = await axios.get<ApiResponse<DeviceRequest[]>>(`${API_BASE_URL}/admin/device-requests`);
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch device requests');
  }

  async approveDevice(userId: string): Promise<void> {
    const response = await axios.patch<ApiResponse<void>>(`${API_BASE_URL}/admin/approve-device`, { userId });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to approve device');
    }
  }

  async rejectDevice(userId: string): Promise<void> {
    const response = await axios.patch<ApiResponse<void>>(`${API_BASE_URL}/admin/reject-device`, { userId });
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to reject device');
    }
  }

  // Transactions
  async getTransactions(filters?: {
    chain?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ transactions: Transaction[]; total: number; page: number; totalPages: number }> {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const response = await axios.get<ApiResponse<{
      transactions: Transaction[];
      total: number;
      page: number;
      totalPages: number;
    }>>(`${API_BASE_URL}/admin/transactions?${params.toString()}`);
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch transactions');
  }
}

export const apiService = new ApiService();