const mongoose = require('mongoose');

const recurringExpenseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be non-negative'],
  },
  currency: {
    type: String,
    default: '₹',
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly',
  },
  nextOccurrence: {
    type: Date,
    required: [true, 'Next occurrence date is required'],
  },
  active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

recurringExpenseSchema.index({ userId: 1, active: 1 });

module.exports = mongoose.model('RecurringExpense', recurringExpenseSchema);
