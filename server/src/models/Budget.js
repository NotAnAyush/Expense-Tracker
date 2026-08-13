const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  categoryId: {
    type: String,
    required: [true, 'Category ID or name is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Amount must be non-negative'],
  },
  currency: {
    type: String,
    default: '₹',
  },
  period: {
    type: String,
    enum: ['monthly', 'weekly', 'yearly'],
    default: 'monthly',
  },
  alertThreshold: {
    type: Number,
    default: 0.8, // 80%
    min: 0,
    max: 1,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

budgetSchema.index({ userId: 1, categoryId: 1, period: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
