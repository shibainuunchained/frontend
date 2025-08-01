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
import QRCodeSVG from 'react-native-qrcode-svg'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { darkTheme } from '../theme/darkTheme'
import { authService } from '../services/authService'

interface RegisterScreenProps {
  navigation: any
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    username: '',
    securityCode: '',
    recoveryHash: '',
    totpCode: '',
  })
  const [errors, setErrors] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)
  const [qrCode, setQrCode] = useState<string>('')
  const [step, setStep] = useState(1) // 1: Form, 2: QR Code, 3: Verification

  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }

    if (!formData.securityCode.trim()) {
      newErrors.securityCode = 'Security code is required'
    } else if (formData.securityCode.length < 6) {
      newErrors.securityCode = 'Security code must be at least 6 characters'
    }

    if (!formData.recoveryHash.trim()) {
      newErrors.recoveryHash = 'Recovery hash is required'
    } else if (formData.recoveryHash.length !== 108) {
      newErrors.recoveryHash = 'Recovery hash must be exactly 108 characters'
    }

    if (step === 3 && !formData.totpCode.trim()) {
      newErrors.totpCode = 'TOTP code is required'
    } else if (step === 3 && formData.totpCode.length !== 6) {
      newErrors.totpCode = 'TOTP code must be 6 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = async () => {
    if (!validateForm()) return

    if (step === 1) {
      // Generate QR code for Google Authenticator
      try {
        const secret = authService.generateTOTPSecret()
        const qrCodeData = authService.generateTOTPQR(formData.username, secret)
        setQrCode(qrCodeData)
        setStep(2)
      } catch (error) {
        Alert.alert('Error', 'Failed to generate QR code')
      }
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handleRegister = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const result = await authService.register(
        formData.username,
        formData.securityCode,
        formData.recoveryHash,
        formData.totpCode
      )

      if (result.success) {
        Alert.alert(
          'Success',
          'Registration successful! You can now log in.',
          [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
        )
      } else {
        Alert.alert('Error', result.error || 'Registration failed')
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <>
      <Text style={styles.title}>Create Your Wallet</Text>
      <Text style={styles.subtitle}>
        Enter your details to create a secure multi-chain wallet
      </Text>

      <Input
        label="Username"
        value={formData.username}
        onChangeText={(text) => setFormData({ ...formData, username: text })}
        error={errors.username}
        placeholder="Enter your username"
        autoCapitalize="none"
      />

      <Input
        label="Security Code"
        value={formData.securityCode}
        onChangeText={(text) => setFormData({ ...formData, securityCode: text })}
        error={errors.securityCode}
        placeholder="Create a security code"
        secureTextEntry
      />

      <Input
        label="Recovery Hash (108 characters)"
        value={formData.recoveryHash}
        onChangeText={(text) => setFormData({ ...formData, recoveryHash: text })}
        error={errors.recoveryHash}
        placeholder="Enter your 108-character recovery hash"
        multiline
        style={styles.recoveryInput}
      />

      <Button
        title="Continue"
        onPress={handleContinue}
        style={styles.button}
      />
    </>
  )

  const renderStep2 = () => (
    <>
      <Text style={styles.title}>Setup 2FA</Text>
      <Text style={styles.subtitle}>
        Scan this QR code with Google Authenticator
      </Text>

      <Card variant="elevated" style={styles.qrCard}>
        <View style={styles.qrContainer}>
          {qrCode && (
            <QRCodeSVG
              value={qrCode}
              size={200}
              backgroundColor="white"
              color="black"
            />
          )}
        </View>
        <Text style={styles.qrInstructions}>
          1. Open Google Authenticator app{'\n'}
          2. Tap the + button{'\n'}
          3. Scan this QR code{'\n'}
          4. Your account will be added
        </Text>
      </Card>

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          onPress={() => setStep(1)}
          variant="outline"
          style={styles.halfButton}
        />
        <Button
          title="Next"
          onPress={handleContinue}
          style={styles.halfButton}
        />
      </View>
    </>
  )

  const renderStep3 = () => (
    <>
      <Text style={styles.title}>Verify 2FA</Text>
      <Text style={styles.subtitle}>
        Enter the 6-digit code from Google Authenticator
      </Text>

      <Input
        label="TOTP Code"
        value={formData.totpCode}
        onChangeText={(text) => setFormData({ ...formData, totpCode: text })}
        error={errors.totpCode}
        placeholder="000000"
        keyboardType="numeric"
        maxLength={6}
      />

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          onPress={() => setStep(2)}
          variant="outline"
          style={styles.halfButton}
        />
        <Button
          title="Register"
          onPress={handleRegister}
          loading={isLoading}
          style={styles.halfButton}
        />
      </View>
    </>
  )

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
              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
            </Card>

            <Button
              title="Already have an account? Login"
              onPress={() => navigation.navigate('Login')}
              variant="outline"
              style={styles.loginButton}
            />
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
  button: {
    marginTop: darkTheme.spacing.lg,
  },
  qrCard: {
    alignItems: 'center',
    marginBottom: darkTheme.spacing.xl,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: darkTheme.spacing.md,
    borderRadius: darkTheme.borderRadius.md,
    marginBottom: darkTheme.spacing.lg,
  },
  qrInstructions: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: darkTheme.spacing.lg,
  },
  halfButton: {
    flex: 0.48,
  },
  loginButton: {
    marginTop: darkTheme.spacing.md,
  },
})