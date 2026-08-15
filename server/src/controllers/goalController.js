const Goal = require('../models/Goal');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');

exports.getGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ userId: req.user._id });
  res.json(goals);
});

exports.createGoal = asyncHandler(async (req, res) => {
  const { name, targetAmount, currentAmount = 0, targetDate } = req.body;
  if (!name || targetAmount === undefined || !targetDate) {
    throw new BadRequestError('Please provide name, target amount, and target date');
  }

  const tAmt = Number(targetAmount);
  const cAmt = Number(currentAmount);
  const status = cAmt >= tAmt ? 'achieved' : 'active';

  const goal = await Goal.create({
    userId: req.user._id,
    name,
    targetAmount: tAmt,
    currentAmount: cAmt,
    targetDate: new Date(targetDate),
    currency: req.user.preferredCurrency || '₹',
    status,
  });

  res.status(201).json(goal);
});

exports.updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, userId: req.user._id });
  if (!goal) {
    throw new NotFoundError('Goal not found');
  }

  if (req.body.name !== undefined) goal.name = req.body.name;
  if (req.body.targetAmount !== undefined) goal.targetAmount = Number(req.body.targetAmount);
  if (req.body.currentAmount !== undefined) goal.currentAmount = Number(req.body.currentAmount);
  if (req.body.targetDate !== undefined) goal.targetDate = new Date(req.body.targetDate);
  if (req.body.status !== undefined) {
    goal.status = req.body.status;
  } else {
    if (goal.currentAmount >= goal.targetAmount && goal.status === 'active') {
      goal.status = 'achieved';
    } else if (goal.currentAmount < goal.targetAmount && goal.status === 'achieved') {
      goal.status = 'active';
    }
  }

  const updated = await goal.save();
  res.json(updated);
});

exports.deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!goal) {
    throw new NotFoundError('Goal not found');
  }
  res.json({ message: 'Goal deleted', id: req.params.id });
});
