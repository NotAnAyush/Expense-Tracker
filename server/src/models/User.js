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
  locale: {
    type: String,
    default: 'en-IN',
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata',
  },
  themePreference: {
    type: String,
    enum: ['dark', 'light', 'system'],
    default: 'dark',
  },
  notificationPreferences: {
    budgetAlerts: { type: Boolean, default: true },
    anomalyAlerts: { type: Boolean, default: true },
    weeklySummary: { type: Boolean, default: true },
  },
  onboardingCompleted: {
    type: Boolean,
    default: true,
  },
  aiConfig: {
    provider: {
      type: String,
      enum: ['gemini', 'openai', 'claude', 'groq', 'deepseek', 'mistral', 'openrouter', 'ollama', 'together', 'perplexity', 'xai', 'cohere', 'custom', 'local_rag'],
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
