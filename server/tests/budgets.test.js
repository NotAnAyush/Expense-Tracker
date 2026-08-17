const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const Budget = require('../src/models/Budget');

let mongoServer;
let userToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Budget User', email: 'budget@test.com', password: 'SecurePass1' });
  userToken = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Budget.deleteMany({});
});

describe('Budget Endpoints', () => {
  const validBudget = {
    categoryId: 'Food & Dining',
    amount: 12000,
    period: 'monthly',
    alertThreshold: 0.8,
  };

  describe('POST /api/budgets', () => {
    it('should create a budget with valid data', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validBudget);

      expect(res.statusCode).toBe(201);
      expect(res.body.categoryId).toBe('Food & Dining');
      expect(res.body.amount).toBe(12000);
    });

    it('should upsert budget for same category', async () => {
      await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validBudget);

      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validBudget, amount: 15000 });

      expect(res.statusCode).toBe(200);
      expect(res.body.amount).toBe(15000);
    });

    it('should reject budget with negative amount', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validBudget, amount: -100 });

      expect(res.statusCode).toBe(400);
    });

    it('should reject budget with threshold > 1', async () => {
      const res = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validBudget, alertThreshold: 1.5 });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/budgets', () => {
    it('should list all budgets', async () => {
      await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validBudget);

      const res = await request(app)
        .get('/api/budgets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(1);
    });
  });

  describe('DELETE /api/budgets/:id', () => {
    it('should delete a budget', async () => {
      const created = await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validBudget);

      const res = await request(app)
        .delete(`/api/budgets/${created.body._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
