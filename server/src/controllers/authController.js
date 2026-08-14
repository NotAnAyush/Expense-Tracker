const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const RecurringExpense = require('../models/RecurringExpense');
const Category = require('../models/Category');
const RefreshToken = require('../models/RefreshToken');
const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError, UnauthorizedError } = require('../utils/errors');

const generateAccessToken = (id) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_personal_finance_v2_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';
  return jwt.sign({ id }, secret, { expiresIn });
};

const createRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity

  await RefreshToken.create({
    userId,
    token,
    expiresAt,
  });

  return token;
};

// @desc    Register a new user
// @route   POST /api/auth/register
exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, preferredCurrency } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please provide name, email, and password' });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    passwordHash,
    preferredCurrency: preferredCurrency || '₹',
  });

  // Create default categories for user
  const defaultCategories = [
    { name: 'Food & Dining', icon: 'utensils', color: '#f97316', isDefault: true },
    { name: 'Transportation', icon: 'car', color: '#06b6d4', isDefault: true },
    { name: 'Housing & Utilities', icon: 'home', color: '#8b5cf6', isDefault: true },
    { name: 'Entertainment', icon: 'film', color: '#ec4899', isDefault: true },
    { name: 'Shopping', icon: 'shopping-bag', color: '#3b82f6', isDefault: true },
    { name: 'Health & Medical', icon: 'activity', color: '#10b981', isDefault: true },
    { name: 'Subscriptions', icon: 'repeat', color: '#6366f1', isDefault: true },
    { name: 'Income', icon: 'arrow-down-left', color: '#22c55e', type: 'income', isDefault: true },
  ];

  await Category.insertMany(defaultCategories.map(c => ({ ...c, userId: user._id })));

  const token = generateAccessToken(user._id);
  const refreshToken = await createRefreshToken(user._id);

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    preferredCurrency: user.preferredCurrency,
    token,
    refreshToken,
  });
});

// @desc    Authenticate user & get tokens
// @route   POST /api/auth/login
exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  const token = generateAccessToken(user._id);
  const refreshToken = await createRefreshToken(user._id);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    preferredCurrency: user.preferredCurrency,
    themePreference: user.themePreference,
    token,
    refreshToken,
  });
});

// @desc    Refresh access token using refresh token
// @route   POST /api/auth/refresh
exports.refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  const storedToken = await RefreshToken.findOne({ token: refreshToken });
  if (!storedToken) {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }

  if (new Date() > storedToken.expiresAt) {
    await RefreshToken.deleteOne({ _id: storedToken._id });
    return res.status(401).json({ message: 'Refresh token has expired' });
  }

  const user = await User.findById(storedToken.userId);
  if (!user) {
    await RefreshToken.deleteOne({ _id: storedToken._id });
    return res.status(401).json({ message: 'User no longer exists' });
  }

  // Token rotation: delete old refresh token and create new one
  await RefreshToken.deleteOne({ _id: storedToken._id });
  const newAccessToken = generateAccessToken(user._id);
  const newRefreshToken = await createRefreshToken(user._id);

  res.json({
    token: newAccessToken,
    refreshToken: newRefreshToken,
  });
});

// @desc    Logout user & invalidate refresh token
// @route   POST /api/auth/logout
exports.logoutUser = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  } else if (req.user) {
    await RefreshToken.deleteMany({ userId: req.user._id });
  }
  res.json({ message: 'Logged out successfully' });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  res.json(user);
});

// @desc    Create/Load Demo User with realistic seed data
// @route   POST /api/auth/demo
exports.seedDemoAccount = asyncHandler(async (req, res) => {
  const demoEmail = 'demo@antigravity.finance';
  let user = await User.findOne({ email: demoEmail });

  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('demo12345', salt);
    user = await User.create({
      name: 'Ayush Kaushik',
      email: demoEmail,
      passwordHash,
      preferredCurrency: '₹',
      themePreference: 'dark',
    });
  }

  // Seed/refresh demo data for user if requested or if no expenses exist
  const expenseCount = await Expense.countDocuments({ userId: user._id });
  if (expenseCount === 0 || req.body.forceRefresh) {
    await Expense.deleteMany({ userId: user._id });
    await Budget.deleteMany({ userId: user._id });
    await Goal.deleteMany({ userId: user._id });
    await RecurringExpense.deleteMany({ userId: user._id });

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Sample transactions over current and previous month
    const sampleExpenses = [
      // Current Month
      { title: 'Supermarket Grocery Run', amount: 3450, category: 'Food & Dining', date: new Date(currentYear, currentMonth, 2), merchant: 'BigBasket', paymentMethod: 'UPI' },
      { title: 'Airport Taxi Ride', amount: 1850, category: 'Transportation', date: new Date(currentYear, currentMonth, 3), merchant: 'Uber', paymentMethod: 'Card' },
      { title: 'Electric Bill', amount: 2400, category: 'Housing & Utilities', date: new Date(currentYear, currentMonth, 5), merchant: 'BSES Power', paymentMethod: 'Bank Transfer' },
      { title: 'Dinner with Team', amount: 4800, category: 'Food & Dining', date: new Date(currentYear, currentMonth, 7), merchant: 'Social Offline', paymentMethod: 'Card' },
      { title: 'Netflix Subscription', amount: 649, category: 'Subscriptions', date: new Date(currentYear, currentMonth, 8), merchant: 'Netflix', paymentMethod: 'Card' },
      { title: 'Weekend Movie Night', amount: 1200, category: 'Entertainment', date: new Date(currentYear, currentMonth, 9), merchant: 'PVR Cinemas', paymentMethod: 'UPI' },
      { title: 'Running Shoes', amount: 5490, category: 'Shopping', date: new Date(currentYear, currentMonth, 10), merchant: 'Nike Store', paymentMethod: 'Card' },
      { title: 'Starbucks Coffee', amount: 450, category: 'Food & Dining', date: new Date(currentYear, currentMonth, 11), merchant: 'Starbucks', paymentMethod: 'UPI' },
      { title: 'Unusual Large Tech Gadget Purchase', amount: 18500, category: 'Shopping', date: new Date(currentYear, currentMonth, 11), merchant: 'Croma Digital', paymentMethod: 'Card', note: 'New Monitor for Work' },

      // Previous Month
      { title: 'Monthly Groceries', amount: 4200, category: 'Food & Dining', date: new Date(currentYear, currentMonth - 1, 5), merchant: 'Blinkit', paymentMethod: 'UPI' },
      { title: 'Fuel Topup', amount: 2000, category: 'Transportation', date: new Date(currentYear, currentMonth - 1, 10), merchant: 'Indian Oil', paymentMethod: 'Card' },
      { title: 'House Rent', amount: 22000, category: 'Housing & Utilities', date: new Date(currentYear, currentMonth - 1, 1), merchant: 'Landlord', paymentMethod: 'Bank Transfer' },
      { title: 'Dining Out', amount: 2100, category: 'Food & Dining', date: new Date(currentYear, currentMonth - 1, 15), merchant: 'Toit Brewpub', paymentMethod: 'Card' },
      { title: 'Spotify Premium', amount: 119, category: 'Subscriptions', date: new Date(currentYear, currentMonth - 1, 18), merchant: 'Spotify', paymentMethod: 'Card' },
    ];

    await Expense.insertMany(sampleExpenses.map(e => ({ ...e, userId: user._id })));

    // Sample Budgets
    await Budget.insertMany([
      { userId: user._id, categoryId: 'Food & Dining', amount: 12000, currency: '₹', period: 'monthly', alertThreshold: 0.8 },
      { userId: user._id, categoryId: 'Transportation', amount: 5000, currency: '₹', period: 'monthly', alertThreshold: 0.8 },
      { userId: user._id, categoryId: 'Shopping', amount: 15000, currency: '₹', period: 'monthly', alertThreshold: 0.8 },
      { userId: user._id, categoryId: 'Entertainment', amount: 6000, currency: '₹', period: 'monthly', alertThreshold: 0.8 },
    ]);

    // Sample Goals
    await Goal.insertMany([
      { userId: user._id, name: 'Emergency Savings Fund', targetAmount: 100000, currentAmount: 65000, targetDate: new Date(currentYear + 1, 5, 1), currency: '₹', status: 'active' },
      { userId: user._id, name: 'Japan Travel Trip', targetAmount: 180000, currentAmount: 42000, targetDate: new Date(currentYear + 1, 9, 15), currency: '₹', status: 'active' },
    ]);

    // Sample Recurring Expenses
    await RecurringExpense.insertMany([
      { userId: user._id, title: 'Apartment Rent', amount: 22000, currency: '₹', category: 'Housing & Utilities', frequency: 'monthly', nextOccurrence: new Date(currentYear, currentMonth + 1, 1), active: true },
      { userId: user._id, title: 'Netflix 4K', amount: 649, currency: '₹', category: 'Subscriptions', frequency: 'monthly', nextOccurrence: new Date(currentYear, currentMonth, 28), active: true },
      { userId: user._id, title: 'Gym Membership', amount: 2500, currency: '₹', category: 'Health & Medical', frequency: 'monthly', nextOccurrence: new Date(currentYear, currentMonth, 25), active: true },
    ]);
  }

  const token = generateAccessToken(user._id);
  const refreshToken = await createRefreshToken(user._id);

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    preferredCurrency: user.preferredCurrency,
    themePreference: user.themePreference,
    token,
    refreshToken,
    isDemo: true,
  });
});
