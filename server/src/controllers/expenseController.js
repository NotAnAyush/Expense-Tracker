const Expense = require('../models/Expense');

// @desc    Get all expenses for logged in user with filtering & pagination
// @route   GET /api/expenses
exports.getExpenses = async (req, res) => {
  try {
    const {
      category,
      startDate,
      endDate,
      merchant,
      search,
      paymentMethod,
      minAmount,
      maxAmount,
      sortBy = 'date',
      order = 'desc',
      page = 1,
      limit = 100,
    } = req.query;

    const query = { userId: req.user._id };

    if (category) {
      query.category = category;
    }

    if (merchant) {
      query.merchant = { $regex: merchant, $options: 'i' };
    }

    if (paymentMethod) {
      query.paymentMethod = paymentMethod;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { note: { $regex: search, $options: 'i' } },
        { merchant: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (minAmount || maxAmount) {
      query.amount = {};
      if (minAmount) query.amount.$gte = Number(minAmount);
      if (maxAmount) query.amount.$lte = Number(maxAmount);
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const skip = (Number(page) - 1) * Number(limit);

    const expenses = await Expense.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Expense.countDocuments(query);

    res.json({
      expenses,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)) || 1,
      total,
    });
  } catch (error) {
    console.error('[Get Expenses Error]', error);
    res.status(500).json({ message: 'Server error fetching expenses' });
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching expense' });
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
exports.createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, note, merchant, paymentMethod, tags, source } = req.body;

    if (!title || amount === undefined || !category) {
      return res.status(400).json({ message: 'Please provide title, amount, and category' });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      title,
      amount: Number(amount),
      category,
      date: date ? new Date(date) : new Date(),
      note: note || '',
      currency: req.user.preferredCurrency || '₹',
      merchant: merchant || '',
      paymentMethod: paymentMethod || 'Card',
      tags: tags || [],
      source: source || 'manual',
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error('[Create Expense Error]', error);
    res.status(500).json({ message: 'Server error creating expense' });
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const { title, amount, category, date, note, merchant, paymentMethod, tags } = req.body;

    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = Number(amount);
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = new Date(date);
    if (note !== undefined) expense.note = note;
    if (merchant !== undefined) expense.merchant = merchant;
    if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
    if (tags !== undefined) expense.tags = tags;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (error) {
    console.error('[Update Expense Error]', error);
    res.status(500).json({ message: 'Server error updating expense' });
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense removed successfully', id: req.params.id });
  } catch (error) {
    console.error('[Delete Expense Error]', error);
    res.status(500).json({ message: 'Server error deleting expense' });
  }
};

// @desc    Get expense summary (running totals, counts)
// @route   GET /api/expenses/summary
exports.getExpenseSummary = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const count = expenses.length;

    res.json({
      totalAmount,
      count,
      currency: req.user.preferredCurrency || '₹',
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching expense summary' });
  }
};
