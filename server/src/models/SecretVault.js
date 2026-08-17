const mongoose = require('mongoose');

const secretVaultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Secret label name is required'],
    trim: true,
  },
  category: {
    type: String,
    enum: ['ai_api_key', 'banking_secret', 'webhook_secret', 'custom_credential'],
    default: 'ai_api_key',
    index: true,
  },
  provider: {
    type: String,
    enum: ['gemini', 'openai', 'claude', 'groq', 'deepseek', 'together', 'mistral', 'openrouter', 'perplexity', 'xai', 'cohere', 'custom'],
    default: 'gemini',
    index: true,
  },
  encryptedValue: {
    type: String,
    required: [true, 'Encrypted secret payload is required'],
    select: true,
  },
  maskedValue: {
    type: String,
    required: [true, 'Masked secret representation is required'],
    trim: true,
  },
  customBaseUrl: {
    type: String,
    default: '',
    trim: true,
  },
  description: {
    type: String,
    default: '',
    trim: true,
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'REVOKED', 'EXPIRED'],
    default: 'ACTIVE',
    index: true,
  },
  lastUsedAt: {
    type: Date,
    default: null,
  },
  lastTestedAt: {
    type: Date,
    default: null,
  },
  latencyMs: {
    type: Number,
    default: null,
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, {
  timestamps: true,
});

secretVaultSchema.index({ userId: 1, provider: 1 });
secretVaultSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('SecretVault', secretVaultSchema);
