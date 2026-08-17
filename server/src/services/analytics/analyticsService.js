const mongoose = require('mongoose');
const Expense = require('../../models/Expense');
const Income = require('../../models/Income');
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
   * Bill-Aware Spending Velocity & Run-Rate Forecaster
   * Distinguishes contractual recurring subscriptions from discretionary daily pace
   */
  static async getSpendingVelocity(userId) {
    const summary = await this.getMonthlySummary(userId);
    const recurring = await this.getRecurringExpenseSummary(userId);

    const fixedBurden = recurring.monthlyBurden || 0;
    const currentSpend = summary.totalSpend;
    const currentDay = summary.currentDay;
    const daysRemaining = summary.daysRemaining;

    // Discretionary spend is total spend minus any fixed burden that has already occurred
    const discretionarySpend = Math.max(0, currentSpend - Math.min(currentSpend, fixedBurden));
    const discretionaryDailyPace = Math.round(discretionarySpend / Math.max(1, currentDay));

    // Bill-Aware Projection: Current Spend + (Discretionary Pace * Days Remaining) + (Any remaining unpaid fixed burden)
    const projectedDiscretionary = discretionaryDailyPace * summary.daysInMonth;
    const projectedMonthEndSpend = Math.round(Math.max(currentSpend, projectedDiscretionary + fixedBurden));

    return {
      currentSpend,
      currentDay,
      daysRemaining,
      dailyPace: summary.averageDailySpend,
      discretionaryDailyPace,
      fixedMonthlyBurden: fixedBurden,
      projectedMonthEndSpend,
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
   * Category-Scoped Median Absolute Deviation (MAD) & Statistical Anomaly Detection
   * Fintech-grade outlier detection resistant to extreme skewing.
   */
  static async getAnomalies(userId) {
    const userObjId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    const expenses = await Expense.find({ userId: userObjId }).sort({ date: -1 }).limit(100);
    if (!expenses.length || expenses.length < 3) {
      return { anomalies: [] };
    }

    // Group expenses by category
    const categoryGroups = {};
    expenses.forEach(e => {
      const cat = e.category || 'General';
      if (!categoryGroups[cat]) categoryGroups[cat] = [];
      categoryGroups[cat].push(e);
    });

    const anomalies = [];

    // Calculate Category-Scoped MAD for categories with sufficient records (>=3)
    for (const [category, items] of Object.entries(categoryGroups)) {
      if (items.length >= 3) {
        const amounts = items.map(i => i.amount).sort((a, b) => a - b);
        const mid = Math.floor(amounts.length / 2);
        const median = amounts.length % 2 !== 0 ? amounts[mid] : (amounts[mid - 1] + amounts[mid]) / 2;

        const absDevs = amounts.map(a => Math.abs(a - median)).sort((a, b) => a - b);
        const mad = absDevs.length % 2 !== 0 ? absDevs[mid] : (absDevs[mid - 1] + absDevs[mid]) / 2;

        if (mad > 0) {
          items.forEach(item => {
            const modZ = (0.6745 * (item.amount - median)) / mad;
            // Outlier condition: Modified Z-score > 2.5 and amount is at least 1.5x median
            if (modZ > 2.5 && item.amount >= median * 1.5) {
              anomalies.push({
                expenseId: item._id,
                title: item.title,
                amount: item.amount,
                category: item.category,
                date: item.date,
                merchant: item.merchant,
                typicalAverage: Math.round(median),
                deviationFactor: parseFloat(modZ.toFixed(1)),
                reason: `Transaction amount (₹${item.amount.toLocaleString()}) is ${modZ.toFixed(1)}x higher than category typical spend (₹${Math.round(median).toLocaleString()}).`,
                method: 'MAD',
              });
            }
          });
        }
      }
    }

    // Fallback standard Z-Score if category-scoped MAD returned nothing or for global outliers
    if (anomalies.length === 0) {
      const allAmounts = expenses.map(e => e.amount);
      const mean = allAmounts.reduce((a, b) => a + b, 0) / allAmounts.length;
      const variance = allAmounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / allAmounts.length;
      const stdDev = Math.sqrt(variance);

      if (stdDev > 0 && mean > 0) {
        const threshold = mean + (2.0 * stdDev);
        const minAmount = mean * 1.5;
        const anomalyThreshold = Math.max(threshold, minAmount);

        expenses.forEach(e => {
          if (e.amount >= anomalyThreshold && anomalies.length < 5) {
            anomalies.push({
              expenseId: e._id,
              title: e.title,
              amount: e.amount,
              category: e.category,
              date: e.date,
              merchant: e.merchant,
              typicalAverage: Math.round(mean),
              deviationFactor: parseFloat(((e.amount - mean) / stdDev).toFixed(1)),
              reason: `Transaction amount (₹${e.amount.toLocaleString()}) is significantly higher than overall average (₹${Math.round(mean).toLocaleString()}).`,
              method: 'Z-Score',
            });
          }
        });
      }
    }

    return { anomalies: anomalies.slice(0, 10) };
  }

  /**
   * Composite Financial Health Score (0–100 FICO-Style Index)
   * Evaluates Budget Adherence (35%), Recurring Burden (25%), MoM Stability (20%), and Goal Progress (20%)
   */
  static async getFinancialHealthScore(userId) {
    const [budgetUtil, recurring, comparison, goalProgress] = await Promise.all([
      this.getBudgetUtilization(userId),
      this.getRecurringExpenseSummary(userId),
      this.getMonthlyComparison(userId),
      this.getGoalProgress(userId),
    ]);

    // 1. Budget Adherence Pillar (35 points)
    let budgetScore = 35;
    if (budgetUtil.totalAllocated > 0) {
      const spendRatio = budgetUtil.totalSpent / budgetUtil.totalAllocated;
      if (spendRatio > 1.2) budgetScore = 10;
      else if (spendRatio > 1.0) budgetScore = 20;
      else if (spendRatio > 0.85) budgetScore = 28;
      else budgetScore = 35;
    }

    // 2. Fixed Expense Ratio Pillar (25 points)
    let recurringScore = 25;
    const currentSpend = comparison.currentMonthSpend || 1;
    const fixedRatio = recurring.monthlyBurden / Math.max(1, currentSpend + recurring.monthlyBurden);
    if (fixedRatio > 0.6) recurringScore = 10;
    else if (fixedRatio > 0.4) recurringScore = 18;
    else recurringScore = 25;

    // 3. Month-over-Month Stability Pillar (20 points)
    let stabilityScore = 20;
    const momChange = Math.abs(comparison.changePercent || 0);
    if (momChange > 40 && comparison.isIncrease) stabilityScore = 8;
    else if (momChange > 20 && comparison.isIncrease) stabilityScore = 14;
    else stabilityScore = 20;

    // 4. Savings Goal Contribution Pillar (20 points)
    let goalScore = 20;
    if (goalProgress.activeGoalsCount > 0) {
      const avgPercentage = goalProgress.goals.reduce((s, g) => s + g.percentage, 0) / goalProgress.activeGoalsCount;
      goalScore = Math.min(20, Math.round((avgPercentage / 100) * 20) + 10);
    }

    const totalScore = Math.min(100, Math.max(0, budgetScore + recurringScore + stabilityScore + goalScore));

    let grade = 'A';
    let status = 'Excellent Financial Discipline';
    if (totalScore < 60) {
      grade = 'C';
      status = 'Needs Optimization';
    } else if (totalScore < 80) {
      grade = 'B';
      status = 'Good Financial Trajectory';
    }

    return {
      score: totalScore,
      grade,
      status,
      pillars: {
        budgetAdherence: { score: budgetScore, max: 35, percentage: Math.round((budgetScore / 35) * 100) },
        fixedExpenseRatio: { score: recurringScore, max: 25, percentage: Math.round((recurringScore / 25) * 100) },
        momStability: { score: stabilityScore, max: 20, percentage: Math.round((stabilityScore / 20) * 100) },
        goalPace: { score: goalScore, max: 20, percentage: Math.round((goalScore / 20) * 100) },
      },
    };
  }

  /**
   * Comprehensive Cash Flow, Income Tracking & True Savings Rate Engine
   * Deterministically calculates monthly net cash flow and 6-month historical trajectory
   */
  static async getCashFlowSummary(userId, targetYear, targetMonth) {
    const now = new Date();
    const year = targetYear ? parseInt(targetYear, 10) : now.getFullYear();
    const month = targetMonth !== undefined ? parseInt(targetMonth, 10) : now.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    const userObjId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    const [incomeResult, expenseResult, incomeCategories] = await Promise.all([
      Income.aggregate([
        { $match: { userId: userObjId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, totalIncome: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { userId: userObjId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, totalExpense: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Income.aggregate([
        { $match: { userId: userObjId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const totalIncome = incomeResult.length > 0 ? incomeResult[0].totalIncome : 0;
    const incomeCount = incomeResult.length > 0 ? incomeResult[0].count : 0;
    const totalExpense = expenseResult.length > 0 ? expenseResult[0].totalExpense : 0;
    const expenseCount = expenseResult.length > 0 ? expenseResult[0].count : 0;

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? parseFloat(((netSavings / totalIncome) * 100).toFixed(1)) : 0;

    // 6-Month Cash Flow Trend
    const sixMonthsAgo = new Date(year, month - 5, 1);
    const [trendIncomes, trendExpenses] = await Promise.all([
      Income.aggregate([
        { $match: { userId: userObjId, date: { $gte: sixMonthsAgo, $lte: endDate } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            income: { $sum: '$amount' },
          },
        },
      ]),
      Expense.aggregate([
        { $match: { userId: userObjId, date: { $gte: sixMonthsAgo, $lte: endDate } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            expense: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - i, 1);
      const mYear = d.getFullYear();
      const mMonth = d.getMonth() + 1; // MongoDB $month is 1-indexed

      const inc = trendIncomes.find(t => t._id.year === mYear && t._id.month === mMonth)?.income || 0;
      const exp = trendExpenses.find(t => t._id.year === mYear && t._id.month === mMonth)?.expense || 0;
      const net = inc - exp;
      const rate = inc > 0 ? parseFloat(((net / inc) * 100).toFixed(1)) : 0;

      trend.push({
        monthName: `${monthNames[mMonth - 1]} ${String(mYear).slice(-2)}`,
        year: mYear,
        month: mMonth,
        income: inc,
        expense: exp,
        netSavings: net,
        savingsRate: rate,
      });
    }

      return {
        year,
        month: month + 1,
        totalIncome,
        incomeCount,
        totalExpense,
        expenseCount,
        netSavings,
        savingsRate,
        status: netSavings >= 0 ? 'SURPLUS' : 'DEFICIT',
        incomeCategoryBreakdown: incomeCategories.map(c => ({
          category: c._id || 'Salary',
          total: c.total,
          count: c.count,
          percentage: totalIncome > 0 ? parseFloat(((c.total / totalIncome) * 100).toFixed(1)) : 0,
        })),
        trend,
      };
    }

  /**
   * Deterministic Financial Health Index (0-100 FHI)
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

  /**
   * Comprehensive Cash Flow, Income Tracking & True Savings Rate Engine
   * Deterministically calculates monthly net cash flow and 6-month historical trajectory
   */
  static async getCashFlowSummary(userId, targetYear, targetMonth) {
    const now = new Date();
    const year = targetYear ? parseInt(targetYear, 10) : now.getFullYear();
    const month = targetMonth !== undefined ? parseInt(targetMonth, 10) : now.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);
    const userObjId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    const [incomeResult, expenseResult, incomeCategories] = await Promise.all([
      Income.aggregate([
        { $match: { userId: userObjId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, totalIncome: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Expense.aggregate([
        { $match: { userId: userObjId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: null, totalExpense: { $sum: '$amount' }, count: { $sum: 1 } } },
      ]),
      Income.aggregate([
        { $match: { userId: userObjId, date: { $gte: startDate, $lte: endDate } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
    ]);

    const totalIncome = incomeResult.length > 0 ? incomeResult[0].totalIncome : 0;
    const incomeCount = incomeResult.length > 0 ? incomeResult[0].count : 0;
    const totalExpense = expenseResult.length > 0 ? expenseResult[0].totalExpense : 0;
    const expenseCount = expenseResult.length > 0 ? expenseResult[0].count : 0;

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? parseFloat(((netSavings / totalIncome) * 100).toFixed(1)) : 0;

    // 6-Month Cash Flow Trend
    const sixMonthsAgo = new Date(year, month - 5, 1);
    const [trendIncomes, trendExpenses] = await Promise.all([
      Income.aggregate([
        { $match: { userId: userObjId, date: { $gte: sixMonthsAgo, $lte: endDate } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            income: { $sum: '$amount' },
          },
        },
      ]),
      Expense.aggregate([
        { $match: { userId: userObjId, date: { $gte: sixMonthsAgo, $lte: endDate } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            expense: { $sum: '$amount' },
          },
        },
      ]),
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trend = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - i, 1);
      const mYear = d.getFullYear();
      const mMonth = d.getMonth() + 1; // MongoDB $month is 1-indexed

      const inc = trendIncomes.find(t => t._id.year === mYear && t._id.month === mMonth)?.income || 0;
      const exp = trendExpenses.find(t => t._id.year === mYear && t._id.month === mMonth)?.expense || 0;
      const net = inc - exp;
      const rate = inc > 0 ? parseFloat(((net / inc) * 100).toFixed(1)) : 0;

      trend.push({
        monthName: `${monthNames[mMonth - 1]} ${String(mYear).slice(-2)}`,
        year: mYear,
        month: mMonth,
        income: inc,
        expense: exp,
        netSavings: net,
        savingsRate: rate,
      });
    }

    return {
      year,
      month: month + 1,
      totalIncome,
      incomeCount,
      totalExpense,
      expenseCount,
      netSavings,
      savingsRate,
      status: netSavings >= 0 ? 'SURPLUS' : 'DEFICIT',
      incomeCategoryBreakdown: incomeCategories.map(c => ({
        category: c._id || 'Salary',
        total: c.total,
        count: c.count,
        percentage: totalIncome > 0 ? parseFloat(((c.total / totalIncome) * 100).toFixed(1)) : 0,
      })),
      trend,
    };
  }

  /**
   * Deterministic Financial Health Index (0-100 FHI)
   * 5-Pillar mathematical model with actionable recommendations
   */
  static async getFinancialHealthIndex(userId, targetYear, targetMonth) {
    const now = new Date();
    const year = targetYear ? parseInt(targetYear, 10) : now.getFullYear();
    const month = targetMonth !== undefined ? parseInt(targetMonth, 10) : now.getMonth();

    const [cashflow, budgetUtil, velocity, goals] = await Promise.all([
      this.getCashFlowSummary(userId, year, month),
      this.getBudgetUtilization(userId, year, month),
      this.getSpendingVelocity(userId, year, month),
      Goal.find({ userId }).lean(),
    ]);

    // Pillar 1: Savings Rate (25 pts)
    let p1SavingsScore = 0;
    if (cashflow.savingsRate >= 30) {
      p1SavingsScore = 25;
    } else if (cashflow.savingsRate > 0) {
      p1SavingsScore = Math.round((cashflow.savingsRate / 30) * 25 * 10) / 10;
    } else {
      p1SavingsScore = 0;
    }

    // Pillar 2: Budget Adherence (25 pts)
    let p2BudgetScore = 18;
    if (budgetUtil.totalBudgets > 0) {
      const overspendRatio = budgetUtil.totalAllocated > 0
        ? Math.max(0, (budgetUtil.totalSpent - budgetUtil.totalAllocated) / budgetUtil.totalAllocated)
        : (budgetUtil.totalSpent > 0 ? 1 : 0);

      const unbreachedRatio = budgetUtil.totalBudgets > 0
        ? (budgetUtil.totalBudgets - budgetUtil.overBudgetCount) / budgetUtil.totalBudgets
        : 1;

      const adherenceRatio = Math.max(0, 1 - overspendRatio) * 0.6 + unbreachedRatio * 0.4;
      p2BudgetScore = Math.round(adherenceRatio * 25 * 10) / 10;
    }

    // Pillar 3: Spending Velocity & Discipline (20 pts)
    let p3VelocityScore = 20;
    const vRatio = velocity.velocityRatio || 1.0;
    if (vRatio <= 1.0) {
      p3VelocityScore = 20;
    } else if (vRatio <= 1.3) {
      p3VelocityScore = Math.round((20 - (vRatio - 1.0) * 33.3) * 10) / 10;
    } else {
      p3VelocityScore = Math.max(3, Math.round((10 - (vRatio - 1.3) * 20) * 10) / 10);
    }

    // Pillar 4: Emergency Buffer & Liquid Net Runway (15 pts)
    const avgMonthlyBurn = velocity.projectedMonthEndSpend || cashflow.totalExpense || 1;
    const cumulativeSavings = (cashflow.trend || []).reduce((sum, t) => sum + (t.netSavings || 0), 0);
    const runwayMonths = avgMonthlyBurn > 0 ? Math.max(0, cumulativeSavings / avgMonthlyBurn) : 0;

    let p4RunwayScore = 0;
    if (runwayMonths >= 6) {
      p4RunwayScore = 15;
    } else if (runwayMonths >= 3) {
      p4RunwayScore = 11;
    } else if (runwayMonths >= 1) {
      p4RunwayScore = 7;
    } else if (runwayMonths > 0) {
      p4RunwayScore = 4;
    } else {
      p4RunwayScore = 1;
    }

    // Pillar 5: Goal Trajectory (15 pts)
    let p5GoalScore = 10;
    const activeGoals = (goals || []).filter((g) => g.status === 'active' || (!g.status && !g.isCompleted));
    if (activeGoals.length > 0) {
      const avgProgress = activeGoals.reduce((sum, g) => {
        const ratio = g.targetAmount > 0 ? Math.min(1, (g.currentAmount || 0) / g.targetAmount) : 0;
        return sum + ratio;
      }, 0) / activeGoals.length;
      p5GoalScore = Math.round(avgProgress * 15 * 10) / 10;
    }

    const totalScore = Math.min(100, Math.max(0, Math.round(
      p1SavingsScore + p2BudgetScore + p3VelocityScore + p4RunwayScore + p5GoalScore
    )));

    // Tier Classification
    let tier = 'Builder';
    let tierBadge = '🏗️ Foundation Builder';
    let tierDescription = 'Solid fundamentals with great opportunities to optimize cash surplus and runway.';

    if (totalScore >= 85) {
      tier = 'Sovereign';
      tierBadge = '👑 Financial Sovereign';
      tierDescription = 'Elite financial discipline. Exceptional savings rate, runway, and budget control.';
    } else if (totalScore >= 65) {
      tier = 'Optimized';
      tierBadge = '💎 Wealth Optimizer';
      tierDescription = 'Strong surplus generator. High budget adherence and compounding trajectory.';
    } else if (totalScore < 40) {
      tier = 'Novice';
      tierBadge = '⚠️ High Vulnerability';
      tierDescription = 'Cash flow leaks or deficit detected. Immediate budget stabilization recommended.';
    }

    const levers = [];

    if (p1SavingsScore < 20) {
      const potentialGain = Math.round(25 - p1SavingsScore);
      levers.push({
        pillar: 'Savings Rate',
        title: 'Accelerate Monthly Inflow Retention',
        description: `Target saving 25% of income to capture +${potentialGain} FHI points.`,
        potentialGain,
        actionType: 'CUT_EXPENSES',
      });
    }

    if (p2BudgetScore < 20) {
      const potentialGain = Math.round(25 - p2BudgetScore);
      levers.push({
        pillar: 'Budget Adherence',
        title: 'Establish Category Guardrails',
        description: `Trim over-budget categories to reclaim +${potentialGain} FHI points.`,
        potentialGain,
        actionType: 'ADJUST_BUDGET',
      });
    }

    if (p3VelocityScore < 15) {
      const potentialGain = Math.round(20 - p3VelocityScore);
      levers.push({
        pillar: 'Daily Spend Velocity',
        title: 'Stabilize Mid-Month Daily Pace',
        description: `Restricting your daily outflow will boost FHI by +${potentialGain} pts.`,
        potentialGain,
        actionType: 'THROTTLE_VELOCITY',
      });
    }

    return {
      score: totalScore,
      tier,
      tierBadge,
      tierDescription,
      pillars: {
        savingsRate: { score: p1SavingsScore, max: 25, label: 'Savings Rate & Inflow' },
        budgetAdherence: { score: p2BudgetScore, max: 25, label: 'Budget Guardrails' },
        spendingVelocity: { score: p3VelocityScore, max: 20, label: 'Spending Stability' },
        emergencyRunway: { score: p4RunwayScore, max: 15, label: 'Emergency Runway' },
        goalTrajectory: { score: p5GoalScore, max: 15, label: 'Goal Velocity' },
      },
      actionableLevers: levers.slice(0, 3),
      calculatedAt: new Date().toISOString(),
    };
  }
}

module.exports = AnalyticsService;
