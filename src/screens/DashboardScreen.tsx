import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { ChainCard } from '../components/ChainCard'
import { darkTheme } from '../theme/darkTheme'
import { useWallet } from '../hooks/useWallet'
import { authService } from '../services/authService'
import { CHAIN_CONFIGS, SUPPORTED_CHAINS } from '../utils/chainConfig'
import { formatCurrency } from '../utils/formatters'

interface DashboardScreenProps {
  navigation: any
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const {
    user,
    isLoading,
    error,
    refreshWalletData,
    getChainBalance,
    getTotalPortfolioValue,
  } = useWallet()
  
  const [refreshing, setRefreshing] = useState(false)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshWalletData()
    setRefreshing(false)
  }

  const handleChainPress = (chain: string) => {
    navigation.navigate('ChainDetail', { chain })
  }

  const handleSend = () => {
    navigation.navigate('Send')
  }

  const handleReceive = () => {
    navigation.navigate('Receive')
  }

  const handleSettings = () => {
    navigation.navigate('Settings')
  }

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authService.logout()
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })
          },
        },
      ]
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <Button title="Retry" onPress={refreshWalletData} />
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={darkTheme.colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back</Text>
            <Text style={styles.username}>{user?.username || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={handleSettings} style={styles.settingsButton}>
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Portfolio Overview */}
        <Card variant="glass" style={styles.portfolioCard}>
          <Text style={styles.portfolioLabel}>Total Portfolio Value</Text>
          <Text style={styles.portfolioValue}>
            {formatCurrency(getTotalPortfolioValue())}
          </Text>
          <Text style={styles.portfolioChange}>+0.00% (24h)</Text>
        </Card>

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSend}>
            <View style={[styles.actionIcon, { backgroundColor: darkTheme.colors.secondary }]}>
              <Text style={styles.actionIconText}>↗</Text>
            </View>
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleReceive}>
            <View style={[styles.actionIcon, { backgroundColor: darkTheme.colors.primary }]}>
              <Text style={styles.actionIconText}>↙</Text>
            </View>
            <Text style={styles.actionText}>Receive</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('History')}>
            <View style={[styles.actionIcon, { backgroundColor: '#4caf50' }]}>
              <Text style={styles.actionIconText}>📋</Text>
            </View>
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <View style={[styles.actionIcon, { backgroundColor: '#f44336' }]}>
              <Text style={styles.actionIconText}>🚪</Text>
            </View>
            <Text style={styles.actionText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Chain Wallets */}
        <View style={styles.chainsSection}>
          <Text style={styles.sectionTitle}>Your Wallets</Text>
          
          {SUPPORTED_CHAINS.map((chain) => {
            const config = CHAIN_CONFIGS[chain]
            const balance = getChainBalance(chain)
            
            return (
              <ChainCard
                key={chain}
                chain={chain}
                chainName={config.name}
                nativeSymbol={config.symbol}
                balance={balance}
                address={user?.walletAddress || ''}
                onPress={() => handleChainPress(chain)}
              />
            )
          })}
        </View>

        {/* Security Note */}
        <Card variant="default" style={styles.securityCard}>
          <Text style={styles.securityTitle}>🔒 Security</Text>
          <Text style={styles.securityText}>
            Your wallet is protected with device binding and 2FA authentication. 
            Never share your recovery hash or security code.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: darkTheme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: darkTheme.spacing.xl,
  },
  welcomeText: {
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
  },
  username: {
    fontSize: darkTheme.fontSizes.xxl,
    fontFamily: darkTheme.fonts.heading,
    color: darkTheme.colors.text,
  },
  settingsButton: {
    padding: darkTheme.spacing.sm,
  },
  settingsIcon: {
    fontSize: darkTheme.fontSizes.xl,
  },
  portfolioCard: {
    alignItems: 'center',
    marginBottom: darkTheme.spacing.xl,
  },
  portfolioLabel: {
    fontSize: darkTheme.fontSizes.md,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
    marginBottom: darkTheme.spacing.sm,
  },
  portfolioValue: {
    fontSize: darkTheme.fontSizes.xxxl,
    fontFamily: darkTheme.fonts.heading,
    color: darkTheme.colors.text,
    marginBottom: darkTheme.spacing.xs,
  },
  portfolioChange: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.success,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: darkTheme.spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: darkTheme.spacing.sm,
    ...darkTheme.shadows.medium,
  },
  actionIconText: {
    fontSize: darkTheme.fontSizes.xl,
    color: 'white',
  },
  actionText: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.text,
  },
  chainsSection: {
    marginBottom: darkTheme.spacing.xl,
  },
  sectionTitle: {
    fontSize: darkTheme.fontSizes.xl,
    fontFamily: darkTheme.fonts.heading,
    color: darkTheme.colors.text,
    marginBottom: darkTheme.spacing.lg,
  },
  securityCard: {
    marginBottom: darkTheme.spacing.xl,
  },
  securityTitle: {
    fontSize: darkTheme.fontSizes.lg,
    fontFamily: darkTheme.fonts.bold,
    color: darkTheme.colors.text,
    marginBottom: darkTheme.spacing.sm,
  },
  securityText: {
    fontSize: darkTheme.fontSizes.sm,
    fontFamily: darkTheme.fonts.regular,
    color: darkTheme.colors.textSecondary,
    lineHeight: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: darkTheme.spacing.xl,
  },
  errorText: {
    fontSize: darkTheme.fontSizes.lg,
    fontFamily: darkTheme.fonts.medium,
    color: darkTheme.colors.error,
    textAlign: 'center',
    marginBottom: darkTheme.spacing.lg,
  },
})