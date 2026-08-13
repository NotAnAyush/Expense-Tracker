const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const User = require('../src/models/User');
const Expense = require('../src/models/Expense');
const Budget = require('../src/models/Budget');

let mongoServer;
let userToken;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Register test user
  const res = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: 'test@antigravity.finance',
      password: 'Password123!',
      preferredCurrency: '₹',
    });

  userToken = res.body.token;
  userId = res.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Financial Source of Truth & Analytics Engine', () => {
  it('should create and retrieve expenses deterministically', async () => {
    const newExpense = {
      title: 'Weekly Grocery',
      amount: 2500,
      category: 'Food & Dining',
      date: new Date(),
      merchant: 'Supermarket',
    };

    const postRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userToken}`)
      .send(newExpense);

    expect(postRes.statusCode).toBe(201);
    expect(postRes.body.title).toBe('Weekly Grocery');
    expect(postRes.body.amount).toBe(2500);

    const getRes = await request(app)
      .get('/api/expenses')
      .set('Authorization', `Bearer ${userToken}`);

    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.expenses.length).toBe(1);
  });

  it('should compute deterministic analytics accurately', async () => {
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
    expect(aiRes.body.facts.totalSpend).toBe(2500);
  });

  it('should answer natural language query via Finance Copilot tool router', async () => {
    const copilotRes = await request(app)
      .post('/api/ai/copilot')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ message: 'How much did I spend on food this month?' });

    expect(copilotRes.statusCode).toBe(200);
    expect(copilotRes.body.intent).toBe('CATEGORY_ANALYSIS');
    expect(copilotRes.body.answer).toBeDefined();
  });
});
