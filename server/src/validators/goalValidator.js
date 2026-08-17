const Joi = require('joi');

const VALID_GOAL_STATUSES = ['active', 'achieved', 'completed', 'paused', 'cancelled'];

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
  targetDate: Joi.date().iso().required()
    .messages({
      'any.required': 'Target date is required',
    }),
  status: Joi.string().valid(...VALID_GOAL_STATUSES).default('active'),
});

const updateGoalSchema = Joi.object({
  name: Joi.string().trim().min(1).max(200).optional(),
  targetAmount: Joi.number().positive().optional(),
  currentAmount: Joi.number().min(0).optional(),
  targetDate: Joi.date().iso().optional(),
  status: Joi.string().valid(...VALID_GOAL_STATUSES).optional(),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

module.exports = { createGoalSchema, updateGoalSchema, VALID_GOAL_STATUSES };

