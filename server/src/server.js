const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');

dotenv.config();

const connectDB = require('./config/db');
const sanitizeInput = require('./middleware/sanitize');
const auditLogger = require('./middleware/auditLogger');
const idempotency = require('./middleware/idempotency');
const { globalLimiter, authLimiter, aiLimiter } = require('./middleware/rateLimiter');
const AppError = require('./utils/AppError');

// Route imports
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const auditRoutes = require('./routes/auditRoutes');
const exportRoutes = require('./routes/exportRoutes');

const app = express();

// Database Connection
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// ========================
// Security Middleware Stack
// ========================

// 1. Helmet — Sets comprehensive security headers (replaces manual headers)
//    Includes: CSP, HSTS, X-Frame-Options, X-Content-Type-Options, etc.
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false, // Allow frontend to load cross-origin resources
}));

// 2. CORS — Environment-based origin whitelist
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(url => url.trim());

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// 3. Compression — Gzip all JSON responses
app.use(compression());

// 4. Body Parsing — With payload size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 5. NoSQL Injection Sanitizer
app.use(sanitizeInput);

// 6. Global Rate Limiter — 100 req / 15 min / IP
app.use(globalLimiter);

// 7. Idempotency — Prevents duplicate POST operations
app.use(idempotency);

// 8. Audit Logger — Logs all mutations (POST/PUT/DELETE)
app.use(auditLogger);

// ========================
// API Routes
// ========================

// Auth routes with stricter rate limiter
app.use('/api/auth', authLimiter, authRoutes);

// Core CRUD routes
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/categories', categoryRoutes);

// Analytics & AI routes
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);

// New routes — Audit trail & Data export
app.use('/api/audit', auditRoutes);
app.use('/api/export', exportRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'AI-First Personal Finance Intelligence Platform',
    version: '2.1.0',
    timestamp: new Date().toISOString(),
    features: {
      rateLimiting: true,
      auditLogging: true,
      inputValidation: true,
      dataExport: true,
      idempotency: true,
    },
  });
});

// Global 404 handler
app.use((req, res, next) => {
  next(AppError.notFound(`Endpoint: ${req.originalUrl}`));
});

// ========================
// Global Error Handler
// ========================
app.use((err, req, res, next) => {
  // Handle AppError (operational errors)
  if (err.isOperational) {
    return res.status(err.statusCode).json(err.toJSON());
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const details = Object.keys(err.errors).map((field) => ({
      field,
      message: err.errors[field].message,
    }));
    return res.status(400).json({
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Database validation failed',
        details,
      },
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: `Invalid ID format: ${err.value}`,
      },
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: {
        code: 'AUTH_TOKEN_INVALID',
        message: 'Invalid authentication token',
      },
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'AUTH_TOKEN_EXPIRED',
        message: 'Authentication token has expired',
      },
    });
  }

  // Handle duplicate key (MongoDB E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      error: {
        code: 'RESOURCE_CONFLICT',
        message: `Duplicate value for ${field}`,
      },
    });
  }

  // Unhandled errors — log full stack, return generic message
  console.error('[Unhandled Error]', err.stack);
  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development'
        ? err.message
        : 'An unexpected error occurred',
    },
  });
});

// ========================
// Server Startup & Graceful Shutdown
// ========================
const PORT = process.env.PORT || 5000;
let server;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Richy Rich Backend v2.1.0 running on port ${PORT}`);
    console.log(`🛡️  Security: helmet, rate-limit, compression, audit-log`);
    console.log(`=======================================================`);
  });

  // Graceful shutdown — drain connections before exiting
  const gracefulShutdown = (signal) => {
    console.log(`\n[${signal}] Graceful shutdown initiated...`);
    server.close(() => {
      console.log('[Server] HTTP connections drained.');
      const mongoose = require('mongoose');
      mongoose.connection.close(false).then(() => {
        console.log('[Database] MongoDB connection closed.');
        process.exit(0);
      });
    });

    // Force kill if graceful shutdown takes too long
    setTimeout(() => {
      console.error('[Server] Forced shutdown — timeout exceeded.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
