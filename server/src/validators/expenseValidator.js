const Joi = require('joi');

const VALID_PAYMENT_METHODS = ['Card', 'Cash', 'UPI', 'Bank Transfer', 'Other'];
const VALID_SOURCES = ['manual', 'recurring', 'ai_suggested', 'import'];

const splitItemSchema = Joi.object({
  category: Joi.string().trim().min(1).max(100).required(),
  amount: Joi.number().positive().required(),
  note: Joi.string().trim().max(500).allow('').optional(),
});

const createExpenseSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).required()
    .messages({
      'string.min': 'Title must not be empty',
      'string.max': 'Title must not exceed 200 characters',
      'any.required': 'Expense title is required',
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
  date: Joi.date().iso().allow(null).optional(),
  note: Joi.string().trim().max(1000).allow('').optional(),
  merchant: Joi.string().trim().max(200).allow('').optional(),
  paymentMethod: Joi.string().valid(...VALID_PAYMENT_METHODS).optional(),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10).optional(),
  splits: Joi.array().items(splitItemSchema).max(20).optional(),
  isTaxDeductible: Joi.boolean().optional(),
  taxSection: Joi.string().trim().max(50).allow('').optional(),
  reimbursementStatus: Joi.string().valid('none', 'pending', 'submitted', 'reimbursed').optional(),
  source: Joi.string().valid(...VALID_SOURCES).optional(),
});

const updateExpenseSchema = Joi.object({
  title: Joi.string().trim().min(1).max(200).optional(),
  amount: Joi.number().positive().optional(),
  category: Joi.string().trim().min(1).max(100).optional(),
  date: Joi.date().iso().allow(null).optional(),
  note: Joi.string().trim().max(1000).allow('').optional(),
  merchant: Joi.string().trim().max(200).allow('').optional(),
  paymentMethod: Joi.string().valid(...VALID_PAYMENT_METHODS).optional(),
  tags: Joi.array().items(Joi.string().trim().max(50)).max(10).optional(),
  splits: Joi.array().items(splitItemSchema).max(20).optional(),
  isTaxDeductible: Joi.boolean().optional(),
  taxSection: Joi.string().trim().max(50).allow('').optional(),
  reimbursementStatus: Joi.string().valid('none', 'pending', 'submitted', 'reimbursed').optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

module.exports = { createExpenseSchema, updateExpenseSchema };
