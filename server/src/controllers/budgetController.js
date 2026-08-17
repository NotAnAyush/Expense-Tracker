const Budget = require('../models/Budget');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');

exports.getBudgets = asyncHandler(async (req, res) => {
  const budgets = await Budget.find({ userId: req.user._id });
  res.json(budgets);
});

exports.createBudget = asyncHandler(async (req, res) => {
  const { categoryId, amount, period = 'monthly', alertThreshold = 0.8 } = req.body;
  if (!categoryId || amount === undefined) {
    throw new BadRequestError('Please provide category and amount');
  }

  const cleanCat = String(categoryId).trim();

  const existing = await Budget.findOne({ userId: req.user._id, categoryId: cleanCat, period });
  if (existing) {
    existing.amount = Number(amount);
    existing.alertThreshold = Number(alertThreshold);
    const updated = await existing.save();
    return res.json(updated);
  }

  const budget = await Budget.create({
    userId: req.user._id,
    categoryId: cleanCat,
    amount: Number(amount),
    currency: req.user.preferredCurrency || '₹',
    period,
    alertThreshold: Number(alertThreshold),
  });

  res.status(201).json(budget);
});

exports.updateBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
  if (!budget) {
    throw new NotFoundError('Budget not found');
  }

  if (req.body.amount !== undefined) budget.amount = Number(req.body.amount);
  if (req.body.alertThreshold !== undefined) budget.alertThreshold = Number(req.body.alertThreshold);

  const updated = await budget.save();
  res.json(updated);
});

exports.deleteBudget = asyncHandler(async (req, res) => {
  const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!budget) {
    throw new NotFoundError('Budget not found');
  }
  res.json({ message: 'Budget deleted', id: req.params.id });
});
