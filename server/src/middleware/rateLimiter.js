const rateLimit = require('express-rate-limit');

const isTestEnv = () => process.env.NODE_ENV === 'test';
const isDevEnv = () => !process.env.NODE_ENV || process.env.NODE_ENV === 'development';

const shouldSkip = (req) => {
  // Always skip in test environment unless explicitly testing rate limits
  if (isTestEnv() && !req.headers['x-test-rate-limit']) {
    return true;
  }
  // In development, skip rate limiting for local traffic unless test flag provided
  if (isDevEnv() && !req.headers['x-test-rate-limit']) {
    return true;
  }
  return false;
};

/**
 * Global API Rate Limiter
 * Generous limits to prevent DDoS while permitting high-frequency multi-widget dashboard refreshes
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 2000 : 10000,
  skip: shouldSkip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
});

/**
 * Auth-Specific Rate Limiter (Login / Register)
 * Prevents brute-force attacks while allowing seamless user and development workflows
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 60 : 1000,
  skip: shouldSkip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
    },
  },
});

/**
 * Demo Sandbox Rate Limiter
 * Generous limits to allow exploring the application seamlessly
 */
const demoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 120 : 1000,
  skip: shouldSkip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'DEMO_RATE_LIMIT_EXCEEDED',
      message: 'Demo rate limit reached. Please wait a moment before trying again.',
    },
  },
});

/**
 * AI Endpoint Rate Limiter
 * Protects Gemini API quota
 */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  skip: shouldSkip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'AI_RATE_LIMIT_EXCEEDED',
      message: 'AI request limit reached. Please try again shortly.',
    },
  },
});

module.exports = { globalLimiter, authLimiter, demoLimiter, aiLimiter };
