const { getGeminiModel, isAvailable } = require('./geminiClient');
const ContextBuilder = require('./contextBuilder');
const IntentRouter = require('./intentRouter');
const ToolRegistry = require('./toolRegistry');
const AnalyticsService = require('../analytics/analyticsService');
const Category = require('../../models/Category');

// Prompt Injection Defense Sanitizer
const sanitizeUserText = (text = '') => {
  return String(text)
    .replace(/ignore\s+(all\s+)?(previous\s+)?instructions/gi, '[filtered]')
    .replace(/system\s+prompt/gi, '[filtered]')
    .replace(/act\s+as\s+root/gi, '[filtered]')
    .replace(/override\s+system/gi, '[filtered]')
    .trim();
};

class AIService {
  /**
   * INTELLIGENCE 1 — Smart Categorization
   */
  static async suggestCategory(title, amount, merchant, userCategories = []) {
    const cleanTitle = sanitizeUserText(title);
    const cleanMerchant = sanitizeUserText(merchant);
    const defaultCategories = ['Food & Dining', 'Transportation', 'Housing & Utilities', 'Entertainment', 'Shopping', 'Health & Medical', 'Subscriptions'];
    const validCategories = userCategories.length > 0 ? userCategories : defaultCategories;

    if (!isAvailable()) {
      // Deterministic rule-based fallback
      const text = `${cleanTitle} ${cleanMerchant}`.toLowerCase();
      let matchedCategory = 'Shopping';

      if (text.includes('uber') || text.includes('ola') || text.includes('taxi') || text.includes('flight') || text.includes('fuel')) {
        matchedCategory = 'Transportation';
      } else if (text.includes('food') || text.includes('starbucks') || text.includes('zomato') || text.includes('swiggy') || text.includes('restaurant') || text.includes('grocer')) {
        matchedCategory = 'Food & Dining';
      } else if (text.includes('netflix') || text.includes('spotify') || text.includes('sub')) {
        matchedCategory = 'Subscriptions';
      } else if (text.includes('rent') || text.includes('bill') || text.includes('power') || text.includes('electric')) {
        matchedCategory = 'Housing & Utilities';
      }

      return {
        category: matchedCategory,
        confidence: 0.85,
        reason: `Matched transaction keywords deterministically.`,
        isAiGenerated: false,
      };
    }

    try {
      const model = getGeminiModel();
      const prompt = `You are a financial AI categorizer. Categorize the transaction below into EXACTLY ONE of the allowed categories: [${validCategories.join(', ')}].
Transaction: "${cleanTitle}", Merchant: "${cleanMerchant || 'N/A'}", Amount: ${amount}.
Return JSON only:
{"category": "ChosenCategory", "confidence": 0.95, "reason": "Short explanation"}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const cleanedJson = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      return {
        category: validCategories.includes(parsed.category) ? parsed.category : 'Shopping',
        confidence: parsed.confidence || 0.9,
        reason: parsed.reason || 'AI categorical classification',
        isAiGenerated: true,
      };
    } catch (err) {
      console.error('[AI Smart Categorization Error]', err.message);
      return { category: 'Shopping', confidence: 0.7, reason: 'Fallback default category', isAiGenerated: false };
    }
  }

  /**
   * INTELLIGENCE 2 — Automatic Financial Summaries
   */
  static async getMonthlySummaryAI(userId) {
    const ctx = await ContextBuilder.buildFinancialContext(userId);

    const fallbackSummary = `You spent ₹${ctx.totalSpend.toLocaleString()} this month (avg ₹${ctx.averageDailySpend}/day). ${ctx.topCategory !== 'None' ? `${ctx.topCategory} was your top expense category at ₹${ctx.topCategorySpend.toLocaleString()}.` : ''}`;

    if (!isAvailable()) {
      return {
        summaryText: fallbackSummary,
        facts: ctx,
        isAiGenerated: false,
      };
    }

    try {
      const model = getGeminiModel();
      const prompt = `You are a supportive, concise personal financial assistant. 
Based ONLY on these backend financial facts:
- Monthly Total Spend: ₹${ctx.totalSpend}
- Average Daily Spend: ₹${ctx.averageDailySpend}/day
- Days Remaining: ${ctx.daysRemaining}
- Top Category: ${ctx.topCategory} (₹${ctx.topCategorySpend})
- Month-over-Month Change: ${ctx.changePercent}% ${ctx.isIncrease ? 'increase' : 'decrease'}
- Projected Month-End Spend: ₹${ctx.projectedMonthEndSpend}

Write a natural, encouraging 2-sentence summary of the user's current month. DO NOT invent numbers outside the provided facts.`;

      const result = await model.generateContent(prompt);
      return {
        summaryText: result.response.text().trim(),
        facts: ctx,
        isAiGenerated: true,
      };
    } catch (err) {
      console.error('[AI Summary Error]', err.message);
      return { summaryText: fallbackSummary, facts: ctx, isAiGenerated: false };
    }
  }

  /**
   * INTELLIGENCE 3 — "Why Did My Spending Change?"
   */
  static async getSpendingExplanation(userId) {
    const comparison = await AnalyticsService.getMonthlyComparison(userId);
    const fallbackText = comparison.isIncrease
      ? `Your spending increased by ₹${comparison.diff.toLocaleString()} (${comparison.changePercent}%) compared to last month${comparison.biggestCategoryIncrease ? `, primarily driven by ${comparison.biggestCategoryIncrease.category} (+₹${comparison.biggestCategoryIncrease.diff.toLocaleString()})` : ''}.`
      : `Your spending decreased by ₹${Math.abs(comparison.diff).toLocaleString()} (${Math.abs(comparison.changePercent)}%) compared to last month. Great job managing your cash flow!`;

    if (!isAvailable()) {
      return { explanation: fallbackText, data: comparison, isAiGenerated: false };
    }

    try {
      const model = getGeminiModel();
      const prompt = `You are a personal finance assistant explaining spending changes.
Facts:
- Current Month: ₹${comparison.currentMonthSpend}
- Previous Month: ₹${comparison.previousMonthSpend}
- Net Delta: ${comparison.isIncrease ? '+' : ''}₹${comparison.diff} (${comparison.changePercent}%)
- Biggest Category Change: ${comparison.biggestCategoryIncrease ? `${comparison.biggestCategoryIncrease.category} (Change: ₹${comparison.biggestCategoryIncrease.diff})` : 'N/A'}

Provide a clear, supportive 2-sentence explanation of why the user's spending changed. Never judge or lecture. Ground every statement strictly in the numbers above.`;

      const result = await model.generateContent(prompt);
      return { explanation: result.response.text().trim(), data: comparison, isAiGenerated: true };
    } catch (err) {
      return { explanation: fallbackText, data: comparison, isAiGenerated: false };
    }
  }

  /**
   * INTELLIGENCE 5 — Personal Finance Copilot Chat
   */
  static async copilotChat(userId, userQuery) {
    const cleanQuery = sanitizeUserText(userQuery);
    const routing = IntentRouter.classifyIntent(cleanQuery);
    const toolData = await ToolRegistry.executeTool(routing.tool, userId);

    const fallbackAnswer = `Based on your data: ${JSON.stringify(toolData)}`;

    if (!isAvailable()) {
      let friendlyText = `Here is your financial data for your request:\n`;
      if (routing.intent === 'EXPENSE_QUERY') {
        friendlyText = `You have spent ₹${toolData.totalSpend?.toLocaleString()} so far this month across ${toolData.transactionCount} transactions (averaging ₹${toolData.averageDailySpend}/day).`;
      } else if (routing.intent === 'CATEGORY_ANALYSIS') {
        friendlyText = `Your top spending category is ${toolData.topCategory?.category || 'N/A'} at ₹${toolData.topCategory?.amount?.toLocaleString()} (${toolData.topCategory?.percentage}% of total).`;
      } else if (routing.intent === 'BUDGET_QUERY') {
        friendlyText = `You have spent ₹${toolData.totalSpent?.toLocaleString()} out of ₹${toolData.totalAllocated?.toLocaleString()} total budgeted across your categories (${toolData.totalRemaining?.toLocaleString()} remaining).`;
      } else if (routing.intent === 'GOAL_QUERY') {
        friendlyText = `You currently have ${toolData.activeGoalsCount} active financial goals.`;
      } else if (routing.intent === 'RECURRING_QUERY') {
        friendlyText = `Your recurring monthly expenses total approximately ₹${toolData.monthlyBurden?.toLocaleString()} per month.`;
      } else if (routing.intent === 'ANOMALY_QUERY') {
        friendlyText = toolData.anomalies?.length > 0
          ? `Found ${toolData.anomalies.length} unusual transactions: ${toolData.anomalies.map(a => `${a.title} (₹${a.amount})`).join(', ')}.`
          : `No unusual transaction spikes detected in your recent spending.`;
      } else if (routing.intent === 'TREND_ANALYSIS') {
        friendlyText = `Your spending is ${toolData.isIncrease ? 'up' : 'down'} by ${toolData.changePercent}% compared to last month (Current: ₹${toolData.currentMonthSpend}, Previous: ₹${toolData.previousMonthSpend}).`;
      }

      return {
        answer: friendlyText,
        intent: routing.intent,
        evidence: toolData,
        isAiGenerated: false,
      };
    }

    try {
      const model = getGeminiModel();
      const prompt = `You are the Finance Copilot.
User Query: "${cleanQuery}"
Backend Retrieved Grounding Facts: ${JSON.stringify(toolData)}

Formulate a concise, helpful response using standard response structure:
1. Direct Answer (One concise sentence with exact metrics)
2. Evidence/Context (Supporting detail)
3. Action recommendation (Optional link or review suggestion)

NEVER hallucinate numbers not present in Grounding Facts.`;

      const result = await model.generateContent(prompt);
      return {
        answer: result.response.text().trim(),
        intent: routing.intent,
        evidence: toolData,
        isAiGenerated: true,
      };
    } catch (err) {
      console.error('[Copilot Chat Error]', err.message);
      return { answer: fallbackAnswer, intent: routing.intent, evidence: toolData, isAiGenerated: false };
    }
  }

  /**
   * INTELLIGENCE 6 — Prioritized AI Insight Engine
   */
  static async getInsights(userId) {
    const ctx = await ContextBuilder.buildFinancialContext(userId);
    const insights = [];

    // 1. Month-over-Month Insight
    if (ctx.changePercent !== 0) {
      insights.push({
        id: 'mom-change',
        type: ctx.isIncrease ? 'warning' : 'success',
        title: ctx.isIncrease ? 'Spending Increase Detected' : 'Spending Reduction',
        explanation: `Your spending is ${ctx.isIncrease ? 'up' : 'down'} ${ctx.changePercent}% compared to last month.`,
        metric: `${ctx.isIncrease ? '+' : ''}${ctx.changePercent}% MoM`,
        actionLabel: 'View Monthly Breakdown',
        actionTarget: '/analytics',
        score: Math.min(100, Math.abs(ctx.changePercent) + 50),
      });
    }

    // 2. Budget Alert Insight
    if (ctx.budgetOverCount > 0) {
      insights.push({
        id: 'budget-over',
        type: 'danger',
        title: 'Budget Limit Exceeded',
        explanation: `You have ${ctx.budgetOverCount} category budget(s) currently over limit.`,
        metric: `${ctx.budgetOverCount} Categories Over`,
        actionLabel: 'Review Budgets',
        actionTarget: '/budgets',
        score: 95,
      });
    }

    // 3. Anomaly Insight
    if (ctx.anomaliesCount > 0) {
      insights.push({
        id: 'anomaly-alert',
        type: 'warning',
        title: 'Unusual Transaction Detected',
        explanation: `Found ${ctx.anomaliesCount} unusually large transaction(s) relative to your average baseline.`,
        metric: `${ctx.anomaliesCount} Anomalies`,
        actionLabel: 'Inspect Transactions',
        actionTarget: '/expenses',
        score: 90,
      });
    }

    // 4. Recurring Burden Insight
    if (ctx.monthlyRecurringBurden > 0) {
      insights.push({
        id: 'recurring-burden',
        type: 'info',
        title: 'Fixed Subscriptions & Recurring',
        explanation: `Recurring obligations account for approx ₹${ctx.monthlyRecurringBurden.toLocaleString()}/month.`,
        metric: `₹${ctx.monthlyRecurringBurden.toLocaleString()}/mo`,
        actionLabel: 'Manage Subscriptions',
        actionTarget: '/recurring',
        score: 60,
      });
    }

    // Sort by priority score and return top 4 cards
    return insights.sort((a, b) => b.score - a.score).slice(0, 4);
  }
}

module.exports = AIService;
