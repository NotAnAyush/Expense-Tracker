const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../src/server');
const User = require('../src/models/User');
const Expense = require('../src/models/Expense');
const LocalRagEngine = require('../src/services/ai/localRagEngine');
const UnifiedAIClient = require('../src/services/ai/unifiedAIClient');

const mockUserId = new mongoose.Types.ObjectId();
const userToken = jwt.sign({ id: mockUserId }, process.env.JWT_SECRET || 'dev_secret_key_12345_change_in_production', { expiresIn: '1h' });

const mockUserDoc = {
  _id: mockUserId,
  name: 'AI Test User',
  email: 'aitest@test.com',
  aiConfig: {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    temperature: 0.2,
    useLocalRagFallback: true,
    toObject() { return this; },
  },
  customization: {},
  save: jest.fn().mockResolvedValue(true),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(User, 'findById').mockImplementation(() => {
    const query = Promise.resolve(mockUserDoc);
    query.select = jest.fn().mockResolvedValue(mockUserDoc);
    return query;
  });
});

describe('Multi-AI Provider & Local RAG Architecture Tests', () => {
  describe('LocalRagEngine Unit Tests', () => {
    it('should categorize transactions deterministically', () => {
      const resUber = LocalRagEngine.categorize('Uber cab ride to office', 350, 'Uber');
      expect(resUber.category).toBe('Transportation');
      expect(resUber.source).toBe('local_rag');

      const resStarbucks = LocalRagEngine.categorize('Morning cappuccino', 280, 'Starbucks');
      expect(resStarbucks.category).toBe('Food & Dining');

      const resNetflix = LocalRagEngine.categorize('Monthly 4K plan', 649, 'Netflix');
      expect(resNetflix.category).toBe('Subscriptions');
    });

    it('should synthesize monthly summary grounded strictly in facts', () => {
      const facts = {
        totalSpend: 15000,
        averageDailySpend: 1000,
        daysRemaining: 16,
        topCategory: 'Food & Dining',
        topCategorySpend: 6000,
        changePercent: 12,
        isIncrease: true,
        projectedMonthEndSpend: 31000,
      };
      const summary = LocalRagEngine.generateMonthlySummary(facts);
      expect(summary.summaryText).toContain('15,000');
      expect(summary.summaryText).toContain('Food & Dining');
      expect(summary.source).toBe('local_rag');
    });

    it('should generate copilot financial response accurately', () => {
      const toolData = { totalSpend: 24000, transactionCount: 12, averageDailySpend: 1600, daysRemaining: 16 };
      const copilot = LocalRagEngine.generateCopilotAnswer('EXPENSE_QUERY', toolData);
      expect(copilot.answer).toContain('24,000');
      expect(copilot.intent).toBe('EXPENSE_QUERY');
    });
  });

  describe('AI Configuration & Test Connection Endpoints', () => {
    it('GET /api/ai/config should return user AI settings and provider metadata', async () => {
      const res = await request(app)
        .get('/api/ai/config')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.config).toBeDefined();
      expect(res.body.config.provider).toBe('gemini');
      expect(res.body.providers.gemini).toBeDefined();
      expect(res.body.providers.gemini.models).toContain('gemini-3.7-flash');
      expect(res.body.providers.gemini.models).toContain('gemini-2.5-flash');
      expect(res.body.providers.gemini.models).toContain('gemini-2.0-flash');
      expect(res.body.providers.gemini.models).toContain('gemini-2.0-flash-thinking-exp-01-21');
      expect(res.body.providers.gemini.models).toContain('gemini-1.5-flash');
      expect(res.body.providers.openai).toBeDefined();
      expect(res.body.providers.openai.models).toContain('gpt-4.5-preview');
      expect(res.body.providers.openai.models).toContain('o3-mini');
      expect(res.body.providers.claude).toBeDefined();
      expect(res.body.providers.claude.models).toContain('claude-3-7-sonnet-20250219');
      expect(res.body.providers.groq).toBeDefined();
      expect(res.body.providers.deepseek).toBeDefined();
      expect(res.body.providers.gemini.apiKeyUrl).toBe('https://aistudio.google.com/app/apikey');
      expect(res.body.providers.openai.apiKeyUrl).toBe('https://platform.openai.com/api-keys');
      expect(res.body.providers.claude.apiKeyUrl).toBe('https://console.anthropic.com/settings/keys');
      expect(res.body.providers.groq.apiKeyUrl).toBe('https://console.groq.com/keys');
      expect(res.body.providers.deepseek.apiKeyUrl).toBe('https://platform.deepseek.com/api_keys');
      expect(res.body.providers.together.apiKeyUrl).toBe('https://api.together.ai/settings/api-keys');
      expect(res.body.providers.perplexity.apiKeyUrl).toBe('https://www.perplexity.ai/settings/api');
      expect(res.body.providers.xai.apiKeyUrl).toBe('https://console.x.ai/');
      expect(res.body.providers.cohere.apiKeyUrl).toBe('https://dashboard.cohere.com/api-keys');
      expect(res.body.providers.local_rag).toBeDefined();
    });

    it('PUT /api/ai/config should update user provider and model preferences for Gemini and other models', async () => {
      const resGemini = await request(app)
        .put('/api/ai/config')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          provider: 'gemini',
          model: 'gemini-2.0-flash-thinking-exp-01-21',
          temperature: 0.3,
          useLocalRagFallback: true,
        });

      expect(resGemini.status).toBe(200);
      expect(resGemini.body.config.provider).toBe('gemini');

      const resTogether = await request(app)
        .put('/api/ai/config')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          provider: 'together',
          model: 'deepseek-ai/DeepSeek-R1',
          temperature: 0.1,
          useLocalRagFallback: true,
        });

      expect(resTogether.status).toBe(200);
      expect(resTogether.body.config.provider).toBe('together');
    });

    it('POST /api/ai/test-connection should succeed for local_rag with 0ms latency', async () => {
      const res = await request(app)
        .post('/api/ai/test-connection')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ provider: 'local_rag' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.provider).toBe('local_rag');
    });
  });
});
