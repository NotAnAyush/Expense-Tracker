const Joi = require('joi');

const createRecurringSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required()
    .messages({
      'any.required': 'Recurring expense title is required',
    }),
  amount: Joi.number().positive().required()
    .messages({
      'number.positive': 'Amount must be a positive number',
      'any.required': 'Amount is required',
    }),
  category: Joi.string().trim().min(1).max(100).required()
    .messages({
      'any.required': 'Category is required',
    }),
  frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').default('monthly'),
  nextOccurrence: Joi.date().iso().required()
    .messages({
      'any.required': 'Next occurrence date is required',
    }),
  active: Joi.boolean().default(true),
});

const updateRecurringSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  amount: Joi.number().positive().optional(),
  category: Joi.string().trim().min(1).max(100).optional(),
  frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'yearly').optional(),
  nextOccurrence: Joi.date().iso().optional(),
  active: Joi.boolean().optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

module.exports = { createRecurringSchema, updateRecurringSchema };
