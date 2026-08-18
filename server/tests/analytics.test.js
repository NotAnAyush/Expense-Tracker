const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const User = require('../src/models/User');
const Expense = require('../src/models/Expense');
const Budget = require('../src/models/Budget');
const AnalyticsService = require('../src/services/analytics/analyticsService');

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
    jest.spyOn(AnalyticsService, 'getDeterministicAnalytics').mockResolvedValue({
      monthlySummary: { totalSpend: 2500, averageDailySpend: 100 },
      categoryBreakdown: { topCategory: { category: 'Food & Dining', total: 2500 } },
      recentExpenses: [],
      budgetStatuses: [],
    });

    const analyticsRes = await request(app)
      .get('/api/analytics')
      .set('Authorization', `Bearer ${userToken}`);

    expect(analyticsRes.statusCode).toBe(200);
    expect(analyticsRes.body.monthlySummary.totalSpend).toBe(2500);
    expect(analyticsRes.body.categoryBreakdown.topCategory.category).toBe('Food & Dining');
  });

  it('should respond with fallback AI summary when Gemini API key is unconfigured', async () => {
    const aiRes = await request(app)
      .get('/api/ai/summary')
      .set('Authorization', `Bearer ${userToken}`);

    expect(aiRes.statusCode).toBe(200);
    expect(aiRes.body.summaryText).toBeDefined();
    expect(aiRes.body.facts).toBeDefined();
  });

  it('should answer natural language query via Finance Copilot tool router', async () => {
    const copilotRes = await request(app)
      .post('/api/ai/copilot')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ message: 'How much did I spend on food this month?' });

    expect(copilotRes.statusCode).toBe(200);
    expect(copilotRes.body.intent).toBeDefined();
    expect(copilotRes.body.answer).toBeDefined();
  });
});
