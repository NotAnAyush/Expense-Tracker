const Category = require('../models/Category');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [{ userId: req.user._id }, { userId: null }, { isDefault: true }],
      isArchived: false,
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching categories' });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, icon = 'tag', color = '#3b82f6', type = 'expense' } = req.body;
    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const category = await Category.create({
      userId: req.user._id,
      name,
      icon,
      color,
      type,
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating category' });
  }
};
