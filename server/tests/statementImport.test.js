const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const Expense = require('../src/models/Expense');
const Income = require('../src/models/Income');

let mongoServer;
let userToken;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Import User', email: 'import@test.com', password: 'Password123' });

  userToken = res.body.token;
  userId = res.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Bank Statement Ingestion Engine (/api/import)', () => {
  const sampleCsv = `Date,Description,Withdrawal (Debit),Deposit (Credit),Balance
2026-03-01,Swiggy Order #9281,450.00,,12400.00
2026-03-02,Uber Ride Airport,890.50,,11509.50
2026-03-05,TechCorp Monthly Salary,,95000.00,106509.50
2026-03-10,Netflix Subscription,649.00,,105860.50
2026-03-12,Amazon Retail Purchase,2499.00,,103361.50`;

  it('should parse CSV statement and return staged preview with auto-categorization', async () => {
    const res = await request(app)
      .post('/api/import/bank-statement/preview')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ csvContent: sampleCsv });

    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.totalRows).toBe(5);
    expect(res.body.parsedCount).toBe(5);
    expect(res.body.duplicateCount).toBe(0);

    const txns = res.body.transactions;
    expect(txns[0].category).toBe('Food & Dining');
    expect(txns[0].type).toBe('expense');
    expect(txns[0].amount).toBe(450);

    expect(txns[2].category).toBe('Salary');
    expect(txns[2].type).toBe('income');
    expect(txns[2].amount).toBe(95000);
  });

  it('should commit staged transactions atomically to Expense and Income collections', async () => {
    const previewRes = await request(app)
      .post('/api/import/bank-statement/preview')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ csvContent: sampleCsv });

    const staged = previewRes.body.transactions;

    const commitRes = await request(app)
      .post('/api/import/bank-statement/commit')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ transactions: staged });

    expect(commitRes.statusCode).toBe(200);
    expect(commitRes.body.totalImported).toBe(5);
    expect(commitRes.body.importedExpenses).toBe(4);
    expect(commitRes.body.importedIncomes).toBe(1);

    // Verify in database
    const expenses = await Expense.find({ userId });
    expect(expenses.length).toBe(4);

    const incomes = await Income.find({ userId });
    expect(incomes.length).toBe(1);
    expect(incomes[0].amount).toBe(95000);
  });

  it('should flag duplicates if the same statement is imported again', async () => {
    const res = await request(app)
      .post('/api/import/bank-statement/preview')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ csvContent: sampleCsv });

    expect(res.statusCode).toBe(200);
    expect(res.body.duplicateCount).toBeGreaterThan(0);
    const duplicates = res.body.transactions.filter(t => t.isDuplicate);
    expect(duplicates.length).toBe(5);
  });
});
