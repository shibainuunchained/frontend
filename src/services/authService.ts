import AsyncStorage from '@react-native-async-storage/async-storage'
import DeviceInfo from 'react-native-device-info'
import { authenticator } from 'otplib'
import { DeviceInfo as DeviceInfoType, User, AuthData, RegisterData } from '../types'
import { apiService } from './apiService'

const STORAGE_KEYS = {
  USER: 'user',
  DEVICE_INFO: 'device_info',
  TOTP_SECRET: 'totp_secret',
}

class AuthService {
  private deviceInfo: DeviceInfoType | null = null

  async initializeDeviceInfo(): Promise<DeviceInfoType> {
    if (this.deviceInfo) {
      return this.deviceInfo
    }

    const deviceId = await DeviceInfo.getUniqueId()
    const model = await DeviceInfo.getModel()
    const platform = await DeviceInfo.getSystemName()
    const version = await DeviceInfo.getSystemVersion()
    
    // Create device fingerprint
    const fingerprint = await this.generateDeviceFingerprint()

    this.deviceInfo = {
      deviceId,
      fingerprint,
      model,
      platform,
      version,
    }

    // Store device info
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_INFO, JSON.stringify(this.deviceInfo))
    
    return this.deviceInfo
  }

  private async generateDeviceFingerprint(): Promise<string> {
    const deviceId = await DeviceInfo.getUniqueId()
    const model = await DeviceInfo.getModel()
    const platform = await DeviceInfo.getSystemName()
    const version = await DeviceInfo.getSystemVersion()
    const buildNumber = await DeviceInfo.getBuildNumber()
    
    // Create a unique fingerprint based on device characteristics
    const fingerprint = `${deviceId}-${model}-${platform}-${version}-${buildNumber}`
    return Buffer.from(fingerprint).toString('base64')
  }

  generateTOTPSecret(): string {
    return authenticator.generateSecret()
  }

  generateTOTPQR(username: string, secret: string): string {
    const issuer = 'Shibau Wallet'
    const label = `${issuer}:${username}`
    const otpauth = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`
    return otpauth
  }

  verifyTOTP(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret })
    } catch (error) {
      console.error('TOTP verification error:', error)
      return false
    }
  }

  async register(username: string, securityCode: string, recoveryHash: string, totpCode: string): Promise<{ success: boolean; user?: User; error?: string; qrCode?: string }> {
    try {
      const deviceInfo = await this.initializeDeviceInfo()
      
      // Generate TOTP secret for this user
      const totpSecret = this.generateTOTPSecret()
      
      // Verify the provided TOTP code
      if (!this.verifyTOTP(totpCode, totpSecret)) {
        return { success: false, error: 'Invalid TOTP code' }
      }

      const registerData: RegisterData = {
        username,
        securityCode,
        recoveryHash,
        totpCode,
        deviceFingerprint: deviceInfo.fingerprint,
      }

      const response = await apiService.register(registerData)

      if (response.success && response.data) {
        // Store user data locally
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data))
        await AsyncStorage.setItem(STORAGE_KEYS.TOTP_SECRET, totpSecret)
        
        // Generate QR code for Google Authenticator
        const qrCode = this.generateTOTPQR(username, totpSecret)
        
        return { 
          success: true, 
          user: response.data,
          qrCode 
        }
      }

      return { success: false, error: response.error || 'Registration failed' }
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' }
    }
  }

  async login(recoveryHash: string, securityCode: string, totpCode: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const deviceInfo = await this.initializeDeviceInfo()
      
      // Get stored TOTP secret
      const storedSecret = await AsyncStorage.getItem(STORAGE_KEYS.TOTP_SECRET)
      if (!storedSecret) {
        return { success: false, error: 'No TOTP secret found. Please register first.' }
      }

      // Verify TOTP code
      if (!this.verifyTOTP(totpCode, storedSecret)) {
        return { success: false, error: 'Invalid TOTP code' }
      }

      const authData: AuthData = {
        recoveryHash,
        securityCode,
        totpCode,
        deviceFingerprint: deviceInfo.fingerprint,
      }

      const response = await apiService.login(authData)

      if (response.success && response.data) {
        // Store user data locally
        await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data))
        
        return { success: true, user: response.data }
      }

      return { success: false, error: response.error || 'Login failed' }
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([STORAGE_KEYS.USER, STORAGE_KEYS.TOTP_SECRET])
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER)
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser()
    return !!user
  }

  async getDeviceInfo(): Promise<DeviceInfoType | null> {
    if (this.deviceInfo) {
      return this.deviceInfo
    }

    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_INFO)
      if (stored) {
        this.deviceInfo = JSON.parse(stored)
        return this.deviceInfo
      }
    } catch (error) {
      console.error('Error getting device info:', error)
    }

    return null
  }
}

export const authService = new AuthService()