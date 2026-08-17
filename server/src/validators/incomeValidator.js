const Joi = require('joi');

const VALID_INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investments', 'Rental', 'Dividends', 'Gift', 'Refund', 'Other'];
const VALID_RECURRING_FREQUENCIES = ['monthly', 'bi-weekly', 'weekly', 'one-time'];

const createIncomeSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required()
    .messages({
      'string.min': 'Title must not be empty',
      'string.max': 'Title must not exceed 200 characters',
      'any.required': 'Income title is required',
    }),
  amount: Joi.number().positive().required()
    .messages({
      'number.positive': 'Amount must be a positive number',
      'any.required': 'Amount is required',
    }),
  category: Joi.string().trim().valid(...VALID_INCOME_CATEGORIES).optional(),
  date: Joi.date().iso().allow(null).optional(),
  source: Joi.string().trim().max(200).allow('').optional(),
  isRecurring: Joi.boolean().optional(),
  recurringFrequency: Joi.string().valid(...VALID_RECURRING_FREQUENCIES).optional(),
  currency: Joi.string().trim().max(10).optional(),
  note: Joi.string().trim().max(1000).allow('').optional(),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10).optional(),
});

const updateIncomeSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  amount: Joi.number().positive().optional(),
  category: Joi.string().trim().valid(...VALID_INCOME_CATEGORIES).optional(),
  date: Joi.date().iso().allow(null).optional(),
  source: Joi.string().trim().max(200).allow('').optional(),
  isRecurring: Joi.boolean().optional(),
  recurringFrequency: Joi.string().valid(...VALID_RECURRING_FREQUENCIES).optional(),
  currency: Joi.string().trim().max(10).optional(),
  note: Joi.string().trim().max(1000).allow('').optional(),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

module.exports = { createIncomeSchema, updateIncomeSchema };
