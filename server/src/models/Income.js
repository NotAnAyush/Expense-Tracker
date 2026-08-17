const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Income title is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be non-negative'],
  },
  category: {
    type: String,
    enum: ['Salary', 'Freelance', 'Investments', 'Rental', 'Dividends', 'Gift', 'Refund', 'Other'],
    default: 'Salary',
    index: true,
  },
  date: {
    type: Date,
    default: Date.now,
    index: true,
  },
  source: {
    type: String,
    default: '',
    trim: true,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringFrequency: {
    type: String,
    enum: ['monthly', 'bi-weekly', 'weekly', 'one-time'],
    default: 'one-time',
  },
  currency: {
    type: String,
    default: '₹',
  },
  note: {
    type: String,
    default: '',
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, {
  timestamps: true,
});

incomeSchema.index({ userId: 1, date: -1 });
incomeSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model('Income', incomeSchema);
