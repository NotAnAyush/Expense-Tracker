const mongoose = require('mongoose');
const UnifiedAIClient = require('./unifiedAIClient');
const LocalRagEngine = require('./localRagEngine');
const ContextBuilder = require('./contextBuilder');
const IntentRouter = require('./intentRouter');
const ToolRegistry = require('./toolRegistry');
const AnalyticsService = require('../analytics/analyticsService');
const AICache = require('./aiCache');
const User = require('../../models/User');
const Expense = require('../../models/Expense');

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
    return user?.aiConfig || {};
  } catch {
    return {};
  }
};

class AIService {
  /**
   * INTELLIGENCE 1 — 3-Tier Smart Categorization Cascade
   * Tier 1: User Historical Prior (<5ms, 0 tokens)
   * Tier 2: Deterministic Taxonomy (<1ms, 0 tokens)
   * Tier 3: Structured AI Inference
   */
  static async suggestCategory(title, amount, merchant = '', userCategories = [], userId = null) {
    const cleanTitle = sanitizeUserText(title);
    const cleanMerchant = sanitizeUserText(merchant);
    const defaultCategories = ['Food & Dining', 'Transportation', 'Housing & Utilities', 'Entertainment', 'Shopping', 'Health & Medical', 'Subscriptions'];
    const validCategories = userCategories.length > 0 ? userCategories : defaultCategories;
    const searchVendor = (cleanMerchant || cleanTitle).toLowerCase().trim();

    // ==========================================
    // TIER 1: User Historical Prior (Fast Cache)
    // ==========================================
    if (userId && searchVendor) {
      try {
        const userObjId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
        const historyMatch = await Expense.aggregate([
          {
            $match: {
              userId: userObjId,
              $or: [
                { merchant: { $regex: new RegExp(`^${searchVendor}$`, 'i') } },
                { title: { $regex: new RegExp(`^${searchVendor}$`, 'i') } },
              ],
            },
          },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]);

        if (historyMatch.length > 0 && historyMatch[0].count >= 2) {
          const topCategory = historyMatch[0]._id;
          if (validCategories.includes(topCategory)) {
            return {
              category: topCategory,
              confidence: 0.98,
              reason: `Matched your personal transaction history (${historyMatch[0].count} previous purchases).`,
              isAiGenerated: false,
              source: 'user_prior',
            };
          }
        }
      } catch (err) {
        console.warn('[Tier 1 Prior Lookup Warning]', err.message);
      }
    }

    // ==========================================
    // TIER 2: High-Precision Deterministic Rules
    // ==========================================
    const ruleMatch = LocalRagEngine.categorize(cleanTitle, amount, cleanMerchant, validCategories);
    if (ruleMatch && ruleMatch.confidence >= 0.90) {
      return ruleMatch;
    }

    // ==========================================
    // TIER 3: Unified AI Multi-Provider Engine
    // ==========================================
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
        return ruleMatch;
      }

      const parsed = extractJson(rawResponse);

      return {
        category: validCategories.includes(parsed.category) ? parsed.category : (ruleMatch?.category || 'Shopping'),
        confidence: parsed.confidence || 0.9,
        reason: parsed.reason || 'AI categorical classification',
        isAiGenerated: true,
        source: userConfig.provider || 'gemini',
      };
    } catch (err) {
      console.warn('[AI Categorization Fallback]', err.message);
      return ruleMatch;
    }
  }

  /**
   * INTELLIGENCE 2 — Automatic Financial Summaries with State-Hash Caching
   */
  static async getMonthlySummaryAI(userId) {
    const ctx = await ContextBuilder.buildFinancialContext(userId);
    const userConfig = await getUserAiConfig(userId);

    // Cache check based on financial metrics fingerprint
    const cacheKey = AICache.generateKey(userId, 'monthly_summary', `${ctx.period}_${ctx.totalSpend}_${ctx.anomaliesCount}`);
    const cached = AICache.get(cacheKey);
    if (cached) return cached;

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
        AICache.set(cacheKey, fallback);
        return fallback;
      }

      const result = {
        summaryText: rawResponse,
        facts: ctx,
        isAiGenerated: true,
        source: userConfig.provider || 'gemini',
      };

      AICache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn('[AI Summary Fallback]', err.message);
      const fallback = LocalRagEngine.generateMonthlySummary(ctx);
      AICache.set(cacheKey, fallback);
      return fallback;
    }
  }

  /**
   * INTELLIGENCE 3 — "Why Did My Spending Change?" with State-Hash Caching
   */
  static async getSpendingExplanation(userId) {
    const comparison = await AnalyticsService.getMonthlyComparison(userId);
    const userConfig = await getUserAiConfig(userId);

    const cacheKey = AICache.generateKey(userId, 'spending_explanation', `${comparison.currentMonthSpend}_${comparison.previousMonthSpend}_${comparison.diff}`);
    const cached = AICache.get(cacheKey);
    if (cached) return cached;

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
        AICache.set(cacheKey, fallback);
        return fallback;
      }

      const result = {
        explanation: rawResponse,
        data: comparison,
        isAiGenerated: true,
        source: userConfig.provider || 'gemini',
      };

      AICache.set(cacheKey, result);
      return result;
    } catch (err) {
      console.warn('[AI Spending Explanation Fallback]', err.message);
      const fallback = LocalRagEngine.generateSpendingExplanation(comparison);
      AICache.set(cacheKey, fallback);
      return fallback;
    }
  }

  /**
   * INTELLIGENCE 5 — Personal Finance Copilot Chat (Synchronous)
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
   * INTELLIGENCE 5B — Copilot Chat with SSE Token Streaming
   */
  static async copilotChatStream(userId, userQuery, onChunk) {
    const cleanQuery = sanitizeUserText(userQuery);
    const routing = IntentRouter.classifyIntent(cleanQuery);
    const toolData = await ToolRegistry.executeTool(routing.tool, userId);
    const userConfig = await getUserAiConfig(userId);

    // Send metadata header chunk first
    if (onChunk) {
      onChunk({
        type: 'meta',
        intent: routing.intent,
        evidence: toolData,
        source: userConfig.provider || 'gemini',
      });
    }

    try {
      const prompt = `You are the Finance Copilot.
User Query: "${cleanQuery}"
Backend Retrieved Grounding Facts: ${JSON.stringify(toolData)}

Formulate a concise, helpful response using standard response structure:
1. Direct Answer (One concise sentence with exact metrics)
2. Evidence/Context (Supporting detail)
3. Action recommendation (Optional link or review suggestion)

NEVER hallucinate numbers not present in Grounding Facts.`;

      const streamedText = await UnifiedAIClient.generateStreamingCompletion({
        prompt,
        systemPrompt: 'You are an autonomous Finance OS Copilot with real-time financial mathematical grounding.',
        userConfig,
        onChunk: (chunk) => {
          if (onChunk) onChunk({ type: 'token', token: chunk.token });
        },
      });

      if (!streamedText) {
        const fallback = LocalRagEngine.generateCopilotAnswer(routing.intent, toolData, cleanQuery);
        if (onChunk) onChunk({ type: 'token', token: fallback.answer });
      }
    } catch (err) {
      console.warn('[AI Streaming Fallback]', err.message);
      const fallback = LocalRagEngine.generateCopilotAnswer(routing.intent, toolData, cleanQuery);
      if (onChunk) onChunk({ type: 'token', token: fallback.answer });
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

    return insights.sort((a, b) => b.score - a.score).slice(0, 4);
  }

  /**
   * INTELLIGENCE 7 — Multimodal Receipt & Invoice Vision OCR
   */
  static async scanReceipt(userId, imageBase64, mimeType = 'image/jpeg') {
    const userConfig = await getUserAiConfig(userId);

    const prompt = `You are a financial receipt parser. Extract receipt metadata into valid JSON only:
{
  "merchant": "Merchant Name",
  "amount": 123.45,
  "date": "YYYY-MM-DD",
  "category": "Recommended Category (Food & Dining, Transportation, Housing & Utilities, Entertainment, Shopping, Health & Medical, Subscriptions)",
  "tax": 0.00,
  "confidence": 0.95,
  "lineItems": [{"item": "Item Name", "price": 10.00}]
}`;

    try {
      const rawResponse = await UnifiedAIClient.generateMultimodalCompletion({
        prompt,
        imageBase64,
        mimeType,
        userConfig,
      });

      const parsed = extractJson(rawResponse);
      return {
        success: true,
        data: parsed,
        isAiGenerated: true,
        source: userConfig.provider || 'gemini',
      };
    } catch (err) {
      console.warn('[Receipt Vision OCR Fallback]', err.message);
      return {
        success: false,
        message: err.message || 'Failed to scan receipt image.',
      };
    }
  }
}

module.exports = AIService;
