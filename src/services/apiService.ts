import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { ApiResponse, RegisterData, AuthData, User, WalletBalance, Transaction } from '../types'

class ApiService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: 'http://localhost:8000', // Update with your backend URL
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log('API Request:', config.method?.toUpperCase(), config.url)
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      (error) => {
        console.error('API Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  async register(data: RegisterData): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.post('/register', data)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
      }
    }
  }

  async login(data: AuthData): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.post('/login', data)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      }
    }
  }

  async getWalletBalance(address: string, chain: string): Promise<ApiResponse<WalletBalance>> {
    try {
      const response = await this.api.get(`/wallet/balance/${address}/${chain}`)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get balance',
      }
    }
  }

  async getTokens(address: string, chain: string): Promise<ApiResponse<any[]>> {
    try {
      const response = await this.api.get(`/wallet/tokens/${address}/${chain}`)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get tokens',
      }
    }
  }

  async sendTransaction(data: {
    from: string
    to: string
    amount: string
    chain: string
    token?: string
    totpCode: string
  }): Promise<ApiResponse<Transaction>> {
    try {
      const response = await this.api.post('/send', data)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Transaction failed',
      }
    }
  }

  async getTransactionHistory(address: string, chain: string): Promise<ApiResponse<Transaction[]>> {
    try {
      const response = await this.api.get(`/wallet/transactions/${address}/${chain}`)
      return response.data
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get transaction history',
      }
    }
  }
}

export const apiService = new ApiService()