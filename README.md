# Crypto Wallet Backend API

A secure, multi-chain cryptocurrency wallet backend built with Node.js, featuring AES-256 encryption, Google Authenticator 2FA, device binding, and comprehensive security measures.

## 🚀 Features

- **Multi-Chain Support**: Ethereum, Bitcoin, Tron, BSC (Binance Smart Chain), Polygon
- **Advanced Security**:
  - AES-256 encryption for private keys and seeds
  - Google Authenticator TOTP 2FA
  - Device binding and verification
  - JWT authentication with 24-hour expiration
  - Rate limiting on all endpoints
  - Secure CORS and Helmet configuration
- **Wallet Management**:
  - Automatic multi-chain wallet generation
  - Real-time balance checking
  - Transaction sending with fee estimation
  - ERC20, BEP20, and TRC20 token support
- **Platform Features**:
  - SHIBAU token fee system
  - Device change request management
  - Transaction history (extensible)
  - Comprehensive error handling

## 📦 Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose
- **Security**: Helmet, CORS, express-rate-limit
- **Encryption**: Node.js crypto module (AES-256-GCM)
- **Authentication**: JWT + Google Authenticator (otplib)
- **Blockchain**: ethers.js, bitcoinjs-lib, tronweb, web3.js
- **Environment**: dotenv

## 🛠️ Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd crypto-wallet-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/crypto-wallet-db

# JWT Secret (Generate a strong secret)
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long

# Encryption Key (Must be exactly 32 characters)
ENCRYPTION_KEY=your-32-byte-encryption-key-here123

# Blockchain RPC URLs
ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your-api-key
BSC_RPC_URL=https://bsc-dataseed.binance.org/
POLYGON_RPC_URL=https://polygon-rpc.com/
TRON_RPC_URL=https://api.trongrid.io
```

4. **Start MongoDB**
```bash
# Make sure MongoDB is running on your system
mongod
```

5. **Run the server**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "user123",
  "securityCode": "your-security-code",
  "hashKey": "your-hash-key",
  "deviceInfo": {
    "deviceId": "unique-device-id",
    "platform": "iOS",
    "model": "iPhone 13",
    "version": "15.0",
    "fingerprint": "device-fingerprint"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user-id",
      "username": "user123",
      "walletAddresses": {
        "ethereum": "0x...",
        "bitcoin": "bc1...",
        "tron": "T..."
      }
    },
    "token": "jwt-token",
    "qrCodeUrl": "data:image/png;base64,...",
    "manualEntryKey": "2fa-secret"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "securityCode": "your-security-code",
  "hashKey": "your-hash-key",
  "deviceInfo": {
    "deviceId": "unique-device-id",
    "platform": "iOS",
    "fingerprint": "device-fingerprint"
  },
  "twoFactorCode": "123456"
}
```

#### Device Change Request
```http
POST /api/auth/device-change-request
Content-Type: application/json

{
  "securityCode": "your-security-code",
  "hashKey": "your-hash-key",
  "deviceInfo": {
    "deviceId": "new-device-id",
    "platform": "Android"
  },
  "twoFactorCode": "123456"
}
```

### Wallet Endpoints

#### Get All Balances
```http
GET /api/wallet/balances
Authorization: Bearer <jwt-token>
```

#### Get Chain-Specific Balance
```http
GET /api/wallet/balance/ethereum
Authorization: Bearer <jwt-token>
```

#### Send Transaction
```http
POST /api/wallet/send
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "coinType": "ETH",
  "chain": "ethereum",
  "recipient": "0x...",
  "amount": "0.1",
  "deviceInfo": {
    "deviceId": "unique-device-id",
    "fingerprint": "device-fingerprint"
  },
  "twoFactorCode": "123456"
}
```

#### Estimate Transaction Fee
```http
POST /api/wallet/estimate-fee
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "chain": "ethereum",
  "recipient": "0x...",
  "amount": "0.1",
  "tokenAddress": "0x..." // Optional for ERC20 tokens
}
```

#### Get Wallet Addresses
```http
GET /api/wallet/addresses
Authorization: Bearer <jwt-token>
```

#### Get Supported Tokens
```http
GET /api/wallet/tokens/ethereum
Authorization: Bearer <jwt-token>
```

## 🔐 Security Features

### Encryption
- **AES-256-GCM** encryption for all private keys and seeds
- **PBKDF2** key derivation with 100,000 iterations
- Unique salt and IV for each encryption operation
- Additional authenticated data (AAD) for integrity

### Authentication
- **JWT tokens** with 24-hour expiration
- **Google Authenticator TOTP** for 2FA
- **Device binding** with fingerprint verification
- **Security code + Hash key** dual authentication

### Rate Limiting
- General API: 100 requests per 15 minutes
- Authentication: 5 attempts per 15 minutes
- Transactions: 3 attempts per minute
- Registration: 3 attempts per hour
- Device changes: 2 requests per day

### Additional Security
- **Helmet.js** for HTTP security headers
- **CORS** configuration with allowed origins
- **Input validation** and sanitization
- **Error handling** without information leakage

## 🌐 Supported Blockchains

### Native Currencies
- **Ethereum (ETH)** - Mainnet
- **Bitcoin (BTC)** - Mainnet with SegWit support
- **Tron (TRX)** - Mainnet
- **BNB** - Binance Smart Chain
- **MATIC** - Polygon

### Token Standards
- **ERC20** - Ethereum tokens (USDT, USDC, LINK, etc.)
- **BEP20** - BSC tokens (BUSD, CAKE, etc.)
- **TRC20** - Tron tokens (USDT-TRC20, etc.)

## 🏗️ Project Structure

```
src/
├── config/
│   ├── db.js              # MongoDB connection
│   ├── keys.js            # Environment configuration
│   └── chains.js          # Blockchain configurations
├── controllers/
│   ├── authController.js  # Authentication logic
│   └── walletController.js # Wallet operations
├── middlewares/
│   ├── authMiddleware.js  # JWT and security middleware
│   └── rateLimit.js       # Rate limiting configurations
├── models/
│   └── User.js           # User data model
├── routes/
│   ├── authRoutes.js     # Authentication routes
│   └── walletRoutes.js   # Wallet routes
├── utils/
│   ├── encrypt.js        # AES-256 encryption utilities
│   ├── verifyDevice.js   # Device verification
│   ├── generateWallets.js # Multi-chain wallet generation
│   ├── getBalance.js     # Balance fetching utilities
│   └── sendTx.js         # Transaction sending utilities
└── main.ts               # Server entry point
```

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret (32+ chars) | Yes |
| `ENCRYPTION_KEY` | AES-256 encryption key (32 chars) | Yes |
| `ETH_RPC_URL` | Ethereum RPC endpoint | Yes |
| `BSC_RPC_URL` | BSC RPC endpoint | Yes |
| `POLYGON_RPC_URL` | Polygon RPC endpoint | Yes |
| `TRON_RPC_URL` | Tron RPC endpoint | Yes |
| `BTC_API_URL` | Bitcoin API endpoint | Yes |
| `CORS_ORIGINS` | Allowed CORS origins | Yes |
| `PLATFORM_FEE_PERCENTAGE` | Platform fee percentage | No |
| `SHIBAU_TOKEN_ADDRESS` | SHIBAU token contract | No |

## 🚀 Deployment

### Production Setup
1. Use a strong, randomly generated `JWT_SECRET`
2. Use a secure, randomly generated `ENCRYPTION_KEY`
3. Set up MongoDB with authentication
4. Configure real blockchain RPC endpoints
5. Set `NODE_ENV=production`
6. Use HTTPS in production
7. Configure proper CORS origins
8. Set up monitoring and logging

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Health check
curl http://localhost:3000/health

# API documentation
curl http://localhost:3000/api
```

## 📝 License

This project is licensed under the MIT License.

## ⚠️ Security Considerations

1. **Never commit sensitive environment variables**
2. **Use strong, unique encryption keys**
3. **Implement proper key rotation**
4. **Monitor for suspicious device changes**
5. **Regular security audits**
6. **Implement backup and recovery procedures**
7. **Use HTTPS in production**
8. **Monitor transaction patterns**

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please create an issue in the repository or contact the development team.

---

**⚠️ Important**: This is a financial application handling cryptocurrency transactions. Always ensure proper security audits, testing, and compliance with local regulations before deployment in production environments.