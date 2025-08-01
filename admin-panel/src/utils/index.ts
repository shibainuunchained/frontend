// Format balance with proper decimals and commas
export const formatBalance = (balance: string, decimals: number = 18): string => {
  try {
    const num = parseFloat(balance) / Math.pow(10, decimals);
    if (num === 0) return '0';
    if (num < 0.000001) return '< 0.000001';
    if (num < 1) return num.toFixed(6);
    if (num < 1000) return num.toFixed(4);
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
  } catch {
    return '0';
  }
};

// Shorten address for display
export const shortenAddress = (address: string, startLength: number = 6, endLength: number = 4): string => {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

// Format date for display
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
};

// Format USD value
export const formatUSD = (value: number): string => {
  if (value === 0) return '$0.00';
  if (value < 0.01) return '< $0.01';
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Copy to clipboard
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

// Get explorer URL for transaction hash
export const getExplorerUrl = (chain: string, txHash: string): string => {
  const explorers = {
    ETH: `https://etherscan.io/tx/${txHash}`,
    BTC: `https://blockstream.info/tx/${txHash}`,
    BNB: `https://bscscan.com/tx/${txHash}`,
    MATIC: `https://polygonscan.com/tx/${txHash}`,
    TRX: `https://tronscan.org/#/transaction/${txHash}`
  };
  return explorers[chain as keyof typeof explorers] || '#';
};

// Get chain color for UI
export const getChainColor = (chain: string): string => {
  const colors = {
    ETH: '#627EEA',
    BTC: '#F7931A',
    BNB: '#F3BA2F',
    MATIC: '#8247E5',
    TRX: '#FF060A'
  };
  return colors[chain as keyof typeof colors] || '#666666';
};

// Validate email
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate random color for charts
export const generateChartColors = (count: number): string[] => {
  const colors = [
    '#d4af37', '#ff9100', '#627EEA', '#F7931A', '#F3BA2F',
    '#8247E5', '#FF060A', '#00D4AA', '#FD6A85', '#9C88FF'
  ];
  return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
};