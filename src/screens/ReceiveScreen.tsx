import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Clipboard,
} from 'react-native'
import QRCodeSVG from 'react-native-qrcode-svg'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { darkTheme } from '../theme/darkTheme'
import { useWallet } from '../hooks/useWallet'
import { CHAIN_CONFIGS, SUPPORTED_CHAINS } from '../utils/chainConfig'
import { SupportedChain } from '../types'

interface ReceiveScreenProps {
  navigation: any
}

export const ReceiveScreen: React.FC<ReceiveScreenProps> = ({ navigation }) => {
  const { user } = useWallet()
  const [selectedChain, setSelectedChain] = useState<SupportedChain>('ETH')

  const walletAddress = user?.walletAddress || ''

  const handleCopyAddress = async () => {
    try {
      await Clipboard.setString(walletAddress)
      Alert.alert('Copied', 'Wallet address copied to clipboard')
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address')
    }
  }

  const getChainColor = (chain: SupportedChain) => {
    switch (chain) {
      case 'ETH':
        return '#627EEA'
      case 'BNB':
        return '#F3BA2F'
      case 'MATIC':
        return '#8247E5'
      case 'BTC':
        return '#F7931A'
      case 'TRX':
        return '#FF0013'
      default:
        return darkTheme.colors.primary
    }
  }

  const renderChainSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Select Network</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chainList}>
        {SUPPORTED_CHAINS.map((chain) => (
          <TouchableOpacity
            key={chain}
            style={[
              styles.chainOption,
              selectedChain === chain && styles.chainOptionSelected,
              { borderColor: getChainColor(chain) },
              selectedChain === chain && { backgroundColor: getChainColor(chain) },
            ]}
            onPress={() => setSelectedChain(chain)}
          >
            <Text style={[
              styles.chainOptionText,
              selectedChain === chain && styles.chainOptionTextSelected,
            ]}>
              {CHAIN_CONFIGS[chain].name}
            </Text>
            <Text style={[
              styles.chainSymbol,
              selectedChain === chain && styles.chainSymbolSelected,
            ]}>
              {CHAIN_CONFIGS[chain].symbol}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Receive Crypto</Text>
        <Text style={styles.subtitle}>
          Share your wallet address or QR code to receive funds
        </Text>

        {renderChainSelector()}

        <Card variant="elevated" style={styles.qrCard}>
          <View style={styles.qrContainer}>
            <QRCodeSVG
              value={walletAddress}
              size={200}
              backgroundColor="white"
              color="black"
            />
          </View>
          
          <View style={styles.networkBadge}>
            <Text style={styles.networkText}>
              {CHAIN_CONFIGS[selectedChain].name} Network
            </Text>
          </View>
        </Card>

        <Card variant="default" style={styles.addressCard}>
          <Text style={styles.addressLabel}>Your Wallet Address</Text>
          <Text style={styles.addressText} numberOfLines={2}>
            {walletAddress}
          </Text>
          
          <Button
            title="Copy Address"
            onPress={handleCopyAddress}
            variant="outline"
            style={styles.copyButton}
          />
        </Card>

        <Card variant="glass" style={styles.infoCard}>
          <Text style={styles.infoTitle}>Important Information</Text>
          
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🔸</Text>
            <Text style={styles.infoText}>
              Only send {CHAIN_CONFIGS[selectedChain].symbol} and tokens on the {CHAIN_CONFIGS[selectedChain].name} network to this address
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🔸</Text>
            <Text style={styles.infoText}>
              Sending tokens from other networks may result in permanent loss
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🔸</Text>
            <Text style={styles.infoText}>
              This address supports all ERC-20 tokens (for Ethereum), BEP-20 tokens (for BSC), and Polygon tokens
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>🔸</Text>
            <Text style={styles.infoText}>
              Transactions may take a few minutes to appear in your wallet
            </Text>
          </View>
        </Card>

        <Button
          title="Done"
          onPress={() => navigation.goBack()}
          style={styles.doneButton}
        />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: darkTheme.spacing.lg,
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
    marginBottom: darkTheme.spacing.xl,
  },
  selectorLabel: {
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.text,
    marginBottom: darkTheme.spacing.md,
  },
  chainList: {
    flexDirection: 'row',
  },
  chainOption: {
    paddingHorizontal: darkTheme.spacing.md,
    paddingVertical: darkTheme.spacing.md,
    marginRight: darkTheme.spacing.md,
    backgroundColor: darkTheme.colors.inputBackground,
    borderRadius: darkTheme.borderRadius.md,
    borderWidth: 2,
    alignItems: 'center',
    minWidth: 100,
  },
  chainOptionSelected: {
    backgroundColor: darkTheme.colors.primary,
  },
  chainOptionText: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.text,
    textAlign: 'center',
    marginBottom: 2,
  },
  chainOptionTextSelected: {
    color: 'white',
  },
  chainSymbol: {
    fontSize: darkTheme.fontSizes.xs,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
  },
  chainSymbolSelected: {
    color: 'white',
  },
  qrCard: {
    alignItems: 'center',
    marginBottom: darkTheme.spacing.xl,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: darkTheme.spacing.lg,
    borderRadius: darkTheme.borderRadius.lg,
    marginBottom: darkTheme.spacing.md,
    ...darkTheme.shadows.medium,
  },
  networkBadge: {
    backgroundColor: darkTheme.colors.primary,
    paddingHorizontal: darkTheme.spacing.md,
    paddingVertical: darkTheme.spacing.sm,
    borderRadius: darkTheme.borderRadius.round,
  },
  networkText: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.background,
  },
  addressCard: {
    marginBottom: darkTheme.spacing.xl,
  },
  addressLabel: {
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.text,
    marginBottom: darkTheme.spacing.sm,
  },
  addressText: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
    backgroundColor: darkTheme.colors.inputBackground,
    padding: darkTheme.spacing.md,
    borderRadius: darkTheme.borderRadius.md,
    marginBottom: darkTheme.spacing.md,
  },
  copyButton: {
    marginTop: darkTheme.spacing.sm,
  },
  infoCard: {
    marginBottom: darkTheme.spacing.xl,
  },
  infoTitle: {
    fontSize: darkTheme.fontSizes.lg,
    fontFamily: darkTheme.fonts.bold,
    color: darkTheme.colors.text,
    marginBottom: darkTheme.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: darkTheme.spacing.md,
  },
  infoIcon: {
    fontSize: darkTheme.fontSizes.sm,
    marginRight: darkTheme.spacing.sm,
    marginTop: 2,
  },
  infoText: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  doneButton: {
    marginBottom: darkTheme.spacing.xl,
  },
})