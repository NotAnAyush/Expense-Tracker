const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be non-negative'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    index: true,
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  note: {
    type: String,
    default: '',
    trim: true,
  },
  currency: {
    type: String,
    default: '₹',
  },
  merchant: {
    type: String,
    default: '',
    trim: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Card', 'Cash', 'UPI', 'Bank Transfer', 'Other'],
    default: 'Card',
  },
  tags: [{
    type: String,
    trim: true,
  }],
  splits: [{
    category: {
      type: String,
      required: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      default: '',
      trim: true,
    },
  }],
  isTaxDeductible: {
    type: Boolean,
    default: false,
  },
  taxSection: {
    type: String,
    default: '',
    trim: true,
  },
  reimbursementStatus: {
    type: String,
    enum: ['none', 'pending', 'submitted', 'reimbursed'],
    default: 'none',
  },
  recurringExpenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringExpense',
    default: null,
  },
  source: {
    type: String,
    enum: ['manual', 'recurring', 'ai_suggested', 'import', 'upi_sync', 'account_aggregator'],
    default: 'manual',
  },
  upiDetails: {
    vpa: { type: String, trim: true, default: '' },
    utr: { type: String, trim: true, sparse: true, index: true },
    upiApp: {
      type: String,
      enum: ['gpay', 'phonepe', 'paytm', 'cred', 'bhim', 'amazonpay', 'bank_app', 'other', 'unknown'],
      default: 'unknown',
    },
    bankRefNumber: { type: String, trim: true, default: '' },
    rawNarrative: { type: String, default: '' },
    accountMasked: { type: String, default: '' },
  },
}, {
  timestamps: true,
});

expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });
expenseSchema.index({ userId: 1, 'upiDetails.utr': 1 });

module.exports = mongoose.model('Expense', expenseSchema);
