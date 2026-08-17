const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: '',
  },
  upiId: {
    type: String,
    trim: true,
    default: '',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
});

const SplitItemSchema = new mongoose.Schema({
  memberName: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  percentage: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
});

const GroupExpenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  paidBy: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  category: {
    type: String,
    default: 'General',
  },
  splitType: {
    type: String,
    enum: ['EQUAL', 'EXACT', 'PERCENT'],
    default: 'EQUAL',
  },
  splits: [SplitItemSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

const SettlementSchema = new mongoose.Schema({
  fromMember: {
    type: String,
    required: true,
  },
  toMember: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0.01,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  method: {
    type: String,
    enum: ['UPI', 'Cash', 'Bank Transfer', 'Other'],
    default: 'UPI',
  },
  notes: {
    type: String,
    trim: true,
    default: '',
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

const GroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    currency: {
      type: String,
      default: 'INR',
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: [MemberSchema],
    expenses: [GroupExpenseSchema],
    settlements: [SettlementSchema],
  },
  {
    timestamps: true,
  }
);

GroupSchema.index({ createdBy: 1, updatedAt: -1 });

module.exports = {
  Group: mongoose.model('Group', GroupSchema),
};
