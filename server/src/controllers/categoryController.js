const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError, ConflictError } = require('../utils/errors');

exports.getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({
    $or: [{ userId: req.user._id }, { userId: null }, { isDefault: true }],
    isArchived: false,
  });
  res.json(categories);
});

exports.createCategory = asyncHandler(async (req, res) => {
  const { name, icon = 'tag', color = '#3b82f6', type = 'expense' } = req.body;
  if (!name || !name.trim()) {
    throw new BadRequestError('Category name is required');
  }

  const cleanName = name.trim();

  // Check if category already exists for this user (case-insensitive)
  const existing = await Category.findOne({
    userId: req.user._id,
    name: { $regex: new RegExp(`^${cleanName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
    isArchived: false,
  });

  if (existing) {
    throw new ConflictError(`Category '${cleanName}' already exists`);
  }

  const category = await Category.create({
    userId: req.user._id,
    name: cleanName,
    icon,
    color,
    type,
  });

  res.status(201).json(category);
});
