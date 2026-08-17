/**
 * Declarative Tool / Function Definitions for Native LLM Function Calling
 * Compatible with Gemini, OpenAI, Groq, and Claude.
 */

const FINANCE_TOOLS = [
  {
    name: 'getCurrentMonthSummary',
    description: 'Retrieves current month total spend, average daily pace, transaction count, and days remaining.',
    parameters: {
      type: 'object',
      properties: {
        year: { type: 'number', description: 'Target year (optional)' },
        month: { type: 'number', description: 'Target month 1-12 (optional)' },
      },
    },
  },
  {
    name: 'getCategoryBreakdown',
    description: 'Retrieves categorical spending distribution, percentages, and identifies the highest spending category.',
    parameters: {
      type: 'object',
      properties: {
        months: { type: 'number', description: 'Number of past months to aggregate (default 1)' },
      },
    },
  },
  {
    name: 'getMonthlyComparison',
    description: 'Compares spending between the current and previous month, calculating deltas and variance drivers.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'getBudgetStatus',
    description: 'Retrieves category budget limits, actual expenditures, safe-to-spend allowances, and over-budget alerts.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'getSpendingVelocity',
    description: 'Calculates daily spending velocity, contractual recurring load, and projected month-end expenditure.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'getRecurringExpenses',
    description: 'Retrieves active subscriptions, recurring bills, and annualized fixed obligations.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'getGoalProgress',
    description: 'Retrieves active financial savings goals, target dates, remaining amounts, and required monthly contributions.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'getAnomalies',
    description: 'Retrieves statistically anomalous, high-variance, or outlier transactions flagged by the MAD engine.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'getFinancialHealthScore',
    description: 'Retrieves the holistic 0-100 composite Financial Health Index across budget adherence, savings, and stability.',
    parameters: { type: 'object', properties: {} },
  },
  {
    name: 'getRecentExpenses',
    description: 'Retrieves recent transactions with optional category filtering.',
    parameters: {
      type: 'object',
      properties: {
        category: { type: 'string', description: 'Specific category to filter by' },
        limit: { type: 'number', description: 'Number of recent transactions to return (default 10)' },
      },
    },
  },
];

module.exports = { FINANCE_TOOLS };
