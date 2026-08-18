const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Budget = require('../models/Budget');
const Goal = require('../models/Goal');
const { Debt } = require('../models/Debt');
const RecurringExpense = require('../models/RecurringExpense');
const { Group } = require('../models/Group');
const { TripVault } = require('../models/TripVault');
const RefreshToken = require('../models/RefreshToken');
const Category = require('../models/Category');
const AuditLog = require('../models/AuditLog');
const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError, NotFoundError, UnauthorizedError } = require('../utils/errors');

// @desc    Get user profile with comprehensive metadata & activity stats
// @route   GET /api/users/profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-passwordHash');
  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Calculate platform activity stats for Sovereign Health scorecard
  const [
    totalExpensesCount,
    totalIncomeCount,
    activeGoalsCount,
    activeDebtsCount,
    activeSubscriptionsCount,
    activeGroupsCount,
    activeTripsCount,
  ] = await Promise.all([
    Expense.countDocuments({ userId: req.user._id }),
    Income.countDocuments({ userId: req.user._id }),
    Goal.countDocuments({ userId: req.user._id, status: 'active' }),
    Debt.countDocuments({ userId: req.user._id, status: 'ACTIVE' }),
    RecurringExpense.countDocuments({ userId: req.user._id, active: true }),
    Group.countDocuments({ 'members.userId': req.user._id }),
    TripVault.countDocuments({ userId: req.user._id, status: 'ACTIVE' }),
  ]);

  const createdAt = user.createdAt || new Date();
  const accountAgeDays = Math.max(1, Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24)));

  res.json({
    user,
    stats: {
      totalExpensesCount,
      totalIncomeCount,
      activeGoalsCount,
      activeDebtsCount,
      activeSubscriptionsCount,
      activeGroupsCount,
      activeTripsCount,
      accountAgeDays,
      sovereigntyTier: 'Diamond Sovereign VIP',
    },
  });
});

// @desc    Update user profile & preferences
// @route   PUT /api/users/profile
exports.updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const allowedFields = [
    'name',
    'phone',
    'upiId',
    'avatarUrl',
    'avatarStyle',
    'avatarEmoji',
    'occupation',
    'financialPersona',
    'bio',
    'location',
    'preferredCurrency',
    'monthlyIncomeEstimate',
    'targetSavingsRate',
    'defaultPaymentMethod',
    'taxRegime',
    'fireTargetAge',
    'emergencyFundMonths',
    'locale',
    'timezone',
    'dateFormat',
    'fiscalYearStart',
    'themePreference',
    'defaultPrivacyMask',
    'twoFactorEnabled',
  ];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      user[field] = req.body[field];
    }
  });

  if (req.body.notificationPreferences) {
    user.notificationPreferences = {
      ...user.notificationPreferences,
      ...req.body.notificationPreferences,
    };
  }

  const updatedUser = await user.save();
  const sanitized = updatedUser.toObject();
  delete sanitized.passwordHash;

  res.json({
    message: 'Profile updated successfully',
    user: sanitized,
  });
});

// @desc    Change user password
// @route   PUT /api/users/password
exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new BadRequestError('Please provide both current and new password');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    throw new BadRequestError('Current password is incorrect');
  }

  if (currentPassword === newPassword) {
    throw new BadRequestError('New password cannot be the same as current password');
  }

  const salt = await bcrypt.genSalt(10);
  user.passwordHash = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.json({ message: 'Password changed successfully. Please keep your credentials secure.' });
});

// @desc    Get active multi-device sessions for current user
// @route   GET /api/users/sessions
exports.getActiveSessions = asyncHandler(async (req, res) => {
  const tokens = await RefreshToken.find({ userId: req.user._id }).sort({ createdAt: -1 });

  const currentToken = req.headers['x-refresh-token'] || req.query.current || '';

  const sessions = tokens.map((t, idx) => ({
    id: t._id,
    tokenPrefix: `${t.token.slice(0, 6)}...${t.token.slice(-4)}`,
    createdAt: t.createdAt,
    expiresAt: t.expiresAt,
    isCurrent: currentToken ? t.token === currentToken : idx === 0,
    device: idx === 0 ? 'Current Web Client (Mac OS / Chrome)' : 'Secondary Authorized Session',
    ip: '127.0.0.1 (Encrypted TLS)',
  }));

  res.json({ sessions });
});

// @desc    Revoke specific session
// @route   DELETE /api/users/sessions/:id
exports.revokeSession = asyncHandler(async (req, res) => {
  const session = await RefreshToken.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!session) {
    throw new NotFoundError('Session token not found or already revoked');
  }

  res.json({ message: 'Session revoked successfully' });
});

// @desc    Revoke all other sessions
// @route   DELETE /api/users/sessions
exports.revokeAllOtherSessions = asyncHandler(async (req, res) => {
  const currentToken = req.body.refreshToken || req.headers['x-refresh-token'];

  if (currentToken) {
    await RefreshToken.deleteMany({
      userId: req.user._id,
      token: { $ne: currentToken },
    });
  } else {
    await RefreshToken.deleteMany({ userId: req.user._id });
  }

  res.json({ message: 'All other sessions have been terminated' });
});

// @desc    Wipe financial transactions and reset account to pristine state
// @route   POST /api/users/reset-data
exports.resetUserData = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Promise.all([
    Expense.deleteMany({ userId }),
    Income.deleteMany({ userId }),
    Budget.deleteMany({ userId }),
    Goal.deleteMany({ userId }),
    Debt.deleteMany({ userId }),
    RecurringExpense.deleteMany({ userId }),
    TripVault.deleteMany({ userId }),
    Group.deleteMany({ createdBy: userId }),
  ]);

  res.json({ message: 'All transactions, budgets, goals, and records have been purged successfully.' });
});

// @desc    Permanently delete account and all cascading data
// @route   DELETE /api/users/account
exports.deleteAccount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await Promise.all([
    Expense.deleteMany({ userId }),
    Income.deleteMany({ userId }),
    Budget.deleteMany({ userId }),
    Goal.deleteMany({ userId }),
    Debt.deleteMany({ userId }),
    RecurringExpense.deleteMany({ userId }),
    TripVault.deleteMany({ userId }),
    Group.deleteMany({ createdBy: userId }),
    Category.deleteMany({ userId }),
    RefreshToken.deleteMany({ userId }),
    AuditLog.deleteMany({ userId }),
    User.findByIdAndDelete(userId),
  ]);

  res.json({ message: 'Your account and all associated financial data have been permanently erased.' });
});

// @desc    Get user modular customization, themes, and dashboard configuration
// @route   GET /api/users/customization
exports.getCustomization = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('customization');
  if (!user) {
    throw new NotFoundError('User not found');
  }

  res.json({
    customization: user.customization || {},
  });
});

// @desc    Update user modular customization, themes, and dashboard configuration
// @route   PUT /api/users/customization
exports.updateCustomization = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const { modules, theme, dashboardLayout, regional } = req.body;

  if (modules && typeof modules === 'object') {
    user.customization.modules = {
      ...user.customization.modules,
      ...modules,
    };
  }

  if (theme && typeof theme === 'object') {
    user.customization.theme = {
      ...user.customization.theme,
      ...theme,
    };
  }

  if (Array.isArray(dashboardLayout)) {
    user.customization.dashboardLayout = dashboardLayout;
  }

  if (regional && typeof regional === 'object') {
    user.customization.regional = {
      ...user.customization.regional,
      ...regional,
    };
    if (regional.currency) {
      user.preferredCurrency = regional.currency;
    }
  }

  await user.save();

  res.json({
    message: 'Customization configuration synced successfully',
    customization: user.customization,
  });
});

