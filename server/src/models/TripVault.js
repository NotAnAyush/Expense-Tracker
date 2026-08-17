const mongoose = require('mongoose');

const TripExpenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  foreignAmount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  currency: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
  },
  exchangeRate: {
    type: Number,
    required: true,
    min: 0.000001,
  },
  baseAmount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  category: {
    type: String,
    default: 'Travel & Vacation',
  },
  date: {
    type: Date,
    default: Date.now,
  },
  paymentMethod: {
    type: String,
    default: 'Card',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

const TripVaultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    destination: {
      type: String,
      required: true,
      trim: true,
    },
    tripCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      default: 'USD',
    },
    baseCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      default: 'INR',
    },
    budgetBaseCurrency: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PLANNING', 'ACTIVE', 'COMPLETED'],
      default: 'ACTIVE',
      index: true,
    },
    expenses: [TripExpenseSchema],
  },
  {
    timestamps: true,
  }
);

TripVaultSchema.index({ userId: 1, status: 1, updatedAt: -1 });

module.exports = {
  TripVault: mongoose.model('TripVault', TripVaultSchema),
};
