/**
 * Error hierarchy for Express Backend
 * Implements standard AppError and specific operational error subclasses.
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
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = Array.isArray(details) ? details : [details];
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.errorCode,
        message: this.message,
        ...(this.details && this.details.length > 0 && { details: this.details }),
      },
    };
  }

  // --- Static Factory Methods for backward compatibility ---
  static badRequest(message, details = []) {
    return new BadRequestError(message, details);
  }

  static unauthorized(message = 'Not authorized') {
    return new UnauthorizedError(message);
  }

  static forbidden(message = 'Access denied') {
    return new ForbiddenError(message);
  }

  static notFound(resource = 'Resource') {
    return new NotFoundError(`${resource} not found`);
  }

  static conflict(message) {
    return new ConflictError(message);
  }

  static tooManyRequests(message = 'Too many requests') {
    return new TooManyRequestsError(message);
  }

  static internal(message = 'Internal server error') {
    return new AppError(message, 500, 'INTERNAL_ERROR');
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', details = []) {
    super(message, 400, 'VALIDATION_FAILED', details);
  }
}

class BadRequestError extends AppError {
  constructor(message = 'Bad request', details = []) {
    super(message, 400, 'VALIDATION_FAILED', details);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'RESOURCE_NOT_FOUND');
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'AUTH_UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'AUTH_FORBIDDEN');
  }
}

class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'RESOURCE_CONFLICT');
  }
}

class TooManyRequestsError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

module.exports = {
  AppError,
  ValidationError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  TooManyRequestsError,
};
