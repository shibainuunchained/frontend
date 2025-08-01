const rateLimit = require('express-rate-limit');

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60, // 15 minutes in seconds
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Rate limit exceeded. Too many requests from this IP.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: 15 * 60,
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many authentication attempts from this IP.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// Very strict rate limiting for transaction endpoints
const transactionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // limit each IP to 3 transaction requests per minute
  message: {
    success: false,
    message: 'Too many transaction attempts, please try again later.',
    retryAfter: 60,
  },
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.userId || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Transaction rate limit exceeded. Please wait before sending another transaction.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// Rate limiting for registration
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registration attempts per hour
  message: {
    success: false,
    message: 'Too many registration attempts, please try again later.',
    retryAfter: 60 * 60,
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Registration rate limit exceeded.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// Rate limiting for device change requests
const deviceChangeLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 2, // limit each IP to 2 device change requests per day
  message: {
    success: false,
    message: 'Too many device change requests, please try again tomorrow.',
    retryAfter: 24 * 60 * 60,
  },
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.userId || req.ip;
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Device change rate limit exceeded.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

// Rate limiting for balance queries
const balanceLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each user to 10 balance requests per minute
  keyGenerator: (req) => {
    return req.userId || req.ip;
  },
  message: {
    success: false,
    message: 'Too many balance requests, please try again later.',
    retryAfter: 60,
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Balance query rate limit exceeded.',
      retryAfter: Math.round(req.rateLimit.resetTime / 1000),
    });
  },
});

module.exports = {
  generalLimiter,
  authLimiter,
  transactionLimiter,
  registrationLimiter,
  deviceChangeLimiter,
  balanceLimiter,
};