const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const RecurringExpense = require('../models/RecurringExpense');
const { Debt } = require('../models/Debt');
const { TripVault } = require('../models/TripVault');
const { Group } = require('../models/Group');
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

// @desc    Create/Load Demo User with comprehensive, realistic seed data
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
      aiConfig: {
        provider: 'gemini',
        model: 'gemini-3.7-flash',
        temperature: 0.2,
        useLocalRagFallback: true,
      },
    });
  } else {
    // Ensure AI config is up to date for demo user
    user.aiConfig = {
      provider: 'gemini',
      model: 'gemini-3.7-flash',
      temperature: 0.2,
      useLocalRagFallback: true,
    };
    await user.save();
  }

  // Check if any core collection is empty or if explicit reset was requested
  const [expenseCount, incomeCount, debtCount, tripCount, groupCount] = await Promise.all([
    Expense.countDocuments({ userId: user._id }),
    Income.countDocuments({ userId: user._id }),
    Debt.countDocuments({ userId: user._id }),
    TripVault.countDocuments({ userId: user._id }),
    Group.countDocuments({ createdBy: user._id }),
  ]);

  const needsRefresh = req.body.forceRefresh || expenseCount === 0 || incomeCount === 0 || debtCount === 0 || tripCount === 0 || groupCount === 0;

  if (needsRefresh) {
    await Promise.all([
      Expense.deleteMany({ userId: user._id }),
      Income.deleteMany({ userId: user._id }),
      Budget.deleteMany({ userId: user._id }),
      Goal.deleteMany({ userId: user._id }),
      RecurringExpense.deleteMany({ userId: user._id }),
      Debt.deleteMany({ userId: user._id }),
      TripVault.deleteMany({ userId: user._id }),
      Group.deleteMany({ createdBy: user._id }),
    ]);

    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();

    // -------------------------------------------------------------
    // 1. SEED INCOMES (3 Months Rolling History)
    // -------------------------------------------------------------
    const sampleIncomes = [
      // Current Month
      { userId: user._id, title: 'Lead Full-Stack AI Engineer Salary', amount: 98500, category: 'Salary', date: new Date(curYear, curMonth, 1), source: 'Antigravity Technologies', isRecurring: true, recurringFrequency: 'monthly', currency: '₹', tags: ['#salary', '#tech', '#primary'], note: 'Monthly direct deposit net salary' },
      { userId: user._id, title: 'Generative AI Architecture Retainer', amount: 32000, category: 'Freelance', date: new Date(curYear, curMonth, 12), source: 'Starlight Studios NYC', isRecurring: true, recurringFrequency: 'monthly', currency: '₹', tags: ['#freelance', '#consulting'], note: 'Monthly UI/UX and LLM advisory retainer' },
      { userId: user._id, title: 'Nifty 50 & Global ETF Dividends', amount: 5400, category: 'Dividends', date: new Date(curYear, curMonth, 20), source: 'Zerodha Portfolio', isRecurring: false, currency: '₹', tags: ['#investments', '#dividends'], note: 'Quarterly dividend yield payout' },

      // Previous Month (M-1)
      { userId: user._id, title: 'Lead Full-Stack AI Engineer Salary', amount: 98500, category: 'Salary', date: new Date(curYear, curMonth - 1, 1), source: 'Antigravity Technologies', isRecurring: true, recurringFrequency: 'monthly', currency: '₹', tags: ['#salary'] },
      { userId: user._id, title: 'Mobile App Design Sprint', amount: 28500, category: 'Freelance', date: new Date(curYear, curMonth - 1, 14), source: 'HyperDrive Labs', isRecurring: false, currency: '₹', tags: ['#freelance'] },
      { userId: user._id, title: 'Quarterly Performance Bonus', amount: 25000, category: 'Salary', date: new Date(curYear, curMonth - 1, 22), source: 'Antigravity Technologies', isRecurring: false, currency: '₹', tags: ['#bonus', '#salary'], note: 'Q3 engineering excellence bonus' },

      // Two Months Ago (M-2)
      { userId: user._id, title: 'Lead Full-Stack AI Engineer Salary', amount: 98500, category: 'Salary', date: new Date(curYear, curMonth - 2, 1), source: 'Antigravity Technologies', isRecurring: true, recurringFrequency: 'monthly', currency: '₹', tags: ['#salary'] },
      { userId: user._id, title: 'UI Component Kit Digital Asset Sales', amount: 18000, category: 'Freelance', date: new Date(curYear, curMonth - 2, 10), source: 'Gumroad Digital', isRecurring: false, currency: '₹', tags: ['#digital', '#freelance'] },
      { userId: user._id, title: 'Equity Dividend Payout', amount: 4800, category: 'Dividends', date: new Date(curYear, curMonth - 2, 25), source: 'Vanguard All-World', isRecurring: false, currency: '₹', tags: ['#dividends'] },
    ];
    await Income.insertMany(sampleIncomes);

    // -------------------------------------------------------------
    // 2. SEED EXPENSES (Realistic 3 Months Across All Categories)
    // -------------------------------------------------------------
    const sampleExpenses = [
      // Current Month (M-0)
      { title: 'Apartment Lease & Society Maintenance', amount: 22000, category: 'Housing & Utilities', date: new Date(curYear, curMonth, 1), merchant: 'Indiranagar Heights', paymentMethod: 'Bank Transfer', currency: '₹', tags: ['#rent', '#housing'], note: 'Monthly apartment rent' },
      { title: 'Supermarket Organic Grocery Run', amount: 4650, category: 'Food & Dining', date: new Date(curYear, curMonth, 2), merchant: 'BigBasket Supermarket', paymentMethod: 'UPI', currency: '₹', tags: ['#groceries', '#food'] },
      { title: 'Airport Uber Premier Express', amount: 1850, category: 'Transportation', date: new Date(curYear, curMonth, 3), merchant: 'Uber India', paymentMethod: 'Card', currency: '₹', tags: ['#travel', '#taxi'] },
      { title: 'ACT Fibernet 300Mbps Broadband', amount: 1199, category: 'Housing & Utilities', date: new Date(curYear, curMonth, 4), merchant: 'ACT Fibernet', paymentMethod: 'UPI', currency: '₹', tags: ['#internet', '#utilities'] },
      { title: 'BSES Green Electricity Bill', amount: 2400, category: 'Housing & Utilities', date: new Date(curYear, curMonth, 5), merchant: 'BSES Rajdhani Power', paymentMethod: 'Bank Transfer', currency: '₹', tags: ['#electricity', '#utilities'] },
      { title: 'Team Networking & Dinner', amount: 4800, category: 'Food & Dining', date: new Date(curYear, curMonth, 6), merchant: 'Social Offline Brewery', paymentMethod: 'Card', currency: '₹', tags: ['#dining', '#team'] },
      { title: 'Whole Foods Fresh Market', amount: 1420, category: 'Food & Dining', date: new Date(curYear, curMonth, 7), merchant: 'Blinkit Grocery', paymentMethod: 'UPI', currency: '₹', tags: ['#groceries'] },
      { title: 'Netflix 4K UHD Subscription', amount: 649, category: 'Subscriptions', date: new Date(curYear, curMonth, 8), merchant: 'Netflix', paymentMethod: 'Card', currency: '₹', tags: ['#subscriptions', '#entertainment'] },
      { title: 'Spotify Family Audio Streaming', amount: 179, category: 'Subscriptions', date: new Date(curYear, curMonth, 9), merchant: 'Spotify', paymentMethod: 'Card', currency: '₹', tags: ['#subscriptions', '#music'] },
      { title: 'Nike Pegasus 40 Running Shoes', amount: 5490, category: 'Shopping', date: new Date(curYear, curMonth, 10), merchant: 'Nike Flagship Store', paymentMethod: 'Card', currency: '₹', tags: ['#fitness', '#apparel'], note: 'Marathon training shoes' },
      { title: 'Cult.fit Elite Gym Membership', amount: 2500, category: 'Health & Medical', date: new Date(curYear, curMonth, 11), merchant: 'Cult.fit Fitness Center', paymentMethod: 'UPI', currency: '₹', tags: ['#health', '#gym'] },
      { title: 'Claude AI Pro & OpenAI Plus Developer Tools', amount: 3998, category: 'Subscriptions', date: new Date(curYear, curMonth, 12), merchant: 'Anthropic & OpenAI', paymentMethod: 'Card', currency: '₹', isTaxDeductible: true, taxSection: 'Section 80C / Business Expense', tags: ['#ai', '#software', '#taxDeductible'], note: 'Software development AI tooling' },
      { title: 'Starbucks Artisan Coffee & Pastry', amount: 480, category: 'Food & Dining', date: new Date(curYear, curMonth, 13), merchant: 'Starbucks Coffee', paymentMethod: 'UPI', currency: '₹', tags: ['#coffee'] },
      { title: 'Shell V-Power Fuel Topup', amount: 2500, category: 'Transportation', date: new Date(curYear, curMonth, 14), merchant: 'Shell Petrol Station', paymentMethod: 'Card', currency: '₹', tags: ['#fuel', '#car'] },
      { title: 'Amazon Basics Office Ergonomic Kit', amount: 2150, category: 'Shopping', date: new Date(curYear, curMonth, 15), merchant: 'Amazon Retail', paymentMethod: 'UPI', currency: '₹', tags: ['#office', '#shopping'] },
      { title: 'PVR Director\'s Cut IMAX Tickets', amount: 1800, category: 'Entertainment', date: new Date(curYear, curMonth, 16), merchant: 'PVR Cinemas', paymentMethod: 'Card', currency: '₹', tags: ['#movies', '#weekend'] },
      { title: 'Apollo Pharmacy Health Supplements', amount: 1350, category: 'Health & Medical', date: new Date(curYear, curMonth, 17), merchant: 'Apollo Pharmacy', paymentMethod: 'UPI', currency: '₹', tags: ['#health', '#medicine'] },
      { title: 'Weekend Craft Pizza & Drinks', amount: 2850, category: 'Food & Dining', date: new Date(curYear, curMonth, 18), merchant: 'Toit Brewpub', paymentMethod: 'Card', currency: '₹', tags: ['#dining', '#weekend'] },
      { title: 'Dual Monitor Ergonomic Arm Mount', amount: 4200, category: 'Shopping', date: new Date(curYear, curMonth, 19), merchant: 'Amazon Business', paymentMethod: 'Card', currency: '₹', isTaxDeductible: true, taxSection: 'Section 32 Depreciation', tags: ['#hardware', '#taxDeductible'] },

      // Previous Month (M-1)
      { title: 'Monthly Apartment Lease', amount: 22000, category: 'Housing & Utilities', date: new Date(curYear, curMonth - 1, 1), merchant: 'Indiranagar Heights', paymentMethod: 'Bank Transfer', currency: '₹', tags: ['#rent'] },
      { title: 'Monthly Groceries & Pantry', amount: 5100, category: 'Food & Dining', date: new Date(curYear, curMonth - 1, 4), merchant: 'BigBasket', paymentMethod: 'UPI', currency: '₹', tags: ['#groceries'] },
      { title: 'Annual Executive Health Checkup', amount: 3200, category: 'Health & Medical', date: new Date(curYear, curMonth - 1, 8), merchant: 'Max Healthcare Labs', paymentMethod: 'Card', currency: '₹', isTaxDeductible: true, taxSection: 'Section 80D', tags: ['#medical', '#taxDeductible'], note: 'Preventive health screening' },
      { title: 'AWS Cloud Server Infrastructure', amount: 1450, category: 'Housing & Utilities', date: new Date(curYear, curMonth - 1, 12), merchant: 'Amazon Web Services', paymentMethod: 'Card', currency: '₹', isTaxDeductible: true, tags: ['#cloud', '#taxDeductible'] },
      { title: 'Flight Tickets to Mumbai Tech Summit', amount: 6200, category: 'Transportation', date: new Date(curYear, curMonth - 1, 16), merchant: 'IndiGo Airlines', paymentMethod: 'Card', currency: '₹', tags: ['#travel', '#flights'] },
      { title: 'Gourmet Dinner with Friends', amount: 3600, category: 'Food & Dining', date: new Date(curYear, curMonth - 1, 20), merchant: 'Farzi Cafe', paymentMethod: 'Card', currency: '₹', tags: ['#dining'] },
      { title: 'Unusual Workstation 4K Display', amount: 18500, category: 'Shopping', date: new Date(curYear, curMonth - 1, 24), merchant: 'Croma Electronics', paymentMethod: 'Card', currency: '₹', isTaxDeductible: true, tags: ['#tech', '#taxDeductible'], note: '32-inch 4K Studio Display' },

      // Two Months Ago (M-2)
      { title: 'Monthly Apartment Lease', amount: 22000, category: 'Housing & Utilities', date: new Date(curYear, curMonth - 2, 1), merchant: 'Indiranagar Heights', paymentMethod: 'Bank Transfer', currency: '₹', tags: ['#rent'] },
      { title: 'Monthly Groceries Stock', amount: 4800, category: 'Food & Dining', date: new Date(curYear, curMonth - 2, 5), merchant: 'Blinkit Superstore', paymentMethod: 'UPI', currency: '₹', tags: ['#groceries'] },
      { title: 'Weekend Nature Resort Getaway', amount: 8500, category: 'Travel & Vacation', date: new Date(curYear, curMonth - 2, 12), merchant: 'Coorg Wilderness Resort', paymentMethod: 'Card', currency: '₹', tags: ['#vacation', '#travel'] },
      { title: 'Star Health Insurance Term Premium', amount: 2100, category: 'Health & Medical', date: new Date(curYear, curMonth - 2, 18), merchant: 'Star Health Allied', paymentMethod: 'Bank Transfer', currency: '₹', isTaxDeductible: true, taxSection: 'Section 80D', tags: ['#insurance', '#taxDeductible'] },
      { title: 'Apple Magic Keyboard & Trackpad', amount: 9900, category: 'Shopping', date: new Date(curYear, curMonth - 2, 22), merchant: 'Apple Store India', paymentMethod: 'Card', currency: '₹', tags: ['#apple', '#hardware'] },
    ];
    await Expense.insertMany(sampleExpenses.map(e => ({ ...e, userId: user._id })));

    // -------------------------------------------------------------
    // 3. SEED BUDGETS (8 Categories with Alerts)
    // -------------------------------------------------------------
    await Budget.insertMany([
      { userId: user._id, categoryId: 'Housing & Utilities', amount: 28000, currency: '₹', period: 'monthly', alertThreshold: 0.85 },
      { userId: user._id, categoryId: 'Food & Dining', amount: 15000, currency: '₹', period: 'monthly', alertThreshold: 0.80 },
      { userId: user._id, categoryId: 'Transportation', amount: 7000, currency: '₹', period: 'monthly', alertThreshold: 0.80 },
      { userId: user._id, categoryId: 'Shopping', amount: 20000, currency: '₹', period: 'monthly', alertThreshold: 0.80 },
      { userId: user._id, categoryId: 'Entertainment', amount: 8000, currency: '₹', period: 'monthly', alertThreshold: 0.75 },
      { userId: user._id, categoryId: 'Health & Medical', amount: 6500, currency: '₹', period: 'monthly', alertThreshold: 0.90 },
      { userId: user._id, categoryId: 'Subscriptions', amount: 5000, currency: '₹', period: 'monthly', alertThreshold: 0.85 },
      { userId: user._id, categoryId: 'Travel & Vacation', amount: 30000, currency: '₹', period: 'monthly', alertThreshold: 0.80 },
    ]);

    // -------------------------------------------------------------
    // 4. SEED FINANCIAL GOALS (Milestones & Tracking)
    // -------------------------------------------------------------
    await Goal.insertMany([
      { userId: user._id, name: 'Emergency Savings Fund (6 Months)', targetAmount: 300000, currentAmount: 215000, targetDate: new Date(curYear + 1, curMonth, 1), currency: '₹', status: 'active' },
      { userId: user._id, name: 'Tokyo Cherry Blossom Vacation 🇯🇵', targetAmount: 180000, currentAmount: 95000, targetDate: new Date(curYear + 1, curMonth + 3, 15), currency: '₹', status: 'active' },
      { userId: user._id, name: 'MacBook Pro M4 Max Workstation', targetAmount: 160000, currentAmount: 120000, targetDate: new Date(curYear, curMonth + 4, 1), currency: '₹', status: 'active' },
      { userId: user._id, name: 'Real Estate Home Down Payment', targetAmount: 1200000, currentAmount: 450000, targetDate: new Date(curYear + 2, curMonth, 1), currency: '₹', status: 'active' },
    ]);

    // -------------------------------------------------------------
    // 5. SEED RECURRING EXPENSES & SUBSCRIPTIONS
    // -------------------------------------------------------------
    await RecurringExpense.insertMany([
      { userId: user._id, title: 'Apartment Rent Lease', amount: 22000, currency: '₹', category: 'Housing & Utilities', frequency: 'monthly', nextOccurrence: new Date(curYear, curMonth + 1, 1), active: true },
      { userId: user._id, title: 'Cult.fit Elite Gym Membership', amount: 2500, currency: '₹', category: 'Health & Medical', frequency: 'monthly', nextOccurrence: new Date(curYear, curMonth, 25), active: true },
      { userId: user._id, title: 'Netflix 4K Premium Plan', amount: 649, currency: '₹', category: 'Subscriptions', frequency: 'monthly', nextOccurrence: new Date(curYear, curMonth, 28), active: true },
      { userId: user._id, title: 'Spotify Family Audio Plan', amount: 179, currency: '₹', category: 'Subscriptions', frequency: 'monthly', nextOccurrence: new Date(curYear, curMonth, 18), active: true },
      { userId: user._id, title: 'ACT Fibernet 300Mbps High-Speed Broadband', amount: 1199, currency: '₹', category: 'Housing & Utilities', frequency: 'monthly', nextOccurrence: new Date(curYear, curMonth + 1, 5), active: true },
      { userId: user._id, title: 'Claude AI Pro & ChatGPT Plus Tools', amount: 3998, currency: '₹', category: 'Subscriptions', frequency: 'monthly', nextOccurrence: new Date(curYear, curMonth, 12), active: true },
      { userId: user._id, title: 'AWS Cloud Server Infrastructure', amount: 1450, currency: '₹', category: 'Housing & Utilities', frequency: 'monthly', nextOccurrence: new Date(curYear, curMonth, 15), active: true },
      { userId: user._id, title: 'Star Health Comprehensive Insurance', amount: 2100, currency: '₹', category: 'Health & Medical', frequency: 'monthly', nextOccurrence: new Date(curYear, curMonth, 10), active: true },
    ]);

    // -------------------------------------------------------------
    // 6. SEED DEBTS & PAYOFF STRATEGIES (Avalanche / Snowball)
    // -------------------------------------------------------------
    await Debt.insertMany([
      {
        userId: user._id,
        name: 'HDFC Regalia Gold Credit Card',
        category: 'Credit Card',
        principalBalance: 38500,
        originalBalance: 75000,
        interestRate: 36.0,
        minimumPayment: 2500,
        dueDay: 15,
        status: 'ACTIVE',
        payments: [
          { amount: 5000, date: new Date(curYear, curMonth - 1, 15), principalPortion: 4200, interestPortion: 800, notes: 'Monthly payoff lump sum' },
          { amount: 4500, date: new Date(curYear, curMonth - 2, 15), principalPortion: 3600, interestPortion: 900, notes: 'Online net banking payment' },
        ],
      },
      {
        userId: user._id,
        name: 'Higher Education Master\'s Loan',
        category: 'Student Loan',
        principalBalance: 185000,
        originalBalance: 400000,
        interestRate: 8.8,
        minimumPayment: 6500,
        dueDay: 5,
        status: 'ACTIVE',
        payments: [
          { amount: 6500, date: new Date(curYear, curMonth - 1, 5), principalPortion: 5200, interestPortion: 1300, notes: 'Auto-debit EMI' },
          { amount: 6500, date: new Date(curYear, curMonth - 2, 5), principalPortion: 5150, interestPortion: 1350, notes: 'Auto-debit EMI' },
        ],
      },
      {
        userId: user._id,
        name: 'Ather 450X EV Auto Loan',
        category: 'Auto Loan',
        principalBalance: 54000,
        originalBalance: 120000,
        interestRate: 10.5,
        minimumPayment: 3800,
        dueDay: 10,
        status: 'ACTIVE',
        payments: [
          { amount: 3800, date: new Date(curYear, curMonth - 1, 10), principalPortion: 3350, interestPortion: 450, notes: 'Vehicle loan EMI' },
        ],
      },
    ]);

    // -------------------------------------------------------------
    // 7. SEED TRIP VAULTS (Multi-Currency Travel)
    // -------------------------------------------------------------
    await TripVault.insertMany([
      {
        userId: user._id,
        name: 'Tokyo Sakura Explorer 🇯🇵',
        destination: 'Tokyo & Kyoto, Japan',
        tripCurrency: 'JPY',
        baseCurrency: 'INR',
        budgetBaseCurrency: 180000,
        startDate: new Date(curYear, curMonth, 1),
        endDate: new Date(curYear, curMonth, 14),
        status: 'ACTIVE',
        expenses: [
          { description: 'JR Shinkansen High-Speed Bullet Train Passes', foreignAmount: 29650, currency: 'JPY', exchangeRate: 0.55, baseAmount: 16307.50, category: 'Transportation', date: new Date(curYear, curMonth, 2), paymentMethod: 'Card', notes: 'Tokyo to Kyoto return pass' },
          { description: 'Shibuya Sky & TeamLab Planets Observatory', foreignAmount: 7600, currency: 'JPY', exchangeRate: 0.55, baseAmount: 4180.00, category: 'Sightseeing', date: new Date(curYear, curMonth, 4), paymentMethod: 'Card', notes: 'Digital art museum tickets' },
          { description: 'Shinjuku Ryokan & Natural Onsen Stay', foreignAmount: 54000, currency: 'JPY', exchangeRate: 0.55, baseAmount: 29700.00, category: 'Lodging', date: new Date(curYear, curMonth, 6), paymentMethod: 'Card', notes: 'Traditional Japanese inn' },
          { description: 'Tsukiji Authentic Seafood Omakase Course', foreignAmount: 14500, currency: 'JPY', exchangeRate: 0.55, baseAmount: 7975.00, category: 'Food & Dining', date: new Date(curYear, curMonth, 8), paymentMethod: 'Card', notes: 'Chef selection tasting menu' },
        ],
      },
      {
        userId: user._id,
        name: 'Goa Beach & Coastal Retreat 🌴',
        destination: 'North Goa, India',
        tripCurrency: 'INR',
        baseCurrency: 'INR',
        budgetBaseCurrency: 45000,
        startDate: new Date(curYear, curMonth - 1, 10),
        endDate: new Date(curYear, curMonth - 1, 15),
        status: 'COMPLETED',
        expenses: [
          { description: 'Portuguese Heritage Boutique Villa', foreignAmount: 24000, currency: 'INR', exchangeRate: 1.0, baseAmount: 24000.00, category: 'Lodging', date: new Date(curYear, curMonth - 1, 10), paymentMethod: 'Card' },
          { description: 'Thalassa Sunset Greek Dining', foreignAmount: 4800, currency: 'INR', exchangeRate: 1.0, baseAmount: 4800.00, category: 'Food & Dining', date: new Date(curYear, curMonth - 1, 12), paymentMethod: 'Card' },
          { description: 'Scuba Diving & Coastal Water Sports', foreignAmount: 6500, currency: 'INR', exchangeRate: 1.0, baseAmount: 6500.00, category: 'Activities', date: new Date(curYear, curMonth - 1, 13), paymentMethod: 'UPI' },
        ],
      },
    ]);

    // -------------------------------------------------------------
    // 8. SEED GROUP EXPENSE SPLITS (Shared Bills & Settlements)
    // -------------------------------------------------------------
    await Group.insertMany([
      {
        name: 'Flat 402 - Indiranagar 🏠',
        description: 'Shared apartment utilities, organic groceries, and housekeeping',
        currency: 'INR',
        createdBy: user._id,
        members: [
          { name: 'Ayush Kaushik', email: 'demo@antigravity.finance', upiId: 'ayush@okhdfcbank', userId: user._id },
          { name: 'Rohan Sharma', email: 'rohan.sharma@gmail.com', upiId: 'rohan@oksbi', userId: null },
          { name: 'Priya Nair', email: 'priya.nair@gmail.com', upiId: 'priya@icici', userId: null },
        ],
        expenses: [
          {
            description: 'Monthly Cook & Housekeeping Services',
            amount: 9000,
            paidBy: 'Ayush Kaushik',
            date: new Date(curYear, curMonth, 1),
            category: 'Household',
            splitType: 'EQUAL',
            splits: [
              { memberName: 'Ayush Kaushik', amount: 3000, percentage: 33.33 },
              { memberName: 'Rohan Sharma', amount: 3000, percentage: 33.33 },
              { memberName: 'Priya Nair', amount: 3000, percentage: 33.33 },
            ],
            createdBy: user._id,
          },
          {
            description: 'Wholesale Organic Groceries & Staples',
            amount: 6600,
            paidBy: 'Rohan Sharma',
            date: new Date(curYear, curMonth, 4),
            category: 'Groceries',
            splitType: 'EQUAL',
            splits: [
              { memberName: 'Ayush Kaushik', amount: 2200, percentage: 33.33 },
              { memberName: 'Rohan Sharma', amount: 2200, percentage: 33.33 },
              { memberName: 'Priya Nair', amount: 2200, percentage: 33.33 },
            ],
            createdBy: user._id,
          },
          {
            description: 'High-Speed ACT Fiber & OTT Bundle',
            amount: 2400,
            paidBy: 'Priya Nair',
            date: new Date(curYear, curMonth, 6),
            category: 'Utilities',
            splitType: 'EQUAL',
            splits: [
              { memberName: 'Ayush Kaushik', amount: 800, percentage: 33.33 },
              { memberName: 'Rohan Sharma', amount: 800, percentage: 33.33 },
              { memberName: 'Priya Nair', amount: 800, percentage: 33.33 },
            ],
            createdBy: user._id,
          },
        ],
        settlements: [
          {
            fromMember: 'Rohan Sharma',
            toMember: 'Ayush Kaushik',
            amount: 3000,
            date: new Date(curYear, curMonth, 7),
            method: 'UPI',
            notes: 'Settled via Google Pay UPI',
            recordedBy: user._id,
          },
        ],
      },
      {
        name: 'Ladakh Highway Expedition 🏔️',
        description: 'Mountain road trip fuel, camp domes, and valley permits',
        currency: 'INR',
        createdBy: user._id,
        members: [
          { name: 'Ayush Kaushik', email: 'demo@antigravity.finance', upiId: 'ayush@okhdfcbank', userId: user._id },
          { name: 'Vikram Malhotra', email: 'vikram@okaxis', upiId: 'vikram@okaxis', userId: null },
          { name: 'Ananya Roy', email: 'ananya@oksbi', upiId: 'ananya@oksbi', userId: null },
        ],
        expenses: [
          {
            description: 'Pangong Tso Luxury Dome Tents Stay',
            amount: 12000,
            paidBy: 'Ayush Kaushik',
            date: new Date(curYear, curMonth - 1, 18),
            category: 'Lodging',
            splitType: 'EQUAL',
            splits: [
              { memberName: 'Ayush Kaushik', amount: 4000, percentage: 33.33 },
              { memberName: 'Vikram Malhotra', amount: 4000, percentage: 33.33 },
              { memberName: 'Ananya Roy', amount: 4000, percentage: 33.33 },
            ],
            createdBy: user._id,
          },
          {
            description: '4x4 Backup Vehicle Support & Diesel',
            amount: 9000,
            paidBy: 'Vikram Malhotra',
            date: new Date(curYear, curMonth - 1, 20),
            category: 'Transport',
            splitType: 'EQUAL',
            splits: [
              { memberName: 'Ayush Kaushik', amount: 3000, percentage: 33.33 },
              { memberName: 'Vikram Malhotra', amount: 3000, percentage: 33.33 },
              { memberName: 'Ananya Roy', amount: 3000, percentage: 33.33 },
            ],
            createdBy: user._id,
          },
        ],
        settlements: [],
      },
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
