const Goal = require('../models/Goal');

exports.getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching goals' });
  }
};

exports.createGoal = async (req, res) => {
  try {
    const { name, targetAmount, currentAmount = 0, targetDate } = req.body;
    if (!name || targetAmount === undefined || !targetDate) {
      return res.status(400).json({ message: 'Please provide name, target amount, and target date' });
    }

    const goal = await Goal.create({
      userId: req.user._id,
      name,
      targetAmount: Number(targetAmount),
      currentAmount: Number(currentAmount),
      targetDate: new Date(targetDate),
      currency: req.user.preferredCurrency || '₹',
    });

    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating goal' });
  }
};

exports.updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    if (req.body.name !== undefined) goal.name = req.body.name;
    if (req.body.targetAmount !== undefined) goal.targetAmount = Number(req.body.targetAmount);
    if (req.body.currentAmount !== undefined) goal.currentAmount = Number(req.body.currentAmount);
    if (req.body.targetDate !== undefined) goal.targetDate = new Date(req.body.targetDate);
    if (req.body.status !== undefined) goal.status = req.body.status;

    const updated = await goal.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating goal' });
  }
};

exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json({ message: 'Goal deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting goal' });
  }
};
