const {
  AppError,
  ValidationError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  TooManyRequestsError,
} = require('./errors');

AppError.ValidationError = ValidationError;
AppError.BadRequestError = BadRequestError;
AppError.NotFoundError = NotFoundError;
AppError.UnauthorizedError = UnauthorizedError;
AppError.ForbiddenError = ForbiddenError;
AppError.ConflictError = ConflictError;
AppError.TooManyRequestsError = TooManyRequestsError;

module.exports = AppError;
