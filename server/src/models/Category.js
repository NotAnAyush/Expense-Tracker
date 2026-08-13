const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null, // Null indicates default global category
    index: true,
  },
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
  },
  icon: {
    type: String,
    default: 'tag',
  },
  color: {
    type: String,
    default: '#3b82f6',
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    default: 'expense',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

categorySchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Category', categorySchema);
