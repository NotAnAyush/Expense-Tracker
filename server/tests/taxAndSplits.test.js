const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const User = require('../src/models/User');
const Expense = require('../src/models/Expense');

let mongoServer;
let userToken;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Tax User', email: 'tax@test.com', password: 'SecurePass1' });

  userToken = res.body.token;
  userId = res.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Expense.deleteMany({});
});

describe('Split Transactions & Tax Deduction Preparation', () => {
  it('should create an expense with category line-item splits', async () => {
    const splitExpense = {
      title: 'Hypermarket Big Basket',
      amount: 6000,
      category: 'Shopping',
      merchant: 'BigBasket',
      splits: [
        { category: 'Food & Dining', amount: 4000, note: 'Groceries & Fruits' },
        { category: 'Housing & Utilities', amount: 2000, note: 'Kitchen Cleaner & Utensils' },
      ],
      tags: ['Family', 'MonthlyGrocery'],
    };

    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userToken}`)
      .send(splitExpense);

    expect(res.statusCode).toBe(201);
    expect(res.body.splits.length).toBe(2);
    expect(res.body.splits[0].category).toBe('Food & Dining');
    expect(res.body.splits[0].amount).toBe(4000);
    expect(res.body.splits[1].category).toBe('Housing & Utilities');
    expect(res.body.splits[1].amount).toBe(2000);
  });

  it('should support tax-deductible tags and tax sections', async () => {
    const taxExpense = {
      title: 'HDFC Life Insurance Premium',
      amount: 45000,
      category: 'Housing & Utilities',
      isTaxDeductible: true,
      taxSection: '80C',
      reimbursementStatus: 'none',
      tags: ['80C', 'Insurance', 'TaxDeductible'],
    };

    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userToken}`)
      .send(taxExpense);

    expect(res.statusCode).toBe(201);
    expect(res.body.isTaxDeductible).toBe(true);
    expect(res.body.taxSection).toBe('80C');
  });

  it('should export formatted tax summary JSON and CSV', async () => {
    const currentYear = new Date().getFullYear();

    await Expense.create([
      {
        userId,
        title: 'ELSS Mutual Fund SIP',
        amount: 50000,
        category: 'Housing & Utilities',
        isTaxDeductible: true,
        taxSection: '80C',
        date: new Date(`${currentYear}-03-10`),
      },
      {
        userId,
        title: 'Star Health Family Insurance',
        amount: 22000,
        category: 'Health & Medical',
        isTaxDeductible: true,
        taxSection: '80D',
        date: new Date(`${currentYear}-05-12`),
      },
    ]);

    const resJson = await request(app)
      .get(`/api/export/tax-summary?year=${currentYear}&format=json`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(resJson.statusCode).toBe(200);
    expect(resJson.body.totalDeductible).toBe(72000);
    expect(resJson.body.itemCount).toBe(2);
    expect(resJson.body.sections['80C'].total).toBe(50000);
    expect(resJson.body.sections['80D'].total).toBe(22000);

    const resCsv = await request(app)
      .get(`/api/export/tax-summary?year=${currentYear}&format=csv`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(resCsv.statusCode).toBe(200);
    expect(resCsv.text).toContain('Tax Deduction Summary');
    expect(resCsv.text).toContain('80C');
    expect(resCsv.text).toContain('80D');
  });
});
