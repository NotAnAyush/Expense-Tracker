const mongoose = require('mongoose');
const Expense = require('../../models/Expense');
const Budget = require('../../models/Budget');
const Goal = require('../../models/Goal');
const RecurringExpense = require('../../models/RecurringExpense');

/**
 * AnalyticsService — Deterministic Financial Calculations Engine
 * All methods use MongoDB Aggregation Pipelines for performance.
 * No LLM dependencies — 0% hallucination guarantee.
 */
class AnalyticsService {
  /**
   * Deterministic Monthly Summary for user
   * Uses $match + $group aggregation instead of .find() + JS reduce
   */
  static async getMonthlySummary(userId, targetYear, targetMonth) {
    const now = new Date();
    const year = targetYear ? parseInt(targetYear, 10) : now.getFullYear();
    const month = targetMonth !== undefined ? parseInt(targetMonth, 10) : now.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const userObjId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    const pipeline = [
      { $match: { userId: userObjId, date: { $gte: startDate, $lte: endDate } } },
      {
        $group: {
          _id: null,
          totalSpend: { $sum: '$amount' },
          transactionCount: { $sum: 1 },
        },
      },
    ];

    const result = await Expense.aggregate(pipeline);
    const totalSpend = result.length > 0 ? result[0].totalSpend : 0;
    const transactionCount = result.length > 0 ? result[0].transactionCount : 0;

    const daysInMonth = endDate.getDate();
    const currentDay = (now.getFullYear() === year && now.getMonth() === month) ? now.getDate() : daysInMonth;
    const averageDailySpend = Math.round(totalSpend / Math.max(1, currentDay));

    return {
      year,
      month: month + 1, // 1-indexed for display
      totalSpend,
      transactionCount,
      averageDailySpend,
      daysInMonth,
      currentDay,
      daysRemaining: Math.max(0, daysInMonth - currentDay),
    };
  }

  /**
   * Deterministic Category Breakdown
   * Uses $group + $sort aggregation pipeline
   */
  static async getCategoryBreakdown(userId, periodMonths = 1) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - (periodMonths - 1), 1);

    const userObjId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    const pipeline = [
      { $match: { userId: userObjId, date: { $gte: startDate } } },
      {
        $group: {
          _id: { $ifNull: ['$category', 'Uncategorized'] },
          amount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { amount: -1 } },
    ];

    const categoryResults = await Expense.aggregate(pipeline);

    const grandTotal = categoryResults.reduce((sum, c) => sum + c.amount, 0);

    const breakdown = categoryResults.map(c => ({
      category: c._id,
      amount: c.amount,
      count: c.count,
      percentage: grandTotal > 0 ? parseFloat(((c.amount / grandTotal) * 100).toFixed(1)) : 0,
    }));

    return {
      grandTotal,
      categoriesCount: breakdown.length,
      breakdown,
      topCategory: breakdown[0] || null,
    };
  }

  /**
   * Month-Over-Month Comparison
   * Uses $facet for parallel current/previous month aggregation in single query
   */
  static async getMonthlyComparison(userId) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currStart = new Date(currentYear, currentMonth, 1);
    const currEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    const prevStart = new Date(currentYear, currentMonth - 1, 1);
    const prevEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const userObjId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    // Use $facet for parallel aggregation of both months in a single DB round-trip
    const pipeline = [
      { $match: { userId: userObjId, date: { $gte: prevStart, $lte: currEnd } } },
      {
        $facet: {
          currentMonth: [
            { $match: { date: { $gte: currStart, $lte: currEnd } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
          ],
          previousMonth: [
            { $match: { date: { $gte: prevStart, $lte: prevEnd } } },
            { $group: { _id: '$category', total: { $sum: '$amount' } } },
          ],
        },
      },
    ];

    const [facetResult] = await Expense.aggregate(pipeline);

    const currentCatMap = {};
    let currentMonthSpend = 0;
    (facetResult.currentMonth || []).forEach(c => {
      currentCatMap[c._id] = c.total;
      currentMonthSpend += c.total;
    });

    const prevCatMap = {};
    let previousMonthSpend = 0;
    (facetResult.previousMonth || []).forEach(c => {
      prevCatMap[c._id] = c.total;
      previousMonthSpend += c.total;
    });

    const diff = currentMonthSpend - previousMonthSpend;
    const changePercent = previousMonthSpend > 0
      ? parseFloat(((diff / previousMonthSpend) * 100).toFixed(1))
      : (currentMonthSpend > 0 ? 100 : 0);

    const allCategories = new Set([...Object.keys(currentCatMap), ...Object.keys(prevCatMap)]);
    const categoryDeltas = Array.from(allCategories).map(cat => {
      const cAmt = currentCatMap[cat] || 0;
      const pAmt = prevCatMap[cat] || 0;
      const catDiff = cAmt - pAmt;
      const catPercent = pAmt > 0 ? parseFloat(((catDiff / pAmt) * 100).toFixed(1)) : (cAmt > 0 ? 100 : 0);
      return { category: cat, currentAmount: cAmt, previousAmount: pAmt, diff: catDiff, changePercent: catPercent };
    }).sort((a, b) => b.diff - a.diff);

    return {
      currentMonthSpend,
      previousMonthSpend,
      diff,
      changePercent,
      isIncrease: diff > 0,
      biggestCategoryIncrease: categoryDeltas.length > 0 ? categoryDeltas[0] : null,
      categoryDeltas,
    };
  }

  /**
   * Budget Utilization
   * Uses aggregation pipeline for category spend calculation
   */
  static async getBudgetUtilization(userId) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const userObjId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    const [budgets, spendByCategory] = await Promise.all([
      Budget.find({ userId }),
      Expense.aggregate([
        { $match: { userId: userObjId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$category', spent: { $sum: '$amount' } } },
      ]),
    ]);

    const categorySpendMap = {};
    spendByCategory.forEach(c => {
      categorySpendMap[c._id] = c.spent;
    });

    const budgetStatusList = budgets.map(b => {
      const spent = categorySpendMap[b.categoryId] || 0;
      const remaining = Math.max(0, b.amount - spent);
      const percentage = b.amount > 0 ? parseFloat(((spent / b.amount) * 100).toFixed(1)) : 0;
      const isOverBudget = spent > b.amount;
      const isNearThreshold = percentage >= (b.alertThreshold * 100);

      return {
        budgetId: b._id,
        category: b.categoryId,
        allocated: b.amount,
        spent,
        remaining,
        percentage,
        isOverBudget,
        isNearThreshold,
      };
    });

    const totalAllocated = budgetStatusList.reduce((s, b) => s + b.allocated, 0);
    const totalSpent = budgetStatusList.reduce((s, b) => s + b.spent, 0);

    return {
      totalAllocated,
      totalSpent,
      totalRemaining: Math.max(0, totalAllocated - totalSpent),
      budgets: budgetStatusList,
      overBudgetCount: budgetStatusList.filter(b => b.isOverBudget).length,
    };
  }

  /**
   * Spending Velocity & Forecast
   */
  static async getSpendingVelocity(userId) {
    const summary = await this.getMonthlySummary(userId);
    const dailyPace = summary.averageDailySpend;
    const projectedMonthEndSpend = dailyPace * summary.daysInMonth;

    return {
      currentSpend: summary.totalSpend,
      currentDay: summary.currentDay,
      daysRemaining: summary.daysRemaining,
      dailyPace,
      projectedMonthEndSpend: Math.round(projectedMonthEndSpend),
    };
  }

  /**
   * Recurring Expense Burden
   */
  static async getRecurringExpenseSummary(userId) {
    const recurring = await RecurringExpense.find({ userId, active: true });
    const monthlyBurden = recurring.reduce((s, r) => {
      if (r.frequency === 'yearly') return s + Math.round(r.amount / 12);
      if (r.frequency === 'weekly') return s + Math.round(r.amount * 4.33);
      if (r.frequency === 'daily') return s + Math.round(r.amount * 30);
      return s + r.amount;
    }, 0);

    return {
      count: recurring.length,
      monthlyBurden,
      annualizedBurden: monthlyBurden * 12,
      items: recurring,
    };
  }

  /**
   * Goal Progress Tracking
   */
  static async getGoalProgress(userId) {
    const goals = await Goal.find({ userId, status: 'active' });
    const now = new Date();

    const goalStatusList = goals.map(g => {
      const remainingAmount = Math.max(0, g.targetAmount - g.currentAmount);
      const percentage = g.targetAmount > 0 ? parseFloat(((g.currentAmount / g.targetAmount) * 100).toFixed(1)) : 0;

      const targetDate = new Date(g.targetDate);
      const monthsRemaining = Math.max(1, (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth()));
      const requiredMonthlyContribution = Math.round(remainingAmount / monthsRemaining);

      return {
        goalId: g._id,
        name: g.name,
        targetAmount: g.targetAmount,
        currentAmount: g.currentAmount,
        remainingAmount,
        percentage,
        targetDate: g.targetDate,
        monthsRemaining,
        requiredMonthlyContribution,
      };
    });

    return {
      activeGoalsCount: goals.length,
      goals: goalStatusList,
    };
  }

  /**
   * Merchant Summary — uses aggregation pipeline
   */
  static async getMerchantSummary(userId) {
    const userObjId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    const topMerchants = await Expense.aggregate([
      { $match: { userId: userObjId, merchant: { $exists: true, $ne: '' } } },
      {
        $group: {
          _id: '$merchant',
          totalSpend: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalSpend: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          merchant: '$_id',
          totalSpend: { $round: ['$totalSpend', 0] },
          count: 1,
        },
      },
    ]);

    return { topMerchants };
  }

  /**
   * Anomaly Detection (Statistical Z-Score)
   * Uses two-pass aggregation: first computes mean/stdDev, then filters outliers
   */
  static async getAnomalies(userId) {
    const userObjId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    // Pass 1: Compute statistical baseline
    const statsResult = await Expense.aggregate([
      { $match: { userId: userObjId } },
      {
        $group: {
          _id: null,
          mean: { $avg: '$amount' },
          count: { $sum: 1 },
          amounts: { $push: '$amount' },
        },
      },
    ]);

    if (!statsResult.length || statsResult[0].count < 3) {
      return { anomalies: [] };
    }

    const { mean, amounts } = statsResult[0];
    const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    if (stdDev === 0 || mean === 0) {
      return { anomalies: [] };
    }

    // Pass 2: Find outliers (Z > 2.0 AND amount >= 1.5 * mean)
    const threshold = mean + (2.0 * stdDev);
    const minAmount = mean * 1.5;
    const anomalyThreshold = Math.max(threshold, minAmount);

    const anomalyExpenses = await Expense.find({
      userId,
      amount: { $gte: anomalyThreshold },
    }).sort({ date: -1 }).limit(10);

    const anomalies = anomalyExpenses.map(e => ({
      expenseId: e._id,
      title: e.title,
      amount: e.amount,
      category: e.category,
      date: e.date,
      merchant: e.merchant,
      typicalAverage: Math.round(mean),
      deviationFactor: parseFloat(((e.amount - mean) / stdDev).toFixed(1)),
      reason: `Transaction amount (${e.amount}) is significantly higher than user average (${Math.round(mean)}).`,
    }));

    return { anomalies };
  }
}

module.exports = AnalyticsService;
