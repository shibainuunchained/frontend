import axios from 'axios';
import type { AdminAuth, ApiResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

interface LoginCredentials {
  username: string;
  password: string;
}

class AuthService {
  private readonly TOKEN_KEY = 'admin_token';
  private readonly USER_KEY = 'admin_user';
  private tokenRefreshTimeout: NodeJS.Timeout | null = null;

  async login(credentials: LoginCredentials): Promise<AdminAuth> {
    try {
      const response = await axios.post<ApiResponse<AdminAuth>>(
        `${API_BASE_URL}/admin/login`,
        credentials
      );

      if (response.data.success && response.data.data) {
        const authData = response.data.data;
        this.setAuthData(authData);
        this.scheduleTokenRefresh(authData.expiresAt);
        return authData;
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Network error');
      }
      throw error;
    }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }
    // Clear axios default headers
    delete axios.defaults.headers.common['Authorization'];
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUser(): AdminAuth['user'] | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  private setAuthData(authData: AdminAuth): void {
    localStorage.setItem(this.TOKEN_KEY, authData.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user));
    // Set default authorization header for axios
    axios.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
  }

  private scheduleTokenRefresh(expiresAt: Date): void {
    if (this.tokenRefreshTimeout) {
      clearTimeout(this.tokenRefreshTimeout);
    }

    const expirationTime = new Date(expiresAt).getTime();
    const currentTime = Date.now();
    const refreshTime = expirationTime - currentTime - (5 * 60 * 1000); // Refresh 5 minutes before expiration

    if (refreshTime > 0) {
      this.tokenRefreshTimeout = setTimeout(() => {
        this.logout(); // Auto-logout when token expires
        window.location.href = '/login';
      }, refreshTime);
    }
  }

  // Initialize auth on app startup
  initializeAuth(): void {
    const token = this.getToken();
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Set up auto-logout after 15 minutes of inactivity
      this.setupIdleTimer();
    }
  }

  private setupIdleTimer(): void {
    let idleTimer: NodeJS.Timeout;
    const IDLE_TIME = 15 * 60 * 1000; // 15 minutes

    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        this.logout();
        window.location.href = '/login';
      }, IDLE_TIME);
    };

    // Reset timer on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });

    resetIdleTimer(); // Initial timer setup
  }
}

export const authService = new AuthService();