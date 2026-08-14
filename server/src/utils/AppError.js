/**
 * AppError — Structured Error Class for Richy Rich Backend
 * Provides consistent error codes and HTTP status mapping.
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code
   * @param {string} errorCode - Machine-readable error code
   * @param {Array} details - Optional field-level validation errors
   */
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR', details = []) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = true; // Distinguishes from programmer bugs

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.errorCode,
        message: this.message,
        ...(this.details.length > 0 && { details: this.details }),
      },
    };
  }

  // --- Factory Methods ---

  static badRequest(message, details = []) {
    return new AppError(message, 400, 'VALIDATION_FAILED', details);
  }

  static unauthorized(message = 'Not authorized') {
    return new AppError(message, 401, 'AUTH_UNAUTHORIZED');
  }

  static forbidden(message = 'Access denied') {
    return new AppError(message, 403, 'AUTH_FORBIDDEN');
  }

  static notFound(resource = 'Resource') {
    return new AppError(`${resource} not found`, 404, 'RESOURCE_NOT_FOUND');
  }

  static conflict(message) {
    return new AppError(message, 409, 'RESOURCE_CONFLICT');
  }

  static tooManyRequests(message = 'Too many requests') {
    return new AppError(message, 429, 'RATE_LIMIT_EXCEEDED');
  }

  static internal(message = 'Internal server error') {
    return new AppError(message, 500, 'INTERNAL_ERROR');
  }
}

module.exports = AppError;
