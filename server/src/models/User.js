const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
  },
  preferredCurrency: {
    type: String,
    default: '₹',
  },
  phone: {
    type: String,
    trim: true,
    default: '',
  },
  upiId: {
    type: String,
    trim: true,
    default: '',
  },
  avatarUrl: {
    type: String,
    default: '',
  },
  avatarStyle: {
    type: String,
    enum: ['gradient_gold', 'gradient_mint', 'gradient_violet', 'gradient_flame', 'custom_url', 'emoji'],
    default: 'gradient_gold',
  },
  avatarEmoji: {
    type: String,
    default: '👑',
  },
  occupation: {
    type: String,
    trim: true,
    default: 'Wealth Architect',
  },
  financialPersona: {
    type: String,
    enum: ['sovereign_wealth', 'fire_aspirant', 'balanced_saver', 'digital_nomad', 'investor'],
    default: 'sovereign_wealth',
  },
  bio: {
    type: String,
    trim: true,
    default: 'Building sovereign financial freedom & compounding wealth.',
  },
  location: {
    type: String,
    trim: true,
    default: 'Bangalore, India',
  },
  monthlyIncomeEstimate: {
    type: Number,
    default: 0,
    min: 0,
  },
  targetSavingsRate: {
    type: Number,
    default: 40,
    min: 5,
    max: 95,
  },
  defaultPaymentMethod: {
    type: String,
    enum: ['UPI', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Cash'],
    default: 'UPI',
  },
  taxRegime: {
    type: String,
    enum: ['new_regime_in', 'old_regime_in', 'standard_global'],
    default: 'new_regime_in',
  },
  fireTargetAge: {
    type: Number,
    default: 45,
    min: 20,
    max: 100,
  },
  emergencyFundMonths: {
    type: Number,
    default: 6,
    min: 1,
    max: 36,
  },
  locale: {
    type: String,
    default: 'en-IN',
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
  },
  dateFormat: {
    type: String,
    enum: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
    default: 'DD/MM/YYYY',
  },
  fiscalYearStart: {
    type: String,
    enum: ['april', 'january'],
    default: 'april',
  },
  themePreference: {
    type: String,
    enum: ['dark', 'light', 'system'],
    default: 'dark',
  },
  defaultPrivacyMask: {
    type: Boolean,
    default: false,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  notificationPreferences: {
    budgetAlerts: { type: Boolean, default: true },
    anomalyAlerts: { type: Boolean, default: true },
    recurringAlerts: { type: Boolean, default: true },
    weeklySummary: { type: Boolean, default: true },
    debtMilestones: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: false },
    browserNotifications: { type: Boolean, default: false },
  },
  onboardingCompleted: {
    type: Boolean,
    default: true,
  },
  aiConfig: {
    provider: {
      type: String,
      enum: ['gemini', 'openai', 'claude', 'groq', 'deepseek', 'mistral', 'openrouter', 'ollama', 'custom', 'local_rag'],
      default: 'gemini',
    },
    model: {
      type: String,
      default: 'gemini-1.5-flash',
    },
    apiKey: {
      type: String,
      default: '',
    },
    customBaseUrl: {
      type: String,
      default: '',
    },
    customHeaders: {
      type: Map,
      of: String,
      default: {},
    },
    temperature: {
      type: Number,
      default: 0.2,
      min: 0,
      max: 2,
    },
    useLocalRagFallback: {
      type: Boolean,
      default: true,
    },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);
