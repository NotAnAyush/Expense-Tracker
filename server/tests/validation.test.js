const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');

let mongoServer;
let userToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Validation User', email: 'validate@test.com', password: 'SecurePass1' });
  userToken = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Input Validation Layer', () => {
  describe('Expense Validation', () => {
    it('should reject expense with amount = 0', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Zero', amount: 0, category: 'Test' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('should reject expense with title exceeding 200 chars', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'A'.repeat(201), amount: 100, category: 'Test' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject expense with > 10 tags', async () => {
      const tags = Array.from({ length: 11 }, (_, i) => `tag${i}`);
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Tagged', amount: 100, category: 'Test', tags });

      expect(res.statusCode).toBe(400);
    });

    it('should strip unknown fields from request body', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          title: 'Clean',
          amount: 100,
          category: 'Test',
          maliciousField: '<script>alert("xss")</script>',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.maliciousField).toBeUndefined();
    });

    it('should return structured error with field details', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: -5 });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.details).toBeDefined();
      expect(Array.isArray(res.body.error.details)).toBe(true);
      expect(res.body.error.details.length).toBeGreaterThan(0);
      expect(res.body.error.details[0].field).toBeDefined();
      expect(res.body.error.details[0].message).toBeDefined();
    });
  });

  describe('Auth Validation', () => {
    it('should reject registration with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'not-an-email', password: 'SecurePass1' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject registration with short password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'short@test.com', password: 'Ab1' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Budget Validation', () => {
    it('should reject budget with amount = 0', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ categoryId: 'Food', amount: 0 });

      expect(res.statusCode).toBe(400);
    });

    it('should reject budget with invalid period', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ categoryId: 'Food', amount: 1000, period: 'quarterly' });

      expect(res.statusCode).toBe(400);
    });
  });
});
