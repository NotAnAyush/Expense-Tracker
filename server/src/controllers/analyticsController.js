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
    cashFlowSummary,
    financialHealth,
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
    AnalyticsService.getCashFlowSummary(userId),
    AnalyticsService.getFinancialHealthIndex(userId),
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
    cashFlowSummary,
    financialHealth,
  });
});

exports.getCashFlow = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const targetYear = year ? parseInt(year, 10) : undefined;
  const targetMonth = month !== undefined ? parseInt(month, 10) - 1 : undefined; // Convert 1-indexed to 0-indexed
  const result = await AnalyticsService.getCashFlowSummary(req.user._id, targetYear, targetMonth);
  res.json(result);
});

exports.getFinancialHealth = asyncHandler(async (req, res) => {
  const { year, month } = req.query;
  const targetYear = year ? parseInt(year, 10) : undefined;
  const targetMonth = month !== undefined ? parseInt(month, 10) - 1 : undefined;
  const result = await AnalyticsService.getFinancialHealthIndex(req.user._id, targetYear, targetMonth);
  res.json(result);
});
