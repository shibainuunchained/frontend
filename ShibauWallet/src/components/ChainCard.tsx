import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Card } from './Card'
import { darkTheme } from '../theme/darkTheme'
import { formatBalance, formatAddress } from '../utils/formatters'
import { SupportedChain } from '../types'

interface ChainCardProps {
  chain: SupportedChain
  chainName: string
  nativeSymbol: string
  balance: string
  address: string
  onPress: () => void
}

export const ChainCard: React.FC<ChainCardProps> = ({
  chain,
  chainName,
  nativeSymbol,
  balance,
  address,
  onPress,
}) => {
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

  const getChainIcon = (chain: SupportedChain) => {
    // For now, using text symbols. In production, use actual chain icons
    switch (chain) {
      case 'ETH':
        return 'Ξ'
      case 'BNB':
        return 'BNB'
      case 'MATIC':
        return '◊'
      case 'BTC':
        return '₿'
      case 'TRX':
        return 'TRX'
      default:
        return '◦'
    }
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card variant="elevated" style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.chainIcon, { backgroundColor: getChainColor(chain) }]}>
            <Text style={styles.chainIconText}>{getChainIcon(chain)}</Text>
          </View>
          <View style={styles.chainInfo}>
            <Text style={styles.chainName}>{chainName}</Text>
            <Text style={styles.address}>{formatAddress(address)}</Text>
          </View>
          <View style={styles.balanceContainer}>
            <Text style={styles.balance}>
              {formatBalance(balance, 18, 4)} {nativeSymbol}
            </Text>
            <Text style={styles.balanceUsd}>~$0.00</Text>
          </View>
        </View>
        
        <View style={styles.footer}>
          <Text style={styles.footerText}>Tap to view tokens and transactions</Text>
        </View>
      </Card>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: darkTheme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: darkTheme.spacing.md,
  },
  chainIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: darkTheme.spacing.md,
  },
  chainIconText: {
    color: 'white',
    fontSize: darkTheme.fontSizes.lg,
    fontFamily: darkTheme.fonts.bold,
  },
  chainInfo: {
    flex: 1,
  },
  chainName: {
    fontSize: darkTheme.fontSizes.lg,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.text,
    marginBottom: 2,
  },
  address: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
  },
  balanceContainer: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: darkTheme.fontSizes.lg,
    fontFamily: darkTheme.fonts.bold,
    color: darkTheme.colors.text,
    marginBottom: 2,
  },
  balanceUsd: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: darkTheme.colors.border,
    paddingTop: darkTheme.spacing.sm,
  },
  footerText: {
    fontSize: darkTheme.fontSizes.xs,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textMuted,
    textAlign: 'center',
  },
})