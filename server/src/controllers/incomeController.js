const Income = require('../models/Income');
const asyncHandler = require('../utils/asyncHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');

// @desc    Get all incomes for logged in user with filtering & pagination
// @route   GET /api/income
exports.getIncomes = asyncHandler(async (req, res) => {
  const {
    category,
    startDate,
    endDate,
    source,
    search,
    tag,
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

  if (source) {
    query.source = { $regex: source, $options: 'i' };
  }

  if (tag) {
    query.tags = tag;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { note: { $regex: search, $options: 'i' } },
      { source: { $regex: search, $options: 'i' } },
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

  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 100;
  const skip = (pageNum - 1) * limitNum;

  const [incomes, total] = await Promise.all([
    Income.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum),
    Income.countDocuments(query),
  ]);

  res.json({
    incomes,
    page: pageNum,
    pages: Math.ceil(total / limitNum) || 1,
    total,
  });
});

// @desc    Get single income by ID
// @route   GET /api/income/:id
exports.getIncomeById = asyncHandler(async (req, res) => {
  const income = await Income.findOne({ _id: req.params.id, userId: req.user._id });
  if (!income) {
    throw new NotFoundError('Income record not found');
  }
  res.json(income);
});

// @desc    Create new income
// @route   POST /api/income
exports.createIncome = asyncHandler(async (req, res) => {
  const {
    title,
    amount,
    category,
    date,
    source,
    isRecurring,
    recurringFrequency,
    note,
    tags,
  } = req.body;

  if (!title || amount === undefined) {
    throw new BadRequestError('Please provide title and amount');
  }

  const income = await Income.create({
    userId: req.user._id,
    title,
    amount: Number(amount),
    category: category || 'Salary',
    date: date ? new Date(date) : new Date(),
    source: source || '',
    isRecurring: Boolean(isRecurring),
    recurringFrequency: recurringFrequency || 'one-time',
    currency: req.user.preferredCurrency || '₹',
    note: note || '',
    tags: tags || [],
  });

  res.status(201).json(income);
});

// @desc    Update income
// @route   PUT /api/income/:id
exports.updateIncome = asyncHandler(async (req, res) => {
  const income = await Income.findOne({ _id: req.params.id, userId: req.user._id });
  if (!income) {
    throw new NotFoundError('Income record not found');
  }

  const {
    title,
    amount,
    category,
    date,
    source,
    isRecurring,
    recurringFrequency,
    note,
    tags,
  } = req.body;

  if (title !== undefined) income.title = title;
  if (amount !== undefined) income.amount = Number(amount);
  if (category !== undefined) income.category = category;
  if (date !== undefined) income.date = new Date(date);
  if (source !== undefined) income.source = source;
  if (isRecurring !== undefined) income.isRecurring = Boolean(isRecurring);
  if (recurringFrequency !== undefined) income.recurringFrequency = recurringFrequency;
  if (note !== undefined) income.note = note;
  if (tags !== undefined) income.tags = tags;

  const updatedIncome = await income.save();
  res.json(updatedIncome);
});

// @desc    Delete income
// @route   DELETE /api/income/:id
exports.deleteIncome = asyncHandler(async (req, res) => {
  const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!income) {
    throw new NotFoundError('Income record not found');
  }
  res.json({ message: 'Income removed successfully', id: req.params.id });
});

// @desc    Get income summary (total amount, counts)
// @route   GET /api/income/summary
exports.getIncomeSummary = asyncHandler(async (req, res) => {
  const incomes = await Income.find({ userId: req.user._id });
  const totalAmount = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const count = incomes.length;

  res.json({
    totalAmount,
    count,
    currency: req.user.preferredCurrency || '₹',
  });
});
