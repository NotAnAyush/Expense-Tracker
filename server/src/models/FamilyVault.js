const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: ['OWNER', 'ADMIN', 'CONTRIBUTOR', 'VIEWER'],
    default: 'CONTRIBUTOR',
  },
  monthlySpendingLimit: {
    type: Number,
    default: 0, // 0 = unlimited
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const sharedBudgetSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  monthlyLimit: {
    type: Number,
    required: true,
    min: 0,
  },
});

const sharedExpenseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
  },
  paidByMemberId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  paidByMemberName: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  notes: {
    type: String,
    default: '',
  },
});

const familyVaultSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: 'Family Household Shared Ledger',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    currency: {
      type: String,
      default: '₹',
    },
    members: [familyMemberSchema],
    sharedBudgets: [sharedBudgetSchema],
    sharedExpenses: [sharedExpenseSchema],
  },
  {
    timestamps: true,
  }
);

familyVaultSchema.index({ 'members.userId': 1 });
familyVaultSchema.index({ 'members.email': 1 });

module.exports = mongoose.model('FamilyVault', familyVaultSchema);
