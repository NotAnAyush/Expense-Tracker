const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const User = require('../src/models/User');
const AnalyticsService = require('../src/services/analytics/analyticsService');
const AIService = require('../src/services/ai/aiService');

const mockUserId = new mongoose.Types.ObjectId();
const userToken = jwt.sign({ id: mockUserId }, process.env.JWT_SECRET || 'dev_secret_key_12345_change_in_production', { expiresIn: '1h' });

const mockUserDoc = {
  _id: mockUserId,
  name: 'Test User',
  email: 'test@antigravity.finance',
  preferredCurrency: '₹',
  aiConfig: { useLocalRagFallback: true },
  customization: {},
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(User, 'findById').mockReturnValue({
    select: jest.fn().mockResolvedValue(mockUserDoc),
  });
});

describe('Financial Source of Truth & Analytics Engine', () => {
  it('should compute deterministic analytics accurately', async () => {
    jest.spyOn(AnalyticsService, 'getMonthlySummary').mockResolvedValue({ totalSpend: 2500, transactionCount: 5, averageDailySpend: 100 });
    jest.spyOn(AnalyticsService, 'getCategoryBreakdown').mockResolvedValue({ topCategory: 'Food & Dining', categories: [{ category: 'Food & Dining', total: 2500 }] });
    jest.spyOn(AnalyticsService, 'getMonthlyComparison').mockResolvedValue({ changePercent: 0, isIncrease: false });
    jest.spyOn(AnalyticsService, 'getBudgetUtilization').mockResolvedValue([]);
    jest.spyOn(AnalyticsService, 'getSpendingVelocity').mockResolvedValue({ status: 'normal' });
    jest.spyOn(AnalyticsService, 'getRecurringExpenseSummary').mockResolvedValue({ totalMonthlyCommitment: 0 });
    jest.spyOn(AnalyticsService, 'getGoalProgress').mockResolvedValue([]);
    jest.spyOn(AnalyticsService, 'getMerchantSummary').mockResolvedValue([]);
    jest.spyOn(AnalyticsService, 'getAnomalies').mockResolvedValue([]);
    jest.spyOn(AnalyticsService, 'getCashFlowSummary').mockResolvedValue({ netCashFlow: 5000, savingsRate: 40 });
    jest.spyOn(AnalyticsService, 'getFinancialHealthIndex').mockResolvedValue({ score: 85, grade: 'EXCELLENT' });

    const analyticsRes = await request(app)
      .get('/api/analytics')
      .set('Authorization', `Bearer ${userToken}`);

    expect(analyticsRes.statusCode).toBe(200);
    expect(analyticsRes.body.monthlySummary.totalSpend).toBe(2500);
    expect(analyticsRes.body.categoryBreakdown.topCategory).toBe('Food & Dining');
    expect(analyticsRes.body.financialHealth.score).toBe(85);
  });

  it('should respond with fallback AI summary when requested', async () => {
    jest.spyOn(AIService, 'getMonthlySummaryAI').mockResolvedValue({
      summaryText: 'You spent ₹2,500 this month.',
      facts: { totalSpend: 2500 },
      source: 'local_rag',
    });

    const aiRes = await request(app)
      .get('/api/ai/summary')
      .set('Authorization', `Bearer ${userToken}`);

    expect(aiRes.statusCode).toBe(200);
    expect(aiRes.body.summaryText).toContain('2,500');
  });

  it('should answer natural language query via Finance Copilot tool router', async () => {
    jest.spyOn(AIService, 'copilotChat').mockResolvedValue({
      answer: 'You have spent ₹2,500 on food this month.',
      intent: 'CATEGORY_ANALYSIS',
      source: 'local_rag',
    });

    const copilotRes = await request(app)
      .post('/api/ai/copilot')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ message: 'How much did I spend on food this month?' });

    expect(copilotRes.statusCode).toBe(200);
    expect(copilotRes.body.intent).toBe('CATEGORY_ANALYSIS');
    expect(copilotRes.body.answer).toContain('2,500');
  });
});
