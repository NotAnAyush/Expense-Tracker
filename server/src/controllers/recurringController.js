const RecurringExpense = require('../models/RecurringExpense');
const Expense = require('../models/Expense');

const escapeRegex = (text = '') => {
  return String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// @desc    Get all recurring expenses for logged in user
// @route   GET /api/recurring
exports.getRecurringExpenses = async (req, res) => {
  try {
    const recurring = await RecurringExpense.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(recurring);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching recurring expenses' });
  }
};

// @desc    Create new recurring expense / subscription
// @route   POST /api/recurring
exports.createRecurringExpense = async (req, res) => {
  try {
    const { title, amount, category, frequency = 'monthly', nextOccurrence, active = true } = req.body;
    if (!title || amount === undefined || !category || !nextOccurrence) {
      return res.status(400).json({ message: 'Please provide title, amount, category, and next occurrence date' });
    }

    const item = await RecurringExpense.create({
      userId: req.user._id,
      title,
      amount: Number(amount),
      category,
      frequency,
      nextOccurrence: new Date(nextOccurrence),
      active: Boolean(active),
      currency: req.user.preferredCurrency || '₹',
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Server error creating recurring expense' });
  }
};

// @desc    Update recurring expense / subscription
// @route   PUT /api/recurring/:id
exports.updateRecurringExpense = async (req, res) => {
  try {
    const item = await RecurringExpense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ message: 'Recurring expense not found' });

    if (req.body.title !== undefined) item.title = req.body.title;
    if (req.body.amount !== undefined) item.amount = Number(req.body.amount);
    if (req.body.category !== undefined) item.category = req.body.category;
    if (req.body.frequency !== undefined) item.frequency = req.body.frequency;
    if (req.body.nextOccurrence !== undefined) item.nextOccurrence = new Date(req.body.nextOccurrence);
    if (req.body.active !== undefined) item.active = Boolean(req.body.active);

    const updated = await item.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error updating recurring expense' });
  }
};

// @desc    Delete recurring expense
// @route   DELETE /api/recurring/:id
exports.deleteRecurringExpense = async (req, res) => {
  try {
    const item = await RecurringExpense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ message: 'Recurring expense not found' });
    res.json({ message: 'Recurring expense deleted', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting recurring expense' });
  }
};

// @desc    Get subscription payment history timeline & analytics
// @route   GET /api/recurring/:id/history
exports.getRecurringHistory = async (req, res) => {
  try {
    const item = await RecurringExpense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ message: 'Subscription not found' });

    // Find all linked expenses with safe regex escaping
    const safeTitle = escapeRegex(item.title);
    const historyExpenses = await Expense.find({
      userId: req.user._id,
      $or: [
        { recurringExpenseId: item._id },
        { title: { $regex: safeTitle, $options: 'i' } },
        { merchant: { $regex: safeTitle, $options: 'i' } },
      ],
    }).sort({ date: -1 });

    const totalSpentAllTime = historyExpenses.reduce((sum, e) => sum + e.amount, 0);
    const paymentCount = historyExpenses.length;
    const averagePayment = paymentCount > 0 ? Math.round(totalSpentAllTime / paymentCount) : item.amount;
    const lastPaidDate = historyExpenses.length > 0 ? historyExpenses[0].date : null;

    const now = new Date();
    const nextDate = new Date(item.nextOccurrence);
    const diffDays = Math.ceil((nextDate - now) / (1000 * 60 * 60 * 24));

    let status = 'Upcoming';
    if (diffDays < 0) status = 'Overdue';
    else if (diffDays <= 5) status = 'Due Soon';

    res.json({
      subscription: item,
      totalSpentAllTime,
      paymentCount,
      averagePayment,
      lastPaidDate,
      daysUntilDue: diffDays,
      status,
      history: historyExpenses,
    });
  } catch (error) {
    console.error('[Recurring History Error]', error);
    res.status(500).json({ message: 'Server error fetching subscription history' });
  }
};

// @desc    Record/Mark subscription as paid for current cycle
// @route   POST /api/recurring/:id/pay
exports.recordRecurringPayment = async (req, res) => {
  try {
    const item = await RecurringExpense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ message: 'Subscription not found' });

    // 1. Create linked expense
    const expense = await Expense.create({
      userId: req.user._id,
      title: item.title,
      amount: item.amount,
      category: item.category,
      date: new Date(),
      merchant: item.title,
      paymentMethod: 'Card',
      recurringExpenseId: item._id,
      source: 'recurring',
      note: `Automatic subscription cycle payment for ${item.title}`,
      currency: item.currency || '₹',
    });

    // 2. Auto-advance next occurrence date
    const currentNext = new Date(item.nextOccurrence);
    if (item.frequency === 'monthly') {
      currentNext.setMonth(currentNext.getMonth() + 1);
    } else if (item.frequency === 'weekly') {
      currentNext.setDate(currentNext.getDate() + 7);
    } else if (item.frequency === 'yearly') {
      currentNext.setFullYear(currentNext.getFullYear() + 1);
    } else if (item.frequency === 'daily') {
      currentNext.setDate(currentNext.getDate() + 1);
    }

    item.nextOccurrence = currentNext;
    await item.save();

    res.status(201).json({
      message: 'Subscription payment recorded successfully',
      subscription: item,
      expense,
    });
  } catch (error) {
    console.error('[Record Recurring Payment Error]', error);
    res.status(500).json({ message: 'Server error recording subscription payment' });
  }
};
