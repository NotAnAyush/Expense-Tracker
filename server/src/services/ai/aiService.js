const UnifiedAIClient = require('./unifiedAIClient');
const LocalRagEngine = require('./localRagEngine');
const ContextBuilder = require('./contextBuilder');
const IntentRouter = require('./intentRouter');
const ToolRegistry = require('./toolRegistry');
const AICache = require('./aiCache');
const AnalyticsService = require('../analytics/analyticsService');
const User = require('../../models/User');
const SecretVault = require('../../models/SecretVault');
const { decrypt } = require('../../utils/cryptoVault');

// Prompt Injection Defense Sanitizer
const sanitizeUserText = (text = '') => {
  return String(text)
    .replace(/ignore\s+(all\s+)?(previous\s+)?instructions/gi, '[filtered]')
    .replace(/system\s+prompt/gi, '[filtered]')
    .replace(/act\s+as\s+root/gi, '[filtered]')
    .replace(/override\s+system/gi, '[filtered]')
    .trim();
};

const extractJson = (text = '') => {
  const match = text.match(/\{[\s\S]*\}/);
  if (match) return JSON.parse(match[0]);
  const cleaned = text.replace(/```(?:json)?|```/g, '').trim();
  return JSON.parse(cleaned);
};

const getUserAiConfig = async (userId) => {
  if (!userId) return {};
  try {
    const user = await User.findById(userId).select('aiConfig');
    const aiConfig = { ...(user?.aiConfig || {}) };
    const provider = aiConfig.provider || 'gemini';

    // If apiKey is not in aiConfig or is masked, transparently resolve decrypted secret from SecretVault
    if (!aiConfig.apiKey || aiConfig.apiKey.startsWith('••••') || aiConfig.apiKey.includes('••••')) {
      const vaultSecret = await SecretVault.findOne({
        userId,
        provider,
        status: 'ACTIVE',
      }).sort({ isDefault: -1, createdAt: -1 });

      if (vaultSecret && vaultSecret.encryptedValue) {
        const decryptedKey = decrypt(vaultSecret.encryptedValue, userId);
        if (decryptedKey) {
          aiConfig.apiKey = decryptedKey;
          if (vaultSecret.customBaseUrl) {
            aiConfig.customBaseUrl = vaultSecret.customBaseUrl;
          }
          // Mark secret as used asynchronously
          SecretVault.updateOne({ _id: vaultSecret._id }, { $set: { lastUsedAt: new Date() } }).exec().catch(() => {});
        }
      }
    }
    return aiConfig;
  } catch {
    return {};
  }
};

class AIService {
  /**
   * INTELLIGENCE 1 — Smart Categorization
   */
  static async suggestCategory(title, amount, merchant, userCategories = [], userId = null) {
    const cleanTitle = sanitizeUserText(title);
    const cleanMerchant = sanitizeUserText(merchant);
    const defaultCategories = ['Food & Dining', 'Transportation', 'Housing & Utilities', 'Entertainment', 'Shopping', 'Health & Medical', 'Subscriptions'];
    const validCategories = userCategories.length > 0 ? userCategories : defaultCategories;

    const userConfig = await getUserAiConfig(userId);

    try {
      const prompt = `You are a financial AI categorizer. Categorize the transaction below into EXACTLY ONE of the allowed categories: [${validCategories.join(', ')}].
Transaction: "${cleanTitle}", Merchant: "${cleanMerchant || 'N/A'}", Amount: ${amount}.
Return JSON only:
{"category": "ChosenCategory", "confidence": 0.95, "reason": "Short explanation"}`;

      const rawResponse = await UnifiedAIClient.generateCompletion({
        prompt,
        systemPrompt: 'You are a precise financial assistant. Always respond with valid JSON.',
        jsonMode: true,
        userConfig,
      });

      if (!rawResponse) {
        return LocalRagEngine.categorize(cleanTitle, amount, cleanMerchant, validCategories);
      }

      const parsed = extractJson(rawResponse);

      return {
        category: validCategories.includes(parsed.category) ? parsed.category : 'Shopping',
        confidence: parsed.confidence || 0.9,
        reason: parsed.reason || 'AI categorical classification',
        isAiGenerated: true,
        source: userConfig.provider || 'gemini',
      };
    } catch (err) {
      console.warn('[AI Categorization Fallback]', err.message);
      return LocalRagEngine.categorize(cleanTitle, amount, cleanMerchant, validCategories);
    }
  }

  /**
   * INTELLIGENCE 2 — Automatic Financial Summaries
   */
  static async getMonthlySummaryAI(userId) {
    const ctx = await ContextBuilder.buildFinancialContext(userId);
    const cacheKey = AICache.generateKey(userId, 'summary', `${ctx.totalSpend}:${ctx.daysRemaining}:${ctx.changePercent}`);
    const cached = AICache.get(cacheKey);
    if (cached) return cached;

    const userConfig = await getUserAiConfig(userId);

    try {
      const prompt = `You are a supportive, concise personal financial assistant. 
Based ONLY on these backend financial facts:
- Monthly Total Spend: ₹${ctx.totalSpend}
- Average Daily Spend: ₹${ctx.averageDailySpend}/day
- Days Remaining: ${ctx.daysRemaining}
- Top Category: ${ctx.topCategory} (₹${ctx.topCategorySpend})
- Month-over-Month Change: ${ctx.changePercent}% ${ctx.isIncrease ? 'increase' : 'decrease'}
- Projected Month-End Spend: ₹${ctx.projectedMonthEndSpend}

Write a natural, encouraging 2-sentence summary of the user's current month. DO NOT invent numbers outside the provided facts.`;

      const rawResponse = await UnifiedAIClient.generateCompletion({
        prompt,
        systemPrompt: 'You are a financial AI advisor.',
        userConfig,
      });

      if (!rawResponse) {
        const fallback = LocalRagEngine.generateMonthlySummary(ctx);
        AICache.set(cacheKey, fallback, 1000 * 60 * 10);
        return fallback;
      }

      const result = {
        summaryText: rawResponse,
        facts: ctx,
        isAiGenerated: true,
        source: userConfig.provider || 'gemini',
      };
      AICache.set(cacheKey, result, 1000 * 60 * 10);
      return result;
    } catch (err) {
      console.warn('[AI Summary Fallback]', err.message);
      const fallback = LocalRagEngine.generateMonthlySummary(ctx);
      AICache.set(cacheKey, fallback, 1000 * 60 * 10);
      return fallback;
    }
  }

  /**
   * INTELLIGENCE 3 — "Why Did My Spending Change?"
   */
  static async getSpendingExplanation(userId) {
    const comparison = await AnalyticsService.getMonthlyComparison(userId);
    const cacheKey = AICache.generateKey(userId, 'spending-explanation', `${comparison.currentMonthSpend}:${comparison.previousMonthSpend}`);
    const cached = AICache.get(cacheKey);
    if (cached) return cached;

    const userConfig = await getUserAiConfig(userId);

    try {
      const prompt = `You are a personal finance assistant explaining spending changes.
Facts:
- Current Month: ₹${comparison.currentMonthSpend}
- Previous Month: ₹${comparison.previousMonthSpend}
- Net Delta: ${comparison.isIncrease ? '+' : ''}₹${comparison.diff} (${comparison.changePercent}%)
- Biggest Category Change: ${comparison.biggestCategoryIncrease ? `${comparison.biggestCategoryIncrease.category} (Change: ₹${comparison.biggestCategoryIncrease.diff})` : 'N/A'}

Provide a clear, supportive 2-sentence explanation of why the user's spending changed. Never judge or lecture. Ground every statement strictly in the numbers above.`;

      const rawResponse = await UnifiedAIClient.generateCompletion({
        prompt,
        systemPrompt: 'You are a financial analyst explaining cash flow variance.',
        userConfig,
      });

      if (!rawResponse) {
        const fallback = LocalRagEngine.generateSpendingExplanation(comparison);
        AICache.set(cacheKey, fallback, 1000 * 60 * 10);
        return fallback;
      }

      const result = {
        explanation: rawResponse,
        data: comparison,
        isAiGenerated: true,
        source: userConfig.provider || 'gemini',
      };
      AICache.set(cacheKey, result, 1000 * 60 * 10);
      return result;
    } catch (err) {
      console.warn('[AI Spending Explanation Fallback]', err.message);
      const fallback = LocalRagEngine.generateSpendingExplanation(comparison);
      AICache.set(cacheKey, fallback, 1000 * 60 * 10);
      return fallback;
    }
  }

  /**
   * INTELLIGENCE 5 — Personal Finance Copilot Chat
   */
  static async copilotChat(userId, userQuery) {
    const cleanQuery = sanitizeUserText(userQuery);
    const routing = IntentRouter.classifyIntent(cleanQuery);
    const toolData = await ToolRegistry.executeTool(routing.tool, userId);
    const userConfig = await getUserAiConfig(userId);

    try {
      const prompt = `You are the Finance Copilot.
User Query: "${cleanQuery}"
Backend Retrieved Grounding Facts: ${JSON.stringify(toolData)}

Formulate a concise, helpful response using standard response structure:
1. Direct Answer (One concise sentence with exact metrics)
2. Evidence/Context (Supporting detail)
3. Action recommendation (Optional link or review suggestion)

NEVER hallucinate numbers not present in Grounding Facts.`;

      const rawResponse = await UnifiedAIClient.generateCompletion({
        prompt,
        systemPrompt: 'You are an autonomous Finance OS Copilot with real-time financial mathematical grounding.',
        userConfig,
      });

      if (!rawResponse) {
        return LocalRagEngine.generateCopilotAnswer(routing.intent, toolData, cleanQuery);
      }

      return {
        answer: rawResponse,
        intent: routing.intent,
        evidence: toolData,
        isAiGenerated: true,
        source: userConfig.provider || 'gemini',
      };
    } catch (err) {
      console.warn('[AI Copilot Fallback]', err.message);
      return LocalRagEngine.generateCopilotAnswer(routing.intent, toolData, cleanQuery);
    }
  }

  /**
   * INTELLIGENCE 6 — Prioritized AI Insight Engine
   */
  static async getInsights(userId) {
    const ctx = await ContextBuilder.buildFinancialContext(userId);
    const cacheKey = AICache.generateKey(userId, 'insights', `${ctx.totalSpend}:${ctx.budgetOverCount}:${ctx.anomaliesCount}`);
    const cached = AICache.get(cacheKey);
    if (cached) return cached;

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

    const sorted = insights.sort((a, b) => b.score - a.score).slice(0, 4);
    AICache.set(cacheKey, sorted, 1000 * 60 * 10);
    return sorted;
  }

  /**
   * INTELLIGENCE 6 — Multimodal Receipt & Invoice Vision OCR
   */
  static async scanReceipt(imageBase64, mimeType = 'image/jpeg', userId = null) {
    const userConfig = await getUserAiConfig(userId);
    return UnifiedAIClient.scanReceipt({
      imageBase64,
      mimeType,
      userConfig,
    });
  }
}

module.exports = AIService;
