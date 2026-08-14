const rateLimit = require('express-rate-limit');

const isTestEnv = () => process.env.NODE_ENV === 'test';
const shouldSkip = (req) => isTestEnv() && !req.headers['x-test-rate-limit'];

/**
 * Global API Rate Limiter
 * 100 requests per 15 minutes per IP
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
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
 * 10 requests per 15 minutes per IP — prevents brute-force
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
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
 * AI Endpoint Rate Limiter
 * 30 requests per 15 minutes per IP — protects Gemini API quota
 */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
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

module.exports = { globalLimiter, authLimiter, aiLimiter };
