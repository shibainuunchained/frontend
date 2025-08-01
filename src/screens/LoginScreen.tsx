import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { darkTheme } from '../theme/darkTheme'
import { authService } from '../services/authService'

interface LoginScreenProps {
  navigation: any
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    recoveryHash: '',
    securityCode: '',
    totpCode: '',
  })
  const [errors, setErrors] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.recoveryHash.trim()) {
      newErrors.recoveryHash = 'Recovery hash is required'
    } else if (formData.recoveryHash.length !== 108) {
      newErrors.recoveryHash = 'Recovery hash must be exactly 108 characters'
    }

    if (!formData.securityCode.trim()) {
      newErrors.securityCode = 'Security code is required'
    }

    if (!formData.totpCode.trim()) {
      newErrors.totpCode = 'TOTP code is required'
    } else if (formData.totpCode.length !== 6) {
      newErrors.totpCode = 'TOTP code must be 6 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const result = await authService.login(
        formData.recoveryHash,
        formData.securityCode,
        formData.totpCode
      )

      if (result.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Dashboard' }],
        })
      } else {
        Alert.alert('Login Failed', result.error || 'Invalid credentials')
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.brand}>SHIBAU</Text>
              <Text style={styles.brandSubtitle}>WALLET</Text>
            </View>

            <Card variant="glass" style={styles.formCard}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>
                Sign in to access your secure wallet
              </Text>

              <Input
                label="Recovery Hash (108 characters)"
                value={formData.recoveryHash}
                onChangeText={(text) => setFormData({ ...formData, recoveryHash: text })}
                error={errors.recoveryHash}
                placeholder="Enter your 108-character recovery hash"
                multiline
                style={styles.recoveryInput}
              />

              <Input
                label="Security Code"
                value={formData.securityCode}
                onChangeText={(text) => setFormData({ ...formData, securityCode: text })}
                error={errors.securityCode}
                placeholder="Enter your security code"
                secureTextEntry
              />

              <Input
                label="Google Authenticator Code"
                value={formData.totpCode}
                onChangeText={(text) => setFormData({ ...formData, totpCode: text })}
                error={errors.totpCode}
                placeholder="000000"
                keyboardType="numeric"
                maxLength={6}
              />

              <Button
                title="Login"
                onPress={handleLogin}
                loading={isLoading}
                style={styles.loginButton}
              />
            </Card>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don't have an account?
              </Text>
              <Button
                title="Create New Wallet"
                onPress={() => navigation.navigate('Register')}
                variant="outline"
                style={styles.registerButton}
              />
            </View>

            <View style={styles.securityNote}>
              <Text style={styles.securityText}>
                🔒 Your wallet is secured with device binding and 2FA authentication
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: darkTheme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: darkTheme.spacing.xxl,
  },
  brand: {
    fontSize: darkTheme.fontSizes.xxxl,
    fontFamily: darkTheme.fonts.heading,
    color: darkTheme.colors.primary,
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.secondary,
    letterSpacing: 4,
    marginTop: darkTheme.spacing.xs,
  },
  formCard: {
    marginBottom: darkTheme.spacing.xl,
  },
  title: {
    fontSize: darkTheme.fontSizes.xxl,
    fontFamily: darkTheme.fonts.heading,
    color: darkTheme.colors.text,
    textAlign: 'center',
    marginBottom: darkTheme.spacing.sm,
  },
  subtitle: {
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: darkTheme.spacing.xl,
  },
  recoveryInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  loginButton: {
    marginTop: darkTheme.spacing.lg,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
    marginBottom: darkTheme.spacing.md,
  },
  registerButton: {
    width: '100%',
  },
  securityNote: {
    marginTop: darkTheme.spacing.xl,
    padding: darkTheme.spacing.md,
    backgroundColor: darkTheme.colors.glass,
    borderRadius: darkTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: darkTheme.colors.glassLight,
  },
  securityText: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
    textAlign: 'center',
  },
})