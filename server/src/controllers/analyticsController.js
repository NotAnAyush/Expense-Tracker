const AnalyticsService = require('../services/analytics/analyticsService');

exports.getAnalyticsOverview = async (req, res) => {
  try {
    const userId = req.user._id;
    const [
      monthlySummary,
      categoryBreakdown,
      monthlyComparison,
      budgetUtilization,
      spendingVelocity,
      recurringSummary,
      goalProgress,
      merchantSummary,
      anomalies,
    ] = await Promise.all([
      AnalyticsService.getMonthlySummary(userId),
      AnalyticsService.getCategoryBreakdown(userId),
      AnalyticsService.getMonthlyComparison(userId),
      AnalyticsService.getBudgetUtilization(userId),
      AnalyticsService.getSpendingVelocity(userId),
      AnalyticsService.getRecurringExpenseSummary(userId),
      AnalyticsService.getGoalProgress(userId),
      AnalyticsService.getMerchantSummary(userId),
      AnalyticsService.getAnomalies(userId),
    ]);

    res.json({
      monthlySummary,
      categoryBreakdown,
      monthlyComparison,
      budgetUtilization,
      spendingVelocity,
      recurringSummary,
      goalProgress,
      merchantSummary,
      anomalies,
    });
  } catch (error) {
    console.error('[Analytics Controller Error]', error);
    res.status(500).json({ message: 'Server error computing financial analytics' });
  }
};
