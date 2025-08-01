import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { Input } from '../components/Input'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { darkTheme } from '../theme/darkTheme'
import { useWallet } from '../hooks/useWallet'
import { apiService } from '../services/apiService'
import { authService } from '../services/authService'
import { validateAddress, parseAmount, formatBalance } from '../utils/formatters'
import { CHAIN_CONFIGS, SUPPORTED_CHAINS } from '../utils/chainConfig'
import { SupportedChain, Token } from '../types'

interface SendScreenProps {
  navigation: any
}

export const SendScreen: React.FC<SendScreenProps> = ({ navigation }) => {
  const { user, getChainBalance, getChainTokens } = useWallet()
  
  const [selectedChain, setSelectedChain] = useState<SupportedChain>('ETH')
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [totpCode, setTotpCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState(1) // 1: Form, 2: Confirmation, 3: 2FA
  const [errors, setErrors] = useState<any>({})

  const chainTokens = getChainTokens(selectedChain)
  const nativeBalance = getChainBalance(selectedChain)

  const validateForm = () => {
    const newErrors: any = {}

    if (!recipient.trim()) {
      newErrors.recipient = 'Recipient address is required'
    } else if (!validateAddress(recipient, selectedChain)) {
      newErrors.recipient = 'Invalid address for selected chain'
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required'
    } else if (parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    } else {
      const balance = selectedToken 
        ? selectedToken.balance 
        : nativeBalance
      
      if (parseFloat(amount) > parseFloat(formatBalance(balance, selectedToken?.decimals || 18))) {
        newErrors.amount = 'Insufficient balance'
      }
    }

    if (step === 3 && !totpCode.trim()) {
      newErrors.totpCode = 'TOTP code is required'
    } else if (step === 3 && totpCode.length !== 6) {
      newErrors.totpCode = 'TOTP code must be 6 digits'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleContinue = () => {
    if (!validateForm()) return

    if (step === 1) {
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    }
  }

  const handleSend = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    try {
      const response = await apiService.sendTransaction({
        from: user?.walletAddress || '',
        to: recipient,
        amount: parseAmount(amount, selectedToken?.decimals || 18),
        chain: selectedChain,
        token: selectedToken?.address,
        totpCode,
      })

      if (response.success) {
        Alert.alert(
          'Transaction Sent',
          'Your transaction has been submitted successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigation.goBack()
              },
            },
          ]
        )
      } else {
        Alert.alert('Error', response.error || 'Transaction failed')
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Transaction failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    if (step === 1) {
      navigation.goBack()
    } else {
      setStep(step - 1)
    }
  }

  const renderChainSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Select Chain</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chainList}>
        {SUPPORTED_CHAINS.map((chain) => (
          <TouchableOpacity
            key={chain}
            style={[
              styles.chainOption,
              selectedChain === chain && styles.chainOptionSelected,
            ]}
            onPress={() => {
              setSelectedChain(chain)
              setSelectedToken(null)
            }}
          >
            <Text style={[
              styles.chainOptionText,
              selectedChain === chain && styles.chainOptionTextSelected,
            ]}>
              {CHAIN_CONFIGS[chain].symbol}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )

  const renderTokenSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Select Token</Text>
      <TouchableOpacity
        style={[
          styles.tokenOption,
          !selectedToken && styles.tokenOptionSelected,
        ]}
        onPress={() => setSelectedToken(null)}
      >
        <Text style={[
          styles.tokenOptionText,
          !selectedToken && styles.tokenOptionTextSelected,
        ]}>
          {CHAIN_CONFIGS[selectedChain].symbol} (Native)
        </Text>
        <Text style={styles.tokenBalance}>
          {formatBalance(nativeBalance, 18, 4)}
        </Text>
      </TouchableOpacity>

      {chainTokens.map((token) => (
        <TouchableOpacity
          key={token.address}
          style={[
            styles.tokenOption,
            selectedToken?.address === token.address && styles.tokenOptionSelected,
          ]}
          onPress={() => setSelectedToken(token)}
        >
          <Text style={[
            styles.tokenOptionText,
            selectedToken?.address === token.address && styles.tokenOptionTextSelected,
          ]}>
            {token.symbol}
          </Text>
          <Text style={styles.tokenBalance}>
            {formatBalance(token.balance, token.decimals, 4)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )

  const renderStep1 = () => (
    <>
      <Text style={styles.title}>Send Transaction</Text>
      <Text style={styles.subtitle}>
        Select the chain, token, and enter transaction details
      </Text>

      {renderChainSelector()}
      {renderTokenSelector()}

      <Input
        label="Recipient Address"
        value={recipient}
        onChangeText={setRecipient}
        error={errors.recipient}
        placeholder={`Enter ${selectedChain} address`}
        autoCapitalize="none"
      />

      <Input
        label={`Amount (${selectedToken?.symbol || CHAIN_CONFIGS[selectedChain].symbol})`}
        value={amount}
        onChangeText={setAmount}
        error={errors.amount}
        placeholder="0.00"
        keyboardType="decimal-pad"
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
      <Text style={styles.title}>Confirm Transaction</Text>
      <Text style={styles.subtitle}>
        Please review the transaction details
      </Text>

      <Card variant="elevated" style={styles.confirmationCard}>
        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>From:</Text>
          <Text style={styles.confirmationValue}>
            {user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : 'N/A'}
          </Text>
        </View>

        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>To:</Text>
          <Text style={styles.confirmationValue}>
            {`${recipient.slice(0, 6)}...${recipient.slice(-4)}`}
          </Text>
        </View>

        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Amount:</Text>
          <Text style={styles.confirmationValue}>
            {amount} {selectedToken?.symbol || CHAIN_CONFIGS[selectedChain].symbol}
          </Text>
        </View>

        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Network:</Text>
          <Text style={styles.confirmationValue}>
            {CHAIN_CONFIGS[selectedChain].name}
          </Text>
        </View>

        <View style={styles.confirmationRow}>
          <Text style={styles.confirmationLabel}>Estimated Fee:</Text>
          <Text style={styles.confirmationValue}>
            ~0.001 {CHAIN_CONFIGS[selectedChain].symbol}
          </Text>
        </View>
      </Card>

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          onPress={handleBack}
          variant="outline"
          style={styles.halfButton}
        />
        <Button
          title="Continue"
          onPress={handleContinue}
          style={styles.halfButton}
        />
      </View>
    </>
  )

  const renderStep3 = () => (
    <>
      <Text style={styles.title}>Authenticate Transaction</Text>
      <Text style={styles.subtitle}>
        Enter your Google Authenticator code to confirm
      </Text>

      <Input
        label="Google Authenticator Code"
        value={totpCode}
        onChangeText={setTotpCode}
        error={errors.totpCode}
        placeholder="000000"
        keyboardType="numeric"
        maxLength={6}
      />

      <View style={styles.buttonRow}>
        <Button
          title="Back"
          onPress={handleBack}
          variant="outline"
          style={styles.halfButton}
        />
        <Button
          title="Send Transaction"
          onPress={handleSend}
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
          <Card variant="glass" style={styles.formCard}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </Card>
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
    padding: darkTheme.spacing.lg,
  },
  formCard: {
    flex: 1,
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
  selectorContainer: {
    marginBottom: darkTheme.spacing.lg,
  },
  selectorLabel: {
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.text,
    marginBottom: darkTheme.spacing.sm,
  },
  chainList: {
    flexDirection: 'row',
  },
  chainOption: {
    paddingHorizontal: darkTheme.spacing.md,
    paddingVertical: darkTheme.spacing.sm,
    marginRight: darkTheme.spacing.sm,
    backgroundColor: darkTheme.colors.inputBackground,
    borderRadius: darkTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
  },
  chainOptionSelected: {
    backgroundColor: darkTheme.colors.primary,
    borderColor: darkTheme.colors.primary,
  },
  chainOptionText: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.text,
  },
  chainOptionTextSelected: {
    color: darkTheme.colors.background,
  },
  tokenOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: darkTheme.spacing.md,
    paddingVertical: darkTheme.spacing.md,
    marginBottom: darkTheme.spacing.sm,
    backgroundColor: darkTheme.colors.inputBackground,
    borderRadius: darkTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
  },
  tokenOptionSelected: {
    backgroundColor: darkTheme.colors.primary,
    borderColor: darkTheme.colors.primary,
  },
  tokenOptionText: {
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.text,
  },
  tokenOptionTextSelected: {
    color: darkTheme.colors.background,
  },
  tokenBalance: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
  },
  button: {
    marginTop: darkTheme.spacing.lg,
  },
  confirmationCard: {
    marginBottom: darkTheme.spacing.xl,
  },
  confirmationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: darkTheme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: darkTheme.colors.border,
  },
  confirmationLabel: {
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.textSecondary,
  },
  confirmationValue: {
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.text,
    textAlign: 'right',
    flex: 1,
    marginLeft: darkTheme.spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: darkTheme.spacing.lg,
  },
  halfButton: {
    flex: 0.48,
  },
})