const AnalyticsService = require('../analytics/analyticsService');

class ContextBuilder {
  /**
   * Builds sanitized context for AI summary & copilot
   */
  static async buildFinancialContext(userId) {
    const [
      monthlySummary,
      categoryBreakdown,
      monthlyComparison,
      budgetUtilization,
      spendingVelocity,
      recurringSummary,
      goalProgress,
      anomalies,
    ] = await Promise.all([
      AnalyticsService.getMonthlySummary(userId),
      AnalyticsService.getCategoryBreakdown(userId),
      AnalyticsService.getMonthlyComparison(userId),
      AnalyticsService.getBudgetUtilization(userId),
      AnalyticsService.getSpendingVelocity(userId),
      AnalyticsService.getRecurringExpenseSummary(userId),
      AnalyticsService.getGoalProgress(userId),
      AnalyticsService.getAnomalies(userId),
    ]);

    return {
      period: `${monthlySummary.year}-${String(monthlySummary.month).padStart(2, '0')}`,
      totalSpend: monthlySummary.totalSpend,
      averageDailySpend: monthlySummary.averageDailySpend,
      daysRemaining: monthlySummary.daysRemaining,
      topCategory: categoryBreakdown.topCategory ? categoryBreakdown.topCategory.category : 'None',
      topCategorySpend: categoryBreakdown.topCategory ? categoryBreakdown.topCategory.amount : 0,
      previousMonthSpend: monthlyComparison.previousMonthSpend,
      changePercent: monthlyComparison.changePercent,
      isIncrease: monthlyComparison.isIncrease,
      budgetTotalAllocated: budgetUtilization.totalAllocated,
      budgetTotalSpent: budgetUtilization.totalSpent,
      budgetOverCount: budgetUtilization.overBudgetCount,
      projectedMonthEndSpend: spendingVelocity.projectedMonthEndSpend,
      monthlyRecurringBurden: recurringSummary.monthlyBurden,
      recurringCount: recurringSummary.count,
      activeGoalsCount: goalProgress.activeGoalsCount,
      anomaliesCount: anomalies.anomalies.length,
      anomaliesList: anomalies.anomalies.slice(0, 3).map(a => `${a.title}: ${a.amount}`),
    };
  }
}

module.exports = ContextBuilder;
