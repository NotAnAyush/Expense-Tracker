const AnalyticsService = require('../services/analytics/analyticsService');
const asyncHandler = require('../utils/asyncHandler');

exports.getAnalyticsOverview = asyncHandler(async (req, res) => {
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
    financialHealthScore,
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
    AnalyticsService.getFinancialHealthScore(userId),
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
    financialHealthScore,
  });
});
