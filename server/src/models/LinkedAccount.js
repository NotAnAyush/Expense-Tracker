const mongoose = require('mongoose');

const linkedAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  accountType: {
    type: String,
    enum: ['bank_account', 'upi_vpa', 'credit_card', 'wallet'],
    default: 'bank_account',
  },
  provider: {
    type: String,
    enum: ['setu_aa', 'onemoney_aa', 'finvu_aa', 'razorpay', 'manual_vpa', 'sms_sync'],
    default: 'setu_aa',
  },
  bankName: {
    type: String,
    required: [true, 'Bank name is required'],
    trim: true,
  },
  accountMasked: {
    type: String,
    required: [true, 'Masked account number is required'],
    trim: true,
  },
  accountHolderName: {
    type: String,
    trim: true,
    default: '',
  },
  upiId: {
    type: String,
    trim: true,
    default: '',
  },
  consentHandle: {
    type: String,
    trim: true,
    default: '',
  },
  consentStatus: {
    type: String,
    enum: ['ACTIVE', 'PENDING_OTP', 'EXPIRED', 'REVOKED'],
    default: 'ACTIVE',
    index: true,
  },
  consentExpiry: {
    type: Date,
    default: null,
  },
  encryptedToken: {
    type: String,
    default: '',
  },
  balance: {
    type: Number,
    default: 0,
  },
  lastSyncedAt: {
    type: Date,
    default: Date.now,
  },
  syncFrequency: {
    type: String,
    enum: ['realtime_webhook', 'hourly', 'daily', 'manual'],
    default: 'realtime_webhook',
  },
  autoCategorize: {
    type: Boolean,
    default: true,
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
}, {
  timestamps: true,
});

linkedAccountSchema.index({ userId: 1, consentStatus: 1 });
linkedAccountSchema.index({ userId: 1, upiId: 1 });

module.exports = mongoose.model('LinkedAccount', linkedAccountSchema);
