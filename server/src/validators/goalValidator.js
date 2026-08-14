const Joi = require('joi');

const createGoalSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).required()
    .messages({
      'any.required': 'Goal name is required',
    }),
  targetAmount: Joi.number().positive().required()
    .messages({
      'number.positive': 'Target amount must be a positive number',
      'any.required': 'Target amount is required',
    }),
  currentAmount: Joi.number().min(0).default(0),
  targetDate: Joi.date().iso().greater('now').required()
    .messages({
      'date.greater': 'Target date must be in the future',
      'any.required': 'Target date is required',
    }),
});

const updateGoalSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).optional(),
  targetAmount: Joi.number().positive().optional(),
  currentAmount: Joi.number().min(0).optional(),
  targetDate: Joi.date().iso().optional(),
  status: Joi.string().valid('active', 'completed', 'paused', 'achieved').optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

module.exports = { createGoalSchema, updateGoalSchema };
