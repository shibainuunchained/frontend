import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native'
import { Card } from '../components/Card'
import { darkTheme } from '../theme/darkTheme'
import { useWallet } from '../hooks/useWallet'
import { apiService } from '../services/apiService'
import { formatTimeAgo, formatBalance, formatAddress } from '../utils/formatters'
import { CHAIN_CONFIGS, SUPPORTED_CHAINS } from '../utils/chainConfig'
import { Transaction, SupportedChain } from '../types'

interface TransactionHistoryScreenProps {
  navigation: any
}

export const TransactionHistoryScreen: React.FC<TransactionHistoryScreenProps> = ({ navigation }) => {
  const { user } = useWallet()
  const [selectedChain, setSelectedChain] = useState<SupportedChain>('ETH')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const loadTransactions = async (chain: SupportedChain) => {
    if (!user) return

    setIsLoading(true)
    try {
      const response = await apiService.getTransactionHistory(user.walletAddress, chain)
      if (response.success && response.data) {
        setTransactions(response.data)
      }
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadTransactions(selectedChain)
    setRefreshing(false)
  }

  const handleChainChange = (chain: SupportedChain) => {
    setSelectedChain(chain)
    loadTransactions(chain)
  }

  useEffect(() => {
    loadTransactions(selectedChain)
  }, [selectedChain, user])

  const getTransactionIcon = (transaction: Transaction) => {
    const isReceived = transaction.to === user?.walletAddress
    return isReceived ? '↙️' : '↗️'
  }

  const getTransactionType = (transaction: Transaction) => {
    const isReceived = transaction.to === user?.walletAddress
    return isReceived ? 'Received' : 'Sent'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return darkTheme.colors.success
      case 'pending':
        return darkTheme.colors.warning
      case 'failed':
        return darkTheme.colors.error
      default:
        return darkTheme.colors.textSecondary
    }
  }

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <Card variant="default" style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionIcon}>
          <Text style={styles.iconText}>{getTransactionIcon(item)}</Text>
        </View>
        
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionType}>{getTransactionType(item)}</Text>
          <Text style={styles.transactionTime}>{formatTimeAgo(item.timestamp)}</Text>
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={styles.amountText}>
            {item.token 
              ? formatBalance(item.value, item.token.decimals, 4) + ' ' + item.token.symbol
              : formatBalance(item.value, 18, 4) + ' ' + CHAIN_CONFIGS[item.chain].symbol
            }
          </Text>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
      
      <View style={styles.transactionDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>From:</Text>
          <Text style={styles.detailValue}>{formatAddress(item.from)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>To:</Text>
          <Text style={styles.detailValue}>{formatAddress(item.to)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Hash:</Text>
          <TouchableOpacity
            onPress={() => {
              // Open explorer URL
              const explorerUrl = `${CHAIN_CONFIGS[item.chain].explorerUrl}/tx/${item.hash}`
              console.log('Open explorer:', explorerUrl)
            }}
          >
            <Text style={[styles.detailValue, styles.hashLink]}>{formatAddress(item.hash)}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  )

  const renderChainSelector = () => (
    <View style={styles.chainSelector}>
      <FlatList
        data={SUPPORTED_CHAINS}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.chainButton,
              selectedChain === item && styles.chainButtonSelected,
            ]}
            onPress={() => handleChainChange(item)}
          >
            <Text style={[
              styles.chainButtonText,
              selectedChain === item && styles.chainButtonTextSelected,
            ]}>
              {CHAIN_CONFIGS[item].symbol}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📝</Text>
      <Text style={styles.emptyTitle}>No Transactions</Text>
      <Text style={styles.emptyText}>
        You haven't made any transactions on {CHAIN_CONFIGS[selectedChain].name} yet.
      </Text>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction History</Text>
        <Text style={styles.subtitle}>
          View your recent transactions on {CHAIN_CONFIGS[selectedChain].name}
        </Text>
      </View>

      {renderChainSelector()}

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.hash}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={darkTheme.colors.primary}
          />
        }
        ListEmptyComponent={!isLoading ? renderEmptyState : null}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.colors.background,
  },
  header: {
    padding: darkTheme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: darkTheme.fontSizes.xxl,
    fontFamily: darkTheme.fonts.heading,
    color: darkTheme.colors.text,
    marginBottom: darkTheme.spacing.sm,
  },
  subtitle: {
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
    textAlign: 'center',
  },
  chainSelector: {
    paddingHorizontal: darkTheme.spacing.lg,
    marginBottom: darkTheme.spacing.md,
  },
  chainButton: {
    paddingHorizontal: darkTheme.spacing.md,
    paddingVertical: darkTheme.spacing.sm,
    marginRight: darkTheme.spacing.sm,
    backgroundColor: darkTheme.colors.inputBackground,
    borderRadius: darkTheme.borderRadius.md,
    borderWidth: 1,
    borderColor: darkTheme.colors.border,
  },
  chainButtonSelected: {
    backgroundColor: darkTheme.colors.primary,
    borderColor: darkTheme.colors.primary,
  },
  chainButtonText: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.text,
  },
  chainButtonTextSelected: {
    color: darkTheme.colors.background,
  },
  listContent: {
    padding: darkTheme.spacing.lg,
    paddingTop: 0,
    flexGrow: 1,
  },
  transactionCard: {
    marginBottom: darkTheme.spacing.md,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: darkTheme.spacing.md,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: darkTheme.colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: darkTheme.spacing.md,
  },
  iconText: {
    fontSize: darkTheme.fontSizes.lg,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.text,
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.bold,
    color: darkTheme.colors.text,
    marginBottom: 2,
  },
  statusText: {
    fontSize: darkTheme.fontSizes.xs,
    fontFamily: darkTheme.fonts.medium,
  },
  transactionDetails: {
    borderTopWidth: 1,
    borderTopColor: darkTheme.colors.border,
    paddingTop: darkTheme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: darkTheme.spacing.sm,
  },
  detailLabel: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.textSecondary,
  },
  detailValue: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.text,
  },
  hashLink: {
    color: darkTheme.colors.primary,
    textDecorationLine: 'underline',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: darkTheme.spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: darkTheme.spacing.lg,
  },
  emptyTitle: {
    fontSize: darkTheme.fontSizes.xl,
    fontFamily: darkTheme.fonts.heading,
    color: darkTheme.colors.text,
    marginBottom: darkTheme.spacing.sm,
  },
  emptyText: {
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
  },
})