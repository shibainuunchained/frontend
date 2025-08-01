export const formatAddress = (address: string, startChars = 6, endChars = 4): string => {
  if (!address) return ''
  if (address.length <= startChars + endChars) return address
  
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
}

export const formatBalance = (balance: string | number, decimals = 18, displayDecimals = 4): string => {
  if (!balance) return '0'
  
  const balanceNumber = typeof balance === 'string' ? parseFloat(balance) : balance
  
  if (balanceNumber === 0) return '0'
  
  // Convert from wei/smallest unit
  const convertedBalance = balanceNumber / Math.pow(10, decimals)
  
  // Format to display decimals
  return convertedBalance.toFixed(displayDecimals).replace(/\.?0+$/, '')
}

export const formatCurrency = (amount: string | number, currency = 'USD'): string => {
  const amountNumber = typeof amount === 'string' ? parseFloat(amount) : amount
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountNumber)
}

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000) // Convert from Unix timestamp
  
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now()
  const diffMs = now - (timestamp * 1000)
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return formatDate(timestamp)
}

export const formatTokenAmount = (amount: string, symbol: string, decimals = 18): string => {
  const formatted = formatBalance(amount, decimals)
  return `${formatted} ${symbol}`
}

export const validateAddress = (address: string, chain: string): boolean => {
  if (!address) return false
  
  switch (chain) {
    case 'ETH':
    case 'BNB':
    case 'MATIC':
      // EVM address validation
      return /^0x[a-fA-F0-9]{40}$/.test(address)
    case 'BTC':
      // Bitcoin address validation (simplified)
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || 
             /^bc1[a-z0-9]{39,59}$/.test(address)
    case 'TRX':
      // Tron address validation
      return /^T[A-Za-z1-9]{33}$/.test(address)
    default:
      return false
  }
}

export const parseAmount = (amount: string, decimals = 18): string => {
  if (!amount) return '0'
  
  const amountNumber = parseFloat(amount)
  if (isNaN(amountNumber)) return '0'
  
  // Convert to wei/smallest unit
  const result = (amountNumber * Math.pow(10, decimals)).toString()
  return result
}