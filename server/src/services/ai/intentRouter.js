/**
 * Intent Router: Classifies user natural language query into controlled financial intents
 */
class IntentRouter {
  static classifyIntent(query) {
    const q = (query || '').toLowerCase();

    if (q.includes('health') || q.includes('score') || q.includes('grade') || q.includes('financial status') || q.includes('how am i doing')) {
      return { intent: 'HEALTH_SCORE_QUERY', tool: 'getFinancialHealthScore' };
    }

    if (q.includes('food') || q.includes('dining') || q.includes('category') || q.includes('breakdown') || q.includes('where did my money go')) {
      return { intent: 'CATEGORY_ANALYSIS', tool: 'getCategoryBreakdown' };
    }

    if (q.includes('compare') || q.includes('last month') || q.includes('change') || q.includes('increase') || q.includes('why did i spend more')) {
      return { intent: 'TREND_ANALYSIS', tool: 'getMonthlyComparison' };
    }

    if (q.includes('budget') || q.includes('over budget') || q.includes('limit') || q.includes('pace')) {
      return { intent: 'BUDGET_QUERY', tool: 'getBudgetStatus' };
    }

    if (q.includes('goal') || q.includes('save') || q.includes('target') || q.includes('savings')) {
      return { intent: 'GOAL_QUERY', tool: 'getGoalProgress' };
    }

    if (q.includes('recurring') || q.includes('subscription') || q.includes('fixed') || q.includes('rent')) {
      return { intent: 'RECURRING_QUERY', tool: 'getRecurringExpenses' };
    }

    if (q.includes('unusual') || q.includes('anomaly') || q.includes('spike') || q.includes('large transaction')) {
      return { intent: 'ANOMALY_QUERY', tool: 'getAnomalies' };
    }

    if (q.includes('forecast') || q.includes('project') || q.includes('end of month') || q.includes('per day') || q.includes('velocity')) {
      return { intent: 'FORECAST_QUERY', tool: 'getSpendingVelocity' };
    }

    if (q.includes('how much') || q.includes('total') || q.includes('spend this month')) {
      return { intent: 'EXPENSE_QUERY', tool: 'getCurrentMonthSummary' };
    }

    return { intent: 'GENERAL_FINANCE_QUERY', tool: 'getCurrentMonthSummary' };
  }
}

module.exports = IntentRouter;
