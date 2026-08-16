const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const User = require('../src/models/User');
const Expense = require('../src/models/Expense');
const LocalRagEngine = require('../src/services/ai/localRagEngine');
const UnifiedAIClient = require('../src/services/ai/unifiedAIClient');
const AIService = require('../src/services/ai/aiService');
const AICache = require('../src/services/ai/aiCache');

let mongoServer;
let userToken;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'AI Test User', email: 'aitest@test.com', password: 'SecurePass1' });

  userToken = res.body.token;
  userId = res.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Enterprise AI/ML Architecture & Multi-Provider Suite', () => {
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

  describe('3-Tier Categorization & Historical Prior Cache', () => {
    it('should match Tier 1 Historical Prior if user has past matching transactions', async () => {
      // Seed 2 expenses with same merchant
      await Expense.create({
        userId,
        title: 'Starbucks Coffee',
        amount: 350,
        category: 'Food & Dining',
        date: new Date(),
        merchant: 'Starbucks',
      });
      await Expense.create({
        userId,
        title: 'Starbucks Frappe',
        amount: 400,
        category: 'Food & Dining',
        date: new Date(),
        merchant: 'Starbucks',
      });

      const res = await AIService.suggestCategory('Coffee Treat', 300, 'Starbucks', [], userId);
      expect(res.category).toBe('Food & Dining');
      expect(res.source).toBe('user_prior');
      expect(res.confidence).toBe(0.98);
    });
  });

  describe('Mutation-Aware State Hash Caching', () => {
    it('should set and get items from AICache with TTL', () => {
      const key = AICache.generateKey(userId, 'test_summary', 'hash_123');
      AICache.set(key, { text: 'Instant cached summary' });

      const retrieved = AICache.get(key);
      expect(retrieved).toBeDefined();
      expect(retrieved.text).toBe('Instant cached summary');

      AICache.clearUser(userId);
      expect(AICache.get(key)).toBeNull();
    });
  });

  describe('AI Configuration & Production Endpoints', () => {
    it('GET /api/ai/config should return user AI settings and provider metadata', async () => {
      const res = await request(app)
        .get('/api/ai/config')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.config).toBeDefined();
      expect(res.body.config.provider).toBe('gemini');
      expect(res.body.providers.openai).toBeDefined();
      expect(res.body.providers.groq).toBeDefined();
      expect(res.body.providers.deepseek).toBeDefined();
      expect(res.body.providers.claude).toBeDefined();
      expect(res.body.providers.local_rag).toBeDefined();
    });

    it('PUT /api/ai/config should update user provider and model preferences', async () => {
      const res = await request(app)
        .put('/api/ai/config')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          provider: 'groq',
          model: 'llama-3.3-70b-versatile',
          temperature: 0.1,
          useLocalRagFallback: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.config.provider).toBe('groq');
      expect(res.body.config.model).toBe('llama-3.3-70b-versatile');
      expect(res.body.config.temperature).toBe(0.1);
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

    it('POST /api/ai/copilot should respond cleanly using Local RAG fallback when offline', async () => {
      const res = await request(app)
        .post('/api/ai/copilot')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ message: 'What are my top expenses?' });

      expect(res.status).toBe(200);
      expect(res.body.answer).toBeDefined();
      expect(res.body.intent).toBeDefined();
    });

    it('POST /api/ai/copilot/stream should stream SSE events cleanly', async () => {
      const res = await request(app)
        .post('/api/ai/copilot/stream')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ message: 'What is my budget status?' });

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/event-stream');
      expect(res.text).toContain('data:');
    });

    it('GET /api/ai/health-score should return 0-100 composite index', async () => {
      const res = await request(app)
        .get('/api/ai/health-score')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.score).toBeGreaterThanOrEqual(0);
      expect(res.body.score).toBeLessThanOrEqual(100);
      expect(res.body.pillars).toBeDefined();
      expect(res.body.pillars.budgetAdherence).toBeDefined();
    });

    it('POST /api/ai/categorize should classify transactions accurately', async () => {
      const res = await request(app)
        .post('/api/ai/categorize')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Flight tickets to Delhi', amount: 4500, merchant: 'IndiGo' });

      expect(res.status).toBe(200);
      expect(res.body.category).toBe('Transportation');
    });
  });
});
