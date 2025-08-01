const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Database connection
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');

// Middleware
const { generalLimiter } = require('./middlewares/rateLimit');

// Initialize Express app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply general rate limiting
app.use(generalLimiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Crypto Wallet API',
    version: '1.0.0',
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Crypto Wallet API v1.0.0',
    documentation: {
      authentication: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        deviceChangeRequest: 'POST /api/auth/device-change-request',
        verify: 'GET /api/auth/verify',
        regenerate2FA: 'POST /api/auth/regenerate-2fa',
      },
      wallet: {
        balances: 'GET /api/wallet/balances',
        chainBalance: 'GET /api/wallet/balance/:chain',
        send: 'POST /api/wallet/send',
        estimateFee: 'POST /api/wallet/estimate-fee',
        addresses: 'GET /api/wallet/addresses',
        tokens: 'GET /api/wallet/tokens/:chain',
        history: 'GET /api/wallet/history',
      },
    },
    supportedChains: ['ethereum', 'bitcoin', 'tron', 'bsc', 'polygon'],
    features: [
      'Multi-chain wallet support',
      'AES-256 encryption',
      'Google Authenticator 2FA',
      'Device binding',
      'Rate limiting',
      'Platform fee system',
    ],
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors,
    });
  }
  
  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `Duplicate ${field} provided`,
    });
  }
  
  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired',
    });
  }
  
  // Default error
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
  });
});

// Graceful shutdown handlers
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`
🚀 Crypto Wallet API Server Started
📍 Port: ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📡 API Base URL: http://localhost:${PORT}/api
🔐 Security Features: Helmet, CORS, Rate Limiting, AES-256 Encryption
🔑 Authentication: JWT + 2FA + Device Binding
⛓️  Supported Chains: Ethereum, Bitcoin, Tron, BSC, Polygon
💰 Platform Fee: ${process.env.PLATFORM_FEE_PERCENTAGE || 0.1}% in SHIBAU tokens
  `);
});

module.exports = { app, server };