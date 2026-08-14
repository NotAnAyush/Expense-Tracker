const Joi = require('joi');

const createBudgetSchema = Joi.object({
  categoryId: Joi.string().trim().min(1).max(100).required()
    .messages({
      'any.required': 'Category is required for budget',
    }),
  amount: Joi.number().positive().required()
    .messages({
      'number.positive': 'Budget amount must be a positive number',
      'any.required': 'Budget amount is required',
    }),
  period: Joi.string().valid('monthly', 'weekly', 'yearly').default('monthly'),
  alertThreshold: Joi.number().min(0).max(1).default(0.8)
    .messages({
      'number.min': 'Alert threshold must be between 0 and 1',
      'number.max': 'Alert threshold must be between 0 and 1',
    }),
});

const updateBudgetSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  alertThreshold: Joi.number().min(0).max(1).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

module.exports = { createBudgetSchema, updateBudgetSchema };
