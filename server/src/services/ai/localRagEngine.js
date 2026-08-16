/**
 * Deterministic Local RAG (Retrieval-Augmented Generation) Engine
 * Zero Cloud / Zero API Key Required.
 * Combines exact database factual retrieval with domain-engineered financial reasoning.
 */

class LocalRagEngine {
  /**
   * Local Smart Categorization
   */
  static categorize(title = '', amount = 0, merchant = '', userCategories = []) {
    const text = `${title} ${merchant}`.toLowerCase();
    const defaultCategories = [
      'Food & Dining',
      'Transportation',
      'Housing & Utilities',
      'Entertainment',
      'Shopping',
      'Health & Medical',
      'Subscriptions',
    ];
    const validCategories = userCategories.length > 0 ? userCategories : defaultCategories;

    const rules = [
      {
        category: 'Food & Dining',
        keywords: ['food', 'restaurant', 'starbucks', 'cafe', 'coffee', 'zomato', 'swiggy', 'mcdonalds', 'burger', 'pizza', 'diner', 'grocer', 'bigbasket', 'blinkit', 'zepto', 'supermarket', 'bakery', 'tea', 'dining', 'lunch', 'dinner', 'kfc', 'instamart', 'dmart'],
      },
      {
        category: 'Transportation',
        keywords: ['uber', 'ola', 'lyft', 'taxi', 'cab', 'metro', 'bus', 'train', 'flight', 'airline', 'fuel', 'petrol', 'diesel', 'parking', 'toll', 'irctc', 'indigo', 'rapido', 'air india'],
      },
      {
        category: 'Housing & Utilities',
        keywords: ['rent', 'electricity', 'power', 'water', 'gas', 'wifi', 'broadband', 'internet', 'utility', 'maintenance', 'bill', 'bses', 'apartment', 'housing', 'airtel', 'jio', 'bescom', 'tneb'],
      },
      {
        category: 'Subscriptions',
        keywords: ['netflix', 'spotify', 'prime', 'apple', 'youtube', 'github', 'openai', 'chatgpt', 'hotstar', 'sub', 'membership', 'cloud', 'aws', 'disney', 'hulu', 'patreon'],
      },
      {
        category: 'Entertainment',
        keywords: ['movie', 'cinema', 'pvr', 'inox', 'theatre', 'concert', 'gaming', 'steam', 'playstation', 'game', 'club', 'party', 'bowling', 'xbox'],
      },
      {
        category: 'Health & Medical',
        keywords: ['pharmacy', 'medicine', 'doctor', 'hospital', 'clinic', 'dentist', 'apollo', '1mg', 'gym', 'fitness', 'cult', 'pharma', 'health', 'medplus', 'diagnostic'],
      },
      {
        category: 'Shopping',
        keywords: ['amazon', 'flipkart', 'myntra', 'zara', 'nike', 'adidas', 'store', 'shop', 'cloth', 'electronics', 'croma', 'mall', 'apple store', 'uniqlo', 'h&m'],
      },
    ];

    for (const rule of rules) {
      if (validCategories.includes(rule.category)) {
        if (rule.keywords.some((k) => text.includes(k))) {
          return {
            category: rule.category,
            confidence: 0.95,
            reason: `Matched "${rule.category}" via deterministic keyword taxonomy.`,
            isAiGenerated: false,
            source: 'local_rag',
          };
        }
      }
    }

    const fallback = validCategories.includes('Shopping') ? 'Shopping' : validCategories[0] || 'General';
    return {
      category: fallback,
      confidence: 0.75,
      reason: 'Assigned standard default category.',
      isAiGenerated: false,
      source: 'local_rag',
    };
  }

  /**
   * Local Monthly Financial Summary
   */
  static generateMonthlySummary(ctx) {
    const currency = ctx.currency || '₹';
    const totalSpend = Number(ctx.totalSpend || 0).toLocaleString();
    const avgDaily = Number(ctx.averageDailySpend || 0).toLocaleString();
    const daysLeft = ctx.daysRemaining || 0;
    const topCat = ctx.topCategory && ctx.topCategory !== 'None' ? ctx.topCategory : null;
    const topCatSpend = Number(ctx.topCategorySpend || 0).toLocaleString();
    const changePercent = Math.abs(ctx.changePercent || 0);
    const isInc = ctx.isIncrease;

    let summaryText = `You have spent ${currency}${totalSpend} this month, averaging ${currency}${avgDaily}/day with ${daysLeft} days remaining. `;

    if (topCat) {
      summaryText += `${topCat} is your primary spending driver at ${currency}${topCatSpend}. `;
    }

    if (changePercent > 0) {
      summaryText += `Your current spending pace is ${changePercent}% ${isInc ? 'higher' : 'lower'} than this point last month.`;
    } else {
      summaryText += `Your monthly spending pace is tracking consistently with your previous baseline.`;
    }

    return {
      summaryText: summaryText.trim(),
      facts: ctx,
      isAiGenerated: false,
      source: 'local_rag',
    };
  }

  /**
   * Local Spending Change Explanation
   */
  static generateSpendingExplanation(comparison) {
    const isInc = comparison.isIncrease;
    const diff = Math.abs(comparison.diff || 0).toLocaleString();
    const percent = Math.abs(comparison.changePercent || 0);
    const driver = comparison.biggestCategoryIncrease;

    let explanation = isInc
      ? `Your spending increased by ₹${diff} (${percent}%) compared to last month.`
      : `Your spending decreased by ₹${diff} (${percent}%) compared to last month. Excellent financial discipline!`;

    if (driver && isInc) {
      explanation += ` The largest contributor was ${driver.category} (+₹${Number(driver.diff).toLocaleString()}).`;
    }

    return {
      explanation,
      data: comparison,
      isAiGenerated: false,
      source: 'local_rag',
    };
  }

  /**
   * Local Copilot Chat Synthesis
   */
  static generateCopilotAnswer(intent, toolData, userQuery = '') {
    let answer = `Here is your requested financial intelligence:\n`;

    switch (intent) {
      case 'EXPENSE_QUERY':
        answer = `You have spent ₹${Number(toolData.totalSpend || 0).toLocaleString()} across ${toolData.transactionCount || 0} transactions this month, averaging ₹${Number(toolData.averageDailySpend || 0).toLocaleString()}/day with ${toolData.daysRemaining || 0} days remaining.`;
        break;

      case 'CATEGORY_ANALYSIS':
        if (toolData.topCategory) {
          answer = `Your top spending category is **${toolData.topCategory.category}** at ₹${Number(toolData.topCategory.amount || 0).toLocaleString()} (${toolData.topCategory.percentage}% of your total monthly expenditure).`;
        } else {
          answer = `No categorized spending recorded yet for the current period.`;
        }
        break;

      case 'BUDGET_QUERY':
        const spent = Number(toolData.totalSpent || 0).toLocaleString();
        const allocated = Number(toolData.totalAllocated || 0).toLocaleString();
        const remaining = Number(toolData.totalRemaining || 0).toLocaleString();
        answer = `You have spent ₹${spent} out of your ₹${allocated} total budget allowance. You have ₹${remaining} safe-to-spend remaining across your active categories.`;
        break;

      case 'GOAL_QUERY':
        answer = `You currently have ${toolData.activeGoalsCount || 0} active financial savings goals. Keep compounding your monthly contributions to stay on target!`;
        break;

      case 'RECURRING_QUERY':
        const burden = Number(toolData.monthlyBurden || 0).toLocaleString();
        answer = `Your active recurring subscriptions and fixed obligations total approximately ₹${burden}/month.`;
        break;

      case 'ANOMALY_QUERY':
        if (toolData.anomalies && toolData.anomalies.length > 0) {
          const names = toolData.anomalies.map((a) => `${a.title} (₹${Number(a.amount).toLocaleString()})`).join(', ');
          answer = `Detected ${toolData.anomalies.length} unusually large transaction(s) relative to your average baseline: ${names}.`;
        } else {
          answer = `All recent transactions are consistent with your expected spending patterns. No spending anomalies detected.`;
        }
        break;

      case 'TREND_ANALYSIS':
        const delta = Math.abs(toolData.changePercent || 0);
        const direction = toolData.isIncrease ? 'increased' : 'decreased';
        answer = `Your overall spending has ${direction} by ${delta}% compared to last month (Current: ₹${Number(toolData.currentMonthSpend || 0).toLocaleString()}, Previous: ₹${Number(toolData.previousMonthSpend || 0).toLocaleString()}).`;
        break;

      case 'HEALTH_SCORE_QUERY':
        answer = `Your Financial Health Score is **${toolData.score || 85}/100** (Grade: ${toolData.grade || 'A'} - ${toolData.status || 'Good'}).`;
        break;

      default:
        answer = `Based on your live financial data: Total spend ₹${Number(toolData.totalSpend || 0).toLocaleString()} across ${toolData.transactionCount || 0} records.`;
        break;
    }

    return {
      answer,
      intent,
      evidence: toolData,
      isAiGenerated: false,
      source: 'local_rag',
    };
  }
}

module.exports = LocalRagEngine;
