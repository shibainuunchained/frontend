# 🔥 Shibau Wallet - Premium Multi-Chain Mobile Wallet

A production-ready React Native mobile wallet app supporting multiple blockchains with advanced security features.

## ✨ Features

### 🔐 **Security First**
- **Device Binding**: Wallet tied to specific device fingerprint
- **2FA Authentication**: Google Authenticator TOTP integration
- **Recovery Hash**: 108-character recovery key system
- **No Seed Exposure**: Private keys never exposed to frontend
- **Backend-Controlled**: All wallet operations server-managed

### ⛓️ **Multi-Chain Support**
- **Ethereum (ETH)** - ERC-20 tokens
- **Binance Smart Chain (BNB)** - BEP-20 tokens
- **Polygon (MATIC)** - Polygon tokens
- **Bitcoin (BTC)** - Native Bitcoin support
- **Tron (TRX)** - TRC-20 tokens

### 🎨 **Premium UI/UX**
- **Dark Theme**: Luxury fintech aesthetic
- **Glassmorphism**: Modern glass card effects
- **Golden Accents**: `#d4af37` primary + `#ff9100` secondary
- **Inter/Poppins Fonts**: Clean, professional typography
- **Responsive Design**: Optimized for mobile experience

### 📱 **Core Functionality**
- **User Registration**: Multi-step onboarding with QR setup
- **Secure Login**: 3-factor authentication (hash + code + 2FA)
- **Send Transactions**: Multi-step flow with 2FA confirmation
- **Receive Crypto**: QR codes and address sharing
- **Transaction History**: Detailed transaction tracking
- **Real-time Balances**: Live portfolio updates

## 🏗️ **Architecture**

### **Frontend Stack**
```
React Native + TypeScript
├── Navigation: @react-navigation/native + @react-navigation/stack
├── Networking: Axios
├── Storage: @react-native-async-storage/async-storage
├── QR Codes: react-native-qrcode-svg
├── Device Info: react-native-device-info
├── 2FA: otplib
└── Blockchain: ethers.js, tronweb, bitcoinjs-lib
```

### **Project Structure**
```
src/
├── components/        # Reusable UI components
│   ├── Button.tsx     # Premium styled buttons
│   ├── Input.tsx      # Form inputs with validation
│   ├── Card.tsx       # Glassmorphism cards
│   └── ChainCard.tsx  # Blockchain wallet cards
├── screens/           # App screens
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── SendScreen.tsx
│   ├── ReceiveScreen.tsx
│   └── TransactionHistoryScreen.tsx
├── services/          # Business logic
│   ├── apiService.ts  # Backend API calls
│   └── authService.ts # Authentication & 2FA
├── hooks/             # Custom React hooks
│   └── useWallet.ts   # Wallet state management
├── utils/             # Utility functions
│   ├── formatters.ts  # Address/balance formatting
│   └── chainConfig.ts # Blockchain configurations
├── theme/             # Design system
│   └── darkTheme.ts   # Color scheme & styling
└── types/             # TypeScript definitions
    └── index.ts       # Interface definitions
```

## 🚀 **Getting Started**

### **Prerequisites**
```bash
- Node.js 18+
- npm or yarn
- React Native development environment
- Expo CLI (optional)
```

### **Installation**
```bash
# Clone the repository
git clone <repository-url>
cd ShibauWallet

# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### **Backend Integration**
Update the API base URL in `src/services/apiService.ts`:
```typescript
baseURL: 'https://your-backend-api.com', // Replace with your backend URL
```

## 🔧 **Configuration**

### **Supported Chains Configuration**
Located in `src/utils/chainConfig.ts`:
```typescript
export const CHAIN_CONFIGS: Record<SupportedChain, ChainConfig> = {
  ETH: {
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: 1,
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
    explorerUrl: 'https://etherscan.io',
    // ...
  },
  // ... other chains
}
```

### **Theme Customization**
Located in `src/theme/darkTheme.ts`:
```typescript
export const darkTheme = {
  colors: {
    background: '#0a0a0a',    // Deep black
    primary: '#d4af37',       // Golden
    secondary: '#ff9100',     // Bright orange
    // ... other colors
  },
  // ... fonts, spacing, etc.
}
```

## 🔐 **Security Features**

### **Device Fingerprinting**
- Generates unique device fingerprint using:
  - Device ID
  - Model information
  - Platform version
  - Build number
- Prevents wallet access from unauthorized devices

### **2FA Implementation**
- TOTP-based using Google Authenticator
- Secret generation and QR code display
- Required for all sensitive operations
- Integration with `otplib` for verification

### **Recovery System**
- 108-character recovery hash
- User-defined security code
- Device-specific binding
- No private key exposure

## 📡 **API Integration**

### **Required Backend Endpoints**
```typescript
POST /register          # User registration
POST /login            # User authentication
GET  /wallet/balance/:address/:chain    # Get wallet balance
GET  /wallet/tokens/:address/:chain     # Get token list
POST /send             # Send transaction
GET  /wallet/transactions/:address/:chain # Transaction history
```

### **Authentication Flow**
1. User provides username, security code, recovery hash
2. App generates device fingerprint
3. TOTP secret created and QR displayed
4. User scans QR with Google Authenticator
5. User enters TOTP code for verification
6. Backend creates wallet and stores credentials
7. Future logins require all 3 factors + device match

## 🎯 **Usage Examples**

### **User Registration**
```typescript
const result = await authService.register(
  username,
  securityCode,
  recoveryHash,
  totpCode
)

if (result.success) {
  // Show QR code for Google Authenticator setup
  console.log('QR Code:', result.qrCode)
}
```

### **Sending Transaction**
```typescript
const response = await apiService.sendTransaction({
  from: userAddress,
  to: recipientAddress,
  amount: parseAmount(amount, tokenDecimals),
  chain: selectedChain,
  token: selectedToken?.address,
  totpCode: authenticatorCode,
})
```

### **Getting Balances**
```typescript
const { user, getChainBalance, getChainTokens } = useWallet()

const ethBalance = getChainBalance('ETH')
const ethTokens = getChainTokens('ETH')
```

## 🧪 **Testing**

### **Running Tests**
```bash
# Unit tests
npm test

# E2E tests (if configured)
npm run test:e2e
```

### **Manual Testing Checklist**
- [ ] User registration flow
- [ ] QR code generation and scanning
- [ ] Login with 2FA
- [ ] Device binding verification
- [ ] Multi-chain balance display
- [ ] Send transaction flow
- [ ] Receive address generation
- [ ] Transaction history display

## 📦 **Deployment**

### **iOS Deployment**
```bash
# Build for iOS
expo build:ios

# Or with bare React Native
cd ios && xcodebuild
```

### **Android Deployment**
```bash
# Build for Android
expo build:android

# Or with bare React Native
cd android && ./gradlew assembleRelease
```

### **Environment Variables**
Create `.env` file:
```
API_BASE_URL=https://your-backend-api.com
CHAIN_RPC_URLS=...
```

## 🛠️ **Development**

### **Adding New Chains**
1. Update `SupportedChain` type in `src/types/index.ts`
2. Add chain config in `src/utils/chainConfig.ts`
3. Update validation logic in `src/utils/formatters.ts`
4. Add chain-specific logic in services

### **Customizing UI**
1. Modify theme in `src/theme/darkTheme.ts`
2. Update component styles
3. Add new component variants
4. Adjust spacing and typography

### **Adding Features**
1. Create new screens in `src/screens/`
2. Add navigation routes in `App.tsx`
3. Implement business logic in services
4. Add required API endpoints

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 **Support**

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code examples

## 🚨 **Security Notice**

This is a cryptocurrency wallet application. Always:
- Audit the code before production use
- Use secure backend infrastructure
- Enable proper monitoring and logging
- Follow security best practices
- Test thoroughly on testnets first

---

**Built with ❤️ for the decentralized future**