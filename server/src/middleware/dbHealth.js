const mongoose = require('mongoose');
const { ensureConnected } = require('../config/db');

/**
 * Database Readiness Middleware
 * Ensures MongoDB is connected before any controller query runs.
 * Prevents 10000ms Mongoose query buffering timeouts.
 */
const dbConnectionGuard = async (req, res, next) => {
  // If already connected, bypass immediately
  if (mongoose.connection.readyState === 1) {
    return next();
  }

  // If in test mode, proceed
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  try {
    const isConnected = await ensureConnected();
    if (isConnected) {
      return next();
    }
  } catch (err) {
    console.error('[DB Health Guard Error]:', err.message);
  }

  return res.status(503).json({
    success: false,
    message: 'Database connection is initializing or reconnecting. Please retry in a moment.',
  });
};

module.exports = dbConnectionGuard;
