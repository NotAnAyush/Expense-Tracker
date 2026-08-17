const Joi = require('joi');

const updateProfileSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100)
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name must not exceed 100 characters',
    }),
  phone: Joi.string().trim().max(20).allow('').empty('')
    .messages({
      'string.max': 'Phone number must not exceed 20 characters',
    }),
  upiId: Joi.string().trim().max(100).allow('').empty('')
    .pattern(/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/)
    .messages({
      'string.pattern.base': 'Please enter a valid UPI ID (e.g. yourname@bank)',
    }),
  avatarUrl: Joi.string().trim().allow('').empty(''),
  avatarStyle: Joi.string().valid('gradient_gold', 'gradient_mint', 'gradient_violet', 'gradient_flame', 'custom_url', 'emoji'),
  avatarEmoji: Joi.string().max(10).allow(''),
  occupation: Joi.string().trim().max(100).allow(''),
  financialPersona: Joi.string().valid('sovereign_wealth', 'fire_aspirant', 'balanced_saver', 'digital_nomad', 'investor'),
  bio: Joi.string().trim().max(500).allow(''),
  location: Joi.string().trim().max(100).allow(''),
  preferredCurrency: Joi.string().trim().max(5),
  monthlyIncomeEstimate: Joi.number().min(0),
  targetSavingsRate: Joi.number().min(5).max(95),
  defaultPaymentMethod: Joi.string().valid('UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Cash'),
  taxRegime: Joi.string().valid('new_regime_in', 'old_regime_in', 'standard_global'),
  fireTargetAge: Joi.number().min(20).max(100),
  emergencyFundMonths: Joi.number().min(1).max(36),
  locale: Joi.string().trim().max(20),
  timezone: Joi.string().trim().max(50),
  dateFormat: Joi.string().valid('DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'),
  fiscalYearStart: Joi.string().valid('april', 'january'),
  themePreference: Joi.string().valid('dark', 'light', 'system'),
  defaultPrivacyMask: Joi.boolean(),
  twoFactorEnabled: Joi.boolean(),
  notificationPreferences: Joi.object({
    budgetAlerts: Joi.boolean(),
    anomalyAlerts: Joi.boolean(),
    recurringAlerts: Joi.boolean(),
    weeklySummary: Joi.boolean(),
    debtMilestones: Joi.boolean(),
    emailNotifications: Joi.boolean(),
    browserNotifications: Joi.boolean(),
  }),
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required()
    .messages({
      'any.required': 'Current password is required',
    }),
  newPassword: Joi.string().min(8).max(128).required()
    .pattern(/[A-Z]/, 'uppercase')
    .pattern(/[0-9]/, 'digit')
    .messages({
      'string.min': 'New password must be at least 8 characters',
      'string.max': 'New password must not exceed 128 characters',
      'string.pattern.name': 'New password must contain at least one uppercase letter and one number',
      'any.required': 'New password is required',
    }),
});

module.exports = { updateProfileSchema, changePasswordSchema };
