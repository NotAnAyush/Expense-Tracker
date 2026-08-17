const rateLimit = require('express-rate-limit');

const isTestEnv = () => process.env.NODE_ENV === 'test';
const shouldSkip = (req) => isTestEnv() && !req.headers['x-test-rate-limit'];

/**
 * Global API Rate Limiter
 * Generous limits (3,000 req / 15 min in dev, 1,000 in prod) to support modern SPA dashboards
 * with real-time analytics, Copilot chat, and background refreshes without false-positive blocks.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_GLOBAL_MAX
    ? parseInt(process.env.RATE_LIMIT_GLOBAL_MAX, 10)
    : (process.env.NODE_ENV === 'production' ? 1000 : 3000),
  skip: shouldSkip,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests from this IP, please try again later.',
    },
  },
});

/**
 * Auth-Specific Rate Limiter (Login / Register)
 * 500 req / 15 min in dev, 150 in prod — protects against brute-force while allowing continuous team testing
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.RATE_LIMIT_AUTH_MAX
    ? parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10)
    : (process.env.NODE_ENV === 'production' ? 150 : 500),
  skip: shouldSkip,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: 'AUTH_RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again in a few minutes.',
    },
  },
});

/**
 * Demo Sandbox Rate Limiter
 * 500 requests per 15 minutes to allow uninterrupted sandbox exploration
 */
const demoLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
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
 * 500 requests per 15 minutes per IP — supports heavy Copilot dialogues and categorization
 */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
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
