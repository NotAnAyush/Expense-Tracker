const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const compression = require('compression');
const mongoose = require('mongoose');

dotenv.config();

const { connectDB, closeDatabase } = require('./config/db');
const requestLogger = require('./middleware/requestLogger');
const sanitizeInput = require('./middleware/sanitize');
const auditLogger = require('./middleware/auditLogger');
const idempotency = require('./middleware/idempotency');
const { globalLimiter, aiLimiter } = require('./middleware/rateLimiter');
const errorHandler = require('./middleware/errorHandler');
const { NotFoundError } = require('./utils/errors');

// Route imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const auditRoutes = require('./routes/auditRoutes');
const exportRoutes = require('./routes/exportRoutes');
const importRoutes = require('./routes/importRoutes');
const groupRoutes = require('./routes/groupRoutes');
const debtRoutes = require('./routes/debtRoutes');
const simulationRoutes = require('./routes/simulationRoutes');
const tripVaultRoutes = require('./routes/tripVaultRoutes');
const fxRoutes = require('./routes/fxRoutes');
const upiIntegrationRoutes = require('./routes/upiIntegrationRoutes');
const vaultRoutes = require('./routes/vaultRoutes');

const app = express();

// Database Connection
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// ========================
// Security & Core Middleware Stack
// ========================

// 1. Structured HTTP Request Logger
app.use(requestLogger);

// 2. Helmet — Sets comprehensive security headers
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// 3. CORS — Origin whitelist
const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map(url => url.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (process.env.NODE_ENV !== 'production') {
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
      if (isLocalhost) return callback(null, true);
    }

    if (configuredOrigins.includes(origin) || configuredOrigins.includes('*')) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Idempotency-Key'],
}));

// 4. Compression — Gzip responses
app.use(compression());

// 5. Body Parsing — With payload limits (25mb for multimodal receipt scanning & document parsing)
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// 6. NoSQL Injection Sanitizer
app.use(sanitizeInput);

// 7. Global Rate Limiter — 100 req / 15 min / IP
app.use(globalLimiter);

// 8. Idempotency — Prevents duplicate POST operations
app.use(idempotency);

// 9. Audit Logger — Logs all mutations
app.use(auditLogger);

// ========================
// Health Checks & Monitoring
// ========================
const getHealthStatus = (req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const readyState = mongoose.connection ? mongoose.connection.readyState : 0;
  const dbStatus = dbStates[readyState] || 'unknown';

  res.json({
    status: dbStatus === 'connected' ? 'online' : (readyState === 0 && process.env.NODE_ENV === 'test' ? 'online' : 'degraded'),
    database: dbStatus,
    system: 'AI-First Personal Finance Intelligence Platform',
    version: '2.2.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsage: {
      heapUsedMb: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
      rssMb: Math.round((process.memoryUsage().rss / 1024 / 1024) * 100) / 100,
    },
    features: {
      rateLimiting: true,
      auditLogging: true,
      inputValidation: true,
      dataExport: true,
      idempotency: true,
      requestLogging: true,
      structuredErrors: true,
    },
  });
};

app.get('/health', getHealthStatus);
app.get('/api/health', getHealthStatus);

// ========================
// API Routes
// ========================
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiLimiter, aiRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/import', importRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/trips', tripVaultRoutes);
app.use('/api/fx', fxRoutes);
app.use('/api/integrations/upi', upiIntegrationRoutes);
app.use('/api/vault', vaultRoutes);

// Global 404 handler for undefined routes
app.use((req, res, next) => {
  next(new NotFoundError(`Endpoint: ${req.originalUrl}`));
});

// Centralized Global Error Handler
app.use(errorHandler);

// ========================
// Server Startup & Graceful Shutdown
// ========================
const PORT = process.env.PORT || 5000;
let server;

if (process.env.NODE_ENV !== 'test') {
  server = app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Richy Rich Backend v2.2.0 running on port ${PORT}`);
    console.log(`🛡️  Security: helmet, rate-limit, compression, audit-log`);
    console.log(`=======================================================`);
  });

  const gracefulShutdown = async (signal) => {
    console.log(`\n[${signal}] Graceful shutdown initiated...`);
    if (server) {
      server.close(async () => {
        console.log('[Server] HTTP connections drained.');
        await closeDatabase();
        process.exit(0);
      });
    } else {
      await closeDatabase();
      process.exit(0);
    }

    setTimeout(() => {
      console.error('[Server] Forced shutdown — timeout exceeded.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

module.exports = app;
