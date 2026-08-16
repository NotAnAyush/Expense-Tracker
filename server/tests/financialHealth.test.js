const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const Expense = require('../src/models/Expense');
const Income = require('../src/models/Income');
const Budget = require('../src/models/Budget');
const Goal = require('../src/models/Goal');

let mongoServer;
let userToken;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'FHI User', email: 'fhi@test.com', password: 'Password123' });

  userToken = res.body.token;
  userId = res.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Deterministic Financial Health Index (0-100 FHI)', () => {
  it('should calculate FHI accurately with 5 deterministic pillars and actionable levers', async () => {
    // 1. Seed Income: ₹100,000
    await Income.create({
      userId,
      title: 'Primary Salary',
      amount: 100000,
      category: 'Salary',
      date: new Date(),
    });

    // 2. Seed Expenses: ₹40,000 (Savings rate = 60%)
    await Expense.create([
      { userId, title: 'Groceries', amount: 15000, category: 'Food & Dining', paymentMethod: 'UPI', date: new Date() },
      { userId, title: 'Rent & Electricity', amount: 25000, category: 'Housing & Utilities', paymentMethod: 'Bank Transfer', date: new Date() },
    ]);

    // 3. Seed Budget: Food & Dining budget ₹20,000 (spent 15,000 -> 75% -> Under budget)
    await Budget.create({
      userId,
      categoryId: 'Food & Dining',
      amount: 20000,
      period: 'monthly',
    });

    // 4. Seed Goal: Target ₹100,000, Current ₹60,000 (60% Progress)
    await Goal.create({
      userId,
      name: 'Emergency Fund',
      targetAmount: 100000,
      currentAmount: 60000,
      targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
      isCompleted: false,
    });

    const res = await request(app)
      .get('/api/analytics/financial-health')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.score).toBeGreaterThanOrEqual(0);
    expect(res.body.score).toBeLessThanOrEqual(100);
    expect(['Novice', 'Builder', 'Optimized', 'Sovereign']).toContain(res.body.tier);

    // Verify 5 pillars exist
    const pillars = res.body.pillars;
    expect(pillars.savingsRate).toBeDefined();
    expect(pillars.savingsRate.max).toBe(25);
    expect(pillars.savingsRate.score).toBe(25); // Savings rate 60% >= 30% threshold -> full 25 pts

    expect(pillars.budgetAdherence).toBeDefined();
    expect(pillars.budgetAdherence.max).toBe(25);

    expect(pillars.spendingVelocity).toBeDefined();
    expect(pillars.spendingVelocity.max).toBe(20);

    expect(pillars.emergencyRunway).toBeDefined();
    expect(pillars.emergencyRunway.max).toBe(15);

    expect(pillars.goalTrajectory).toBeDefined();
    expect(pillars.goalTrajectory.max).toBe(15);

    expect(Array.isArray(res.body.actionableLevers)).toBe(true);
  });

  it('should include financialHealth in /api/analytics overview payload', async () => {
    const res = await request(app)
      .get('/api/analytics')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.financialHealth).toBeDefined();
    expect(res.body.financialHealth.score).toBeDefined();
    expect(res.body.financialHealth.tier).toBeDefined();
  });
});
