import { useState, useEffect } from 'react'
import { User, WalletBalance, Token, SupportedChain } from '../types'
import { apiService } from '../services/apiService'
import { authService } from '../services/authService'
import { SUPPORTED_CHAINS } from '../utils/chainConfig'

export const useWallet = () => {
  const [user, setUser] = useState<User | null>(null)
  const [balances, setBalances] = useState<Record<SupportedChain, WalletBalance | null>>({
    ETH: null,
    BNB: null,
    MATIC: null,
    BTC: null,
    TRX: null,
  })
  const [tokens, setTokens] = useState<Record<SupportedChain, Token[]>>({
    ETH: [],
    BNB: [],
    MATIC: [],
    BTC: [],
    TRX: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUser = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      
      if (currentUser) {
        await loadWalletData(currentUser)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load user data')
    } finally {
      setIsLoading(false)
    }
  }

  const loadWalletData = async (userData: User) => {
    try {
      // Load balances for all supported chains
      const balancePromises = SUPPORTED_CHAINS.map(async (chain) => {
        const response = await apiService.getWalletBalance(userData.walletAddress, chain)
        return { chain, balance: response.data }
      })

      const balanceResults = await Promise.allSettled(balancePromises)
      const newBalances = { ...balances }

      balanceResults.forEach((result, index) => {
        const chain = SUPPORTED_CHAINS[index]
        if (result.status === 'fulfilled' && result.value.balance) {
          newBalances[chain] = result.value.balance
        }
      })

      setBalances(newBalances)

      // Load tokens for EVM chains
      const evmChains: SupportedChain[] = ['ETH', 'BNB', 'MATIC']
      const tokenPromises = evmChains.map(async (chain) => {
        const response = await apiService.getTokens(userData.walletAddress, chain)
        return { chain, tokens: response.data || [] }
      })

      const tokenResults = await Promise.allSettled(tokenPromises)
      const newTokens = { ...tokens }

      tokenResults.forEach((result, index) => {
        const chain = evmChains[index]
        if (result.status === 'fulfilled' && result.value.tokens) {
          newTokens[chain] = result.value.tokens
        }
      })

      setTokens(newTokens)
    } catch (err: any) {
      setError(err.message || 'Failed to load wallet data')
    }
  }

  const refreshWalletData = async () => {
    if (user) {
      setIsLoading(true)
      await loadWalletData(user)
      setIsLoading(false)
    }
  }

  const getChainBalance = (chain: SupportedChain): string => {
    return balances[chain]?.balance || '0'
  }

  const getChainTokens = (chain: SupportedChain): Token[] => {
    return tokens[chain] || []
  }

  const getTotalPortfolioValue = (): number => {
    // Calculate total portfolio value in USD
    // This would require price data from an API
    return 0
  }

  useEffect(() => {
    loadUser()
  }, [])

  return {
    user,
    balances,
    tokens,
    isLoading,
    error,
    refreshWalletData,
    getChainBalance,
    getChainTokens,
    getTotalPortfolioValue,
  }
}