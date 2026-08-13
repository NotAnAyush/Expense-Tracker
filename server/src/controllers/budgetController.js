const Budget = require('../models/Budget');

exports.getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching budgets' });
  }
};

exports.createBudget = async (req, res) => {
  try {
    const { categoryId, amount, period = 'monthly', alertThreshold = 0.8 } = req.body;
    if (!categoryId || amount === undefined) {
      return res.status(400).json({ message: 'Please provide category and amount' });
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
  } catch (error) {
    res.status(500).json({ message: 'Server error creating budget' });
  }
};

exports.updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    if (req.body.amount !== undefined) budget.amount = Number(req.body.amount);
    if (req.body.alertThreshold !== undefined) budget.alertThreshold = Number(req.body.alertThreshold);

    const updated = await budget.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating budget' });
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json({ message: 'Budget deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting budget' });
  }
};
