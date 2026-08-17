const Expense = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');

// Escape special characters to prevent regex injection and syntax errors
const escapeRegex = (text = '') => {
  return String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// @desc    Get all expenses for logged in user with filtering & pagination
// @route   GET /api/expenses
exports.getExpenses = asyncHandler(async (req, res) => {
  const {
    category,
    startDate,
    endDate,
    merchant,
    search,
    tag,
    isTaxDeductible,
    taxSection,
    reimbursementStatus,
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

  if (tag) {
    query.tags = tag;
  }

  if (isTaxDeductible !== undefined) {
    query.isTaxDeductible = isTaxDeductible === 'true' || isTaxDeductible === true;
  }

  if (taxSection) {
    query.taxSection = taxSection;
  }

  if (reimbursementStatus) {
    query.reimbursementStatus = reimbursementStatus;
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
      { tags: { $regex: search, $options: 'i' } },
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

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 100;
  const skip = (pageNum - 1) * limitNum;

  const [expenses, total] = await Promise.all([
    Expense.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum),
    Expense.countDocuments(query),
  ]);

  res.json({
    expenses,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    total,
  });
});

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
exports.getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
  if (!expense) {
    throw new NotFoundError('Expense not found');
  }
  res.json(expense);
});

// @desc    Create new expense
// @route   POST /api/expenses
exports.createExpense = asyncHandler(async (req, res) => {
  const {
    title,
    amount,
    category,
    date,
    note,
    merchant,
    paymentMethod,
    tags,
    splits,
    isTaxDeductible,
    taxSection,
    reimbursementStatus,
    source,
  } = req.body;

  if (!title || amount === undefined || !category) {
    throw new BadRequestError('Please provide title, amount, and category');
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
    splits: splits || [],
    isTaxDeductible: Boolean(isTaxDeductible),
    taxSection: taxSection || '',
    reimbursementStatus: reimbursementStatus || 'none',
    source: source || 'manual',
  });

  res.status(201).json(expense);
});

// @desc    Update expense
// @route   PUT /api/expenses/:id
exports.updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
  if (!expense) {
    throw new NotFoundError('Expense not found');
  }

  const {
    title,
    amount,
    category,
    date,
    note,
    merchant,
    paymentMethod,
    tags,
    splits,
    isTaxDeductible,
    taxSection,
    reimbursementStatus,
  } = req.body;

  if (title !== undefined) expense.title = title;
  if (amount !== undefined) expense.amount = Number(amount);
  if (category !== undefined) expense.category = category;
  if (date !== undefined) expense.date = new Date(date);
  if (note !== undefined) expense.note = note;
  if (merchant !== undefined) expense.merchant = merchant;
  if (paymentMethod !== undefined) expense.paymentMethod = paymentMethod;
  if (tags !== undefined) expense.tags = tags;
  if (splits !== undefined) expense.splits = splits;
  if (isTaxDeductible !== undefined) expense.isTaxDeductible = Boolean(isTaxDeductible);
  if (taxSection !== undefined) expense.taxSection = taxSection;
  if (reimbursementStatus !== undefined) expense.reimbursementStatus = reimbursementStatus;

  const updatedExpense = await expense.save();
  res.json(updatedExpense);
});

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
exports.deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!expense) {
    throw new NotFoundError('Expense not found');
  }
  res.json({ message: 'Expense removed successfully', id: req.params.id });
});

// @desc    Get expense summary (running totals, counts)
// @route   GET /api/expenses/summary
exports.getExpenseSummary = asyncHandler(async (req, res) => {
  const expenses = await Expense.find({ userId: req.user._id });
  const totalAmount = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const count = expenses.length;

  res.json({
    totalAmount,
    count,
    currency: req.user.preferredCurrency || '₹',
  });
});
