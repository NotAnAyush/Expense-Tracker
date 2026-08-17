const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const Expense = require('../src/models/Expense');
const AuditLog = require('../src/models/AuditLog');

let mongoServer;
let userToken;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Export User', email: 'export@test.com', password: 'SecurePass1' });
  userToken = res.body.token;
  userId = res.body._id;

  // Create sample expenses for testing export
  await request(app)
    .post('/api/expenses')
    .set('Authorization', `Bearer ${userToken}`)
    .send({ title: 'Coffee', amount: 250, category: 'Food & Dining', merchant: 'Starbucks' });

  await request(app)
    .post('/api/expenses')
    .set('Authorization', `Bearer ${userToken}`)
    .send({ title: 'Train Ticket', amount: 1500, category: 'Transportation', merchant: 'Metro' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Data Export API (/api/export)', () => {
  it('should export expenses as CSV by default', async () => {
    const res = await request(app)
      .get('/api/export/expenses')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.headers['content-disposition']).toContain('attachment; filename=');
    expect(res.text).toContain('Date,Title,Amount,Category,Merchant,Payment Method,Note,Tags');
    expect(res.text).toContain('Coffee');
    expect(res.text).toContain('Train Ticket');
  });

  it('should export expenses as JSON when format=json', async () => {
    const res = await request(app)
      .get('/api/export/expenses?format=json')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(2);
    expect(res.body.expenses).toHaveLength(2);
    expect(res.body.expenses[0].title).toBeDefined();
  });

  it('should filter export by category', async () => {
    const res = await request(app)
      .get('/api/export/expenses?format=json&category=Transportation')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.expenses[0].category).toBe('Transportation');
  });
});

describe('Audit Trail API (/api/audit)', () => {
  it('should retrieve audit trail for user actions', async () => {
    const res = await request(app)
      .get('/api/audit')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.logs).toBeDefined();
    expect(Array.isArray(res.body.logs)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it('should filter audit logs by action or resourceType', async () => {
    const res = await request(app)
      .get('/api/audit?resourceType=expense')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.logs.every(log => log.resourceType === 'expense')).toBe(true);
  });
});

describe('Idempotency Header Handling', () => {
  it('should return cached response when same Idempotency-Key is sent twice', async () => {
    const idempotencyKey = 'unique-key-12345';
    const payload = { title: 'Idempotent Item', amount: 800, category: 'Shopping' };

    const res1 = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);

    expect(res1.statusCode).toBe(201);
    const firstId = res1.body._id;

    // Send identical request with same key
    const res2 = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Idempotency-Key', idempotencyKey)
      .send(payload);

    expect(res2.statusCode).toBe(201);
    expect(res2.body._id).toBe(firstId);

    // Verify only 1 expense was actually created in DB for this payload
    const matchingExpenses = await Expense.find({ title: 'Idempotent Item' });
    expect(matchingExpenses.length).toBe(1);
  });
});
