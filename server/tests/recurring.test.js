const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const RecurringExpense = require('../src/models/RecurringExpense');
const Expense = require('../src/models/Expense');

let mongoServer;
let userToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Recurring User', email: 'recurring@test.com', password: 'SecurePass1' });
  userToken = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await RecurringExpense.deleteMany({});
  await Expense.deleteMany({});
});

describe('Recurring Expense Endpoints', () => {
  const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const validRecurring = {
    title: 'Netflix 4K',
    amount: 649,
    category: 'Subscriptions',
    frequency: 'monthly',
    nextOccurrence: futureDate,
    active: true,
  };

  describe('POST /api/recurring', () => {
    it('should create a recurring expense', async () => {
      const res = await request(app)
        .post('/api/recurring')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validRecurring);

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Netflix 4K');
      expect(res.body.amount).toBe(649);
      expect(res.body.frequency).toBe('monthly');
    });

    it('should reject recurring with negative amount', async () => {
      const res = await request(app)
        .post('/api/recurring')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validRecurring, amount: -50 });

      expect(res.statusCode).toBe(400);
    });

    it('should reject recurring without next occurrence', async () => {
      const res = await request(app)
        .post('/api/recurring')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Test', amount: 100, category: 'Test' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/recurring/:id/pay', () => {
    it('should record payment and advance next occurrence', async () => {
      const created = await request(app)
        .post('/api/recurring')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validRecurring);

      const originalNext = new Date(created.body.nextOccurrence);

      const res = await request(app)
        .post(`/api/recurring/${created.body._id}/pay`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(201);
      expect(res.body.expense).toBeDefined();
      expect(res.body.expense.amount).toBe(649);
      expect(res.body.expense.title).toBe('Netflix 4K');

      // Verify nextOccurrence was advanced by 1 month
      const newNext = new Date(res.body.subscription.nextOccurrence);
      expect(newNext.getMonth()).toBe((originalNext.getMonth() + 1) % 12);
    });
  });

  describe('GET /api/recurring/:id/history', () => {
    it('should return subscription history', async () => {
      const created = await request(app)
        .post('/api/recurring')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validRecurring);

      // Record a payment to create history
      await request(app)
        .post(`/api/recurring/${created.body._id}/pay`)
        .set('Authorization', `Bearer ${userToken}`);

      const res = await request(app)
        .get(`/api/recurring/${created.body._id}/history`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.paymentCount).toBeGreaterThanOrEqual(1);
      expect(res.body.totalSpentAllTime).toBeGreaterThanOrEqual(649);
    });
  });

  describe('PUT /api/recurring/:id', () => {
    it('should toggle active status', async () => {
      const created = await request(app)
        .post('/api/recurring')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validRecurring);

      const res = await request(app)
        .put(`/api/recurring/${created.body._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ active: false });

      expect(res.statusCode).toBe(200);
      expect(res.body.active).toBe(false);
    });
  });

  describe('DELETE /api/recurring/:id', () => {
    it('should delete a recurring expense', async () => {
      const created = await request(app)
        .post('/api/recurring')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validRecurring);

      const res = await request(app)
        .delete(`/api/recurring/${created.body._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
