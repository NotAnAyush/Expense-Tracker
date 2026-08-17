const AppError = require('../utils/AppError');

/**
 * Joi Validation Middleware Factory
 * Validates req.body against the provided Joi schema.
 * Returns 400 with structured field-level errors on failure.
 *
 * @param {import('joi').ObjectSchema} schema - Joi validation schema
 * @param {string} source - Which part of req to validate ('body' | 'query' | 'params')
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const dataToValidate = req[source];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,    // Return ALL errors, not just the first
      stripUnknown: true,   // Remove fields not in schema
      allowUnknown: false,
    });

    if (error) {
      const details = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      return next(AppError.badRequest('Validation failed', details));
    }

    // Replace with validated & sanitized data
    req[source] = value;
    next();
  };
};

module.exports = validate;
