const mongoose = require('mongoose');

const DebtPaymentLogSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  principalPortion: {
    type: Number,
    default: 0,
  },
  interestPortion: {
    type: Number,
    default: 0,
  },
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    default: null,
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
}, { timestamps: true });

const DebtSchema = new mongoose.Schema(
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
    category: {
      type: String,
      enum: ['Credit Card', 'Personal Loan', 'Student Loan', 'Auto Loan', 'Home Loan', 'Medical', 'Other'],
      default: 'Credit Card',
    },
    principalBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    originalBalance: {
      type: Number,
      default: function () {
        return this.principalBalance;
      },
    },
    interestRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100, // Annual Percentage Rate (APR %)
    },
    minimumPayment: {
      type: Number,
      required: true,
      min: 0,
    },
    dueDay: {
      type: Number,
      min: 1,
      max: 31,
      default: 1,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAID_OFF'],
      default: 'ACTIVE',
      index: true,
    },
    payments: [DebtPaymentLogSchema],
  },
  {
    timestamps: true,
  }
);

DebtSchema.index({ userId: 1, status: 1 });

module.exports = {
  Debt: mongoose.model('Debt', DebtSchema),
};
