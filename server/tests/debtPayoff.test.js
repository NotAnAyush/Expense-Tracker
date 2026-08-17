const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');

let mongoServer;
let app;
let token;
let userId;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-12345';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const user = await User.create({
    name: 'Ayush Kaushik',
    email: 'ayush@test.com',
    passwordHash: 'hashed_password',
  });
  userId = user._id;

  token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  app = require('../src/server');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Feature 5: Debt Snowball & Avalanche Payoff Strategy Engine API', () => {
  let creditCardId;
  let carLoanId;

  it('POST /api/debts - should create multiple debt liabilities', async () => {
    // 1. Credit Card: ₹50,000 @ 36% APR, Min ₹2,500/mo
    const res1 = await request(app)
      .post('/api/debts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'HDFC Regalia Credit Card',
        category: 'Credit Card',
        principalBalance: 50000,
        interestRate: 36,
        minimumPayment: 2500,
        dueDay: 15,
      });

    expect(res1.status).toBe(201);
    expect(res1.body.debt).toBeDefined();
    expect(res1.body.debt.status).toBe('ACTIVE');
    creditCardId = res1.body.debt._id;

    // 2. Personal Loan: ₹1,50,000 @ 14% APR, Min ₹4,000/mo
    const res2 = await request(app)
      .post('/api/debts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Axis Personal Loan',
        category: 'Personal Loan',
        principalBalance: 150000,
        interestRate: 14,
        minimumPayment: 4000,
        dueDay: 5,
      });

    expect(res2.status).toBe(201);
    carLoanId = res2.body.debt._id;
  });

  it('GET /api/debts - should list all user debts and summary totals', async () => {
    const res = await request(app)
      .get('/api/debts')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.debts.length).toBe(2);
    expect(res.body.totalBalance).toBe(200000);
    expect(res.body.totalMinimumMonthly).toBe(6500);
    expect(res.body.activeCount).toBe(2);
  });

  it('POST /api/debts/simulate - should compare Baseline, Snowball, and Avalanche with extra monthly cash', async () => {
    const res = await request(app)
      .post('/api/debts/simulate')
      .set('Authorization', `Bearer ${token}`)
      .send({
        extraMonthlyBudget: 5000, // +₹5,000/mo extra payment
      });

    expect(res.status).toBe(200);
    expect(res.body.baseline).toBeDefined();
    expect(res.body.snowball).toBeDefined();
    expect(res.body.avalanche).toBeDefined();

    // Snowball and Avalanche must both beat baseline in months and interest
    expect(res.body.snowball.months).toBeLessThan(res.body.baseline.months);
    expect(res.body.avalanche.months).toBeLessThan(res.body.baseline.months);
    expect(res.body.avalanche.totalInterest).toBeLessThanOrEqual(res.body.snowball.totalInterest);

    expect(res.body.comparison.interestSavedWithAvalanche).toBeGreaterThan(0);
    expect(res.body.comparison.monthsSavedWithAvalanche).toBeGreaterThan(0);
  });

  it('POST /api/debts/:id/pay - should log a payment and sync to personal expense ledger', async () => {
    const res = await request(app)
      .post(`/api/debts/${creditCardId}/pay`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        amount: 10000,
        notes: 'Monthly accelerated payoff',
        syncToExpenses: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.debt.principalBalance).toBe(40000);
    expect(res.body.expenseId).toBeDefined();
  });
});
