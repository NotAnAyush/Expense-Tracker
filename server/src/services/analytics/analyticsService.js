const Expense = require('../../models/Expense');
const Budget = require('../../models/Budget');
const Goal = require('../../models/Goal');
const RecurringExpense = require('../../models/RecurringExpense');

class AnalyticsService {
  /**
   * Deterministic Monthly Summary for user
   */
  static async getMonthlySummary(userId, targetYear, targetMonth) {
    const now = new Date();
    const year = targetYear ? parseInt(targetYear, 10) : now.getFullYear();
    const month = targetMonth !== undefined ? parseInt(targetMonth, 10) : now.getMonth();

    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate, $lte: endDate },
    });

    const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
    const daysInMonth = endDate.getDate();
    const currentDay = (now.getFullYear() === year && now.getMonth() === month) ? now.getDate() : daysInMonth;
    const averageDailySpend = Math.round(totalSpend / Math.max(1, currentDay));

    return {
      year,
      month: month + 1, // 1-indexed for display
      totalSpend,
      transactionCount: expenses.length,
      averageDailySpend,
      daysInMonth,
      currentDay,
      daysRemaining: Math.max(0, daysInMonth - currentDay),
    };
  }

  /**
   * Deterministic Category Breakdown
   */
  static async getCategoryBreakdown(userId, periodMonths = 1) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - (periodMonths - 1), 1);

    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate },
    });

    const categoryTotals = {};
    let grandTotal = 0;

    expenses.forEach(e => {
      const cat = e.category || 'Uncategorized';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + e.amount;
      grandTotal += e.amount;
    });

    const breakdown = Object.keys(categoryTotals).map(category => ({
      category,
      amount: categoryTotals[category],
      percentage: grandTotal > 0 ? parseFloat(((categoryTotals[category] / grandTotal) * 100).toFixed(1)) : 0,
    })).sort((a, b) => b.amount - a.amount);

    return {
      grandTotal,
      categoriesCount: breakdown.length,
      breakdown,
      topCategory: breakdown[0] || null,
    };
  }

  /**
   * Month-Over-Month Comparison
   */
  static async getMonthlyComparison(userId) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const currStart = new Date(currentYear, currentMonth, 1);
    const currEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    const prevStart = new Date(currentYear, currentMonth - 1, 1);
    const prevEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const currentExpenses = await Expense.find({ userId, date: { $gte: currStart, $lte: currEnd } });
    const previousExpenses = await Expense.find({ userId, date: { $gte: prevStart, $lte: prevEnd } });

    const currentMonthSpend = currentExpenses.reduce((s, e) => s + e.amount, 0);
    const previousMonthSpend = previousExpenses.reduce((s, e) => s + e.amount, 0);

    const diff = currentMonthSpend - previousMonthSpend;
    const changePercent = previousMonthSpend > 0
      ? parseFloat(((diff / previousMonthSpend) * 100).toFixed(1))
      : (currentMonthSpend > 0 ? 100 : 0);

    // Category breakdown delta
    const currentCatMap = {};
    currentExpenses.forEach(e => { currentCatMap[e.category] = (currentCatMap[e.category] || 0) + e.amount; });

    const prevCatMap = {};
    previousExpenses.forEach(e => { prevCatMap[e.category] = (prevCatMap[e.category] || 0) + e.amount; });

    const categoryDeltas = Object.keys({ ...currentCatMap, ...prevCatMap }).map(cat => {
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
   */
  static async getBudgetUtilization(userId) {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const budgets = await Budget.find({ userId });
    const currentExpenses = await Expense.find({ userId, date: { $gte: startDate, $lte: endDate } });

    const categorySpendMap = {};
    currentExpenses.forEach(e => {
      categorySpendMap[e.category] = (categorySpendMap[e.category] || 0) + e.amount;
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
   * Merchant Summary
   */
  static async getMerchantSummary(userId) {
    const expenses = await Expense.find({ userId });
    const merchantMap = {};

    expenses.forEach(e => {
      if (e.merchant) {
        merchantMap[e.merchant] = (merchantMap[e.merchant] || 0) + e.amount;
      }
    });

    const topMerchants = Object.keys(merchantMap).map(m => ({
      merchant: m,
      totalSpend: merchantMap[m],
    })).sort((a, b) => b.totalSpend - a.totalSpend).slice(0, 5);

    return { topMerchants };
  }

  /**
   * Anomaly Detection (Statistical Z-Score or Category Spikes)
   */
  static async getAnomalies(userId) {
    const allExpenses = await Expense.find({ userId }).sort({ date: -1 });
    if (allExpenses.length < 3) return { anomalies: [] };

    const amounts = allExpenses.map(e => e.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);

    const anomalies = [];
    allExpenses.forEach(e => {
      // Flag if transaction is > 2.0 standard deviations above mean AND at least 1.5x mean
      if (stdDev > 0 && mean > 0 && ((e.amount - mean) / stdDev) > 2.0 && e.amount >= (mean * 1.5)) {
        anomalies.push({
          expenseId: e._id,
          title: e.title,
          amount: e.amount,
          category: e.category,
          date: e.date,
          merchant: e.merchant,
          typicalAverage: Math.round(mean),
          deviationFactor: parseFloat(((e.amount - mean) / stdDev).toFixed(1)),
          reason: `Transaction amount (${e.amount}) is significantly higher than user average (${Math.round(mean)}).`,
        });
      }
    });

    return { anomalies };
  }
}

module.exports = AnalyticsService;
