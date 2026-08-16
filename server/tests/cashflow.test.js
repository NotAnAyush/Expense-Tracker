const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const User = require('../src/models/User');
const Expense = require('../src/models/Expense');
const Income = require('../src/models/Income');
const AnalyticsService = require('../src/services/analytics/analyticsService');

let mongoServer;
let userToken;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'CashFlow User', email: 'cashflow@test.com', password: 'SecurePass1' });

  userToken = res.body.token;
  userId = res.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Expense.deleteMany({});
  await Income.deleteMany({});
});

describe('Deterministic Cash Flow & Savings Rate Engine', () => {
  it('should calculate accurate monthly net cash flow and savings rate %', async () => {
    const augustDate = new Date('2026-08-15T12:00:00Z');

    // Incomes: Total = 100,000 + 20,000 = 120,000
    await Income.create([
      { userId, title: 'Salary', amount: 100000, category: 'Salary', date: augustDate },
      { userId, title: 'Consulting', amount: 20000, category: 'Freelance', date: augustDate },
    ]);

    // Expenses: Total = 30,000 + 10,000 + 8,000 = 48,000
    await Expense.create([
      { userId, title: 'Rent', amount: 30000, category: 'Housing & Utilities', date: augustDate },
      { userId, title: 'Groceries', amount: 10000, category: 'Food & Dining', date: augustDate },
      { userId, title: 'Fuel', amount: 8000, category: 'Transportation', date: augustDate },
    ]);

    const summary = await AnalyticsService.getCashFlowSummary(userId, 2026, 7); // August is index 7

    expect(summary.totalIncome).toBe(120000);
    expect(summary.totalExpense).toBe(48000);
    expect(summary.netSavings).toBe(72000); // 120,000 - 48,000 = 72,000
    expect(summary.savingsRate).toBe(60.0); // (72,000 / 120,000) * 100 = 60.0%
    expect(summary.status).toBe('SURPLUS');
    expect(summary.trend.length).toBe(6);
  });

  it('should handle zero income with expenses gracefully as DEFICIT', async () => {
    const augustDate = new Date('2026-08-15T12:00:00Z');

    await Expense.create([
      { userId, title: 'Dinner', amount: 5000, category: 'Food & Dining', date: augustDate },
    ]);

    const summary = await AnalyticsService.getCashFlowSummary(userId, 2026, 7);

    expect(summary.totalIncome).toBe(0);
    expect(summary.totalExpense).toBe(5000);
    expect(summary.netSavings).toBe(-5000);
    expect(summary.savingsRate).toBe(0);
    expect(summary.status).toBe('DEFICIT');
  });

  it('should expose cashflow via API endpoint /api/analytics/cashflow', async () => {
    const res = await request(app)
      .get('/api/analytics/cashflow?year=2026&month=8')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalIncome');
    expect(res.body).toHaveProperty('totalExpense');
    expect(res.body).toHaveProperty('netSavings');
    expect(res.body).toHaveProperty('savingsRate');
    expect(res.body).toHaveProperty('trend');
  });
});
