const { AppError } = require('../utils/errors');

/**
 * Centralized Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  // 1. Handle AppError (operational errors)
  if (err.isOperational) {
    return res.status(err.statusCode).json(err.toJSON ? err.toJSON() : {
      error: {
        code: err.errorCode || 'OPERATIONAL_ERROR',
        message: err.message,
        ...(err.details && err.details.length > 0 && { details: err.details }),
      },
    });
  }

  // 2. Handle Mongoose ValidationError
  if (err.name === 'ValidationError') {
    const details = Object.keys(err.errors || {}).map((field) => ({
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

  // 3. Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: {
        code: 'INVALID_ID',
        message: `Invalid ID format: ${err.value}`,
      },
    });
  }

  // 4. Handle JWT errors
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

  // 5. Handle duplicate key (MongoDB E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({
      error: {
        code: 'RESOURCE_CONFLICT',
        message: `Duplicate value for ${field}`,
      },
    });
  }

  // 6. Handle Payload Too Large (413)
  if (err.type === 'entity.too.large' || err.status === 413) {
    return res.status(413).json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'The uploaded file or payload exceeds the maximum allowed limit (25MB).',
      },
    });
  }

  // 7. Unhandled / Internal Server Errors
  if (process.env.NODE_ENV !== 'test') {
    console.error('[Unhandled Error]', err.stack || err);
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development'
        ? err.message
        : 'An unexpected error occurred',
    },
  });
};

module.exports = errorHandler;
