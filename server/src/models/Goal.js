const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Goal name is required'],
    trim: true,
  },
  targetAmount: {
    type: Number,
    required: [true, 'Target amount is required'],
    min: [0, 'Target amount must be non-negative'],
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Current amount must be non-negative'],
  },
  targetDate: {
    type: Date,
    required: [true, 'Target date is required'],
  },
  currency: {
    type: String,
    default: '₹',
  },
  status: {
    type: String,
    enum: ['active', 'achieved', 'cancelled'],
    default: 'active',
  },
}, {
  timestamps: true,
});

goalSchema.index({ userId: 1, status: 1 });

module.exports = mongoose.model('Goal', goalSchema);
