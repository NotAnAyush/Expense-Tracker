const AnalyticsService = require('../analytics/analyticsService');
const Expense = require('../../models/Expense');

/**
 * Controlled Backend Tool Registry for Finance Copilot
 * Always operates under authenticated userId context passed from backend logic.
 */
class ToolRegistry {
  static async executeTool(toolName, userId, params = {}) {
    switch (toolName) {
      case 'getCurrentMonthSummary':
        return await AnalyticsService.getMonthlySummary(userId);

      case 'getCategoryBreakdown':
        return await AnalyticsService.getCategoryBreakdown(userId, params.months || 1);

      case 'getMonthlyComparison':
        return await AnalyticsService.getMonthlyComparison(userId);

      case 'getBudgetStatus':
        return await AnalyticsService.getBudgetUtilization(userId);

      case 'getSpendingVelocity':
        return await AnalyticsService.getSpendingVelocity(userId);

      case 'getRecurringExpenses':
        return await AnalyticsService.getRecurringExpenseSummary(userId);

      case 'getGoalProgress':
        return await AnalyticsService.getGoalProgress(userId);

      case 'getAnomalies':
        return await AnalyticsService.getAnomalies(userId);

      case 'getRecentExpenses':
        const query = { userId };
        if (params.category) query.category = params.category;
        const expenses = await Expense.find(query).sort({ date: -1 }).limit(params.limit || 10);
        return { count: expenses.length, expenses };

      default:
        throw new Error(`Tool '${toolName}' not allowed or unsupported.`);
    }
  }
}

module.exports = ToolRegistry;
