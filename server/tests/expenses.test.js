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
    .send({ name: 'Expense User', email: 'expense@test.com', password: 'SecurePass1' });

  userToken = res.body.token;
  userId = res.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Expense.deleteMany({});
});

describe('Expense CRUD Endpoints', () => {
  const validExpense = {
    title: 'Test Grocery',
    amount: 2500,
    category: 'Food & Dining',
    merchant: 'Supermarket',
    paymentMethod: 'UPI',
  };

  describe('POST /api/expenses', () => {
    it('should create an expense with valid data', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validExpense);

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe('Test Grocery');
      expect(res.body.amount).toBe(2500);
      expect(res.body.category).toBe('Food & Dining');
    });

    it('should reject expense with negative amount', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validExpense, amount: -500 });

      expect(res.statusCode).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_FAILED');
    });

    it('should reject expense without title', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 100, category: 'Test' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject expense without category', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'No Cat', amount: 100 });

      expect(res.statusCode).toBe(400);
    });

    it('should reject expense with invalid payment method', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validExpense, paymentMethod: 'Bitcoin' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .send(validExpense);

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/expenses', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validExpense);

      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ title: 'Taxi Ride', amount: 500, category: 'Transportation' });
    });

    it('should list all expenses for the user', async () => {
      const res = await request(app)
        .get('/api/expenses')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.expenses.length).toBe(2);
      expect(res.body.total).toBe(2);
    });

    it('should filter expenses by category', async () => {
      const res = await request(app)
        .get('/api/expenses?category=Transportation')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.expenses.length).toBe(1);
      expect(res.body.expenses[0].category).toBe('Transportation');
    });

    it('should search expenses by title', async () => {
      const res = await request(app)
        .get('/api/expenses?search=Taxi')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.expenses.length).toBe(1);
    });

    it('should paginate results', async () => {
      const res = await request(app)
        .get('/api/expenses?page=1&limit=1')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.expenses.length).toBe(1);
      expect(res.body.pages).toBe(2);
    });
  });

  describe('PUT /api/expenses/:id', () => {
    it('should update an expense', async () => {
      const created = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validExpense);

      const res = await request(app)
        .put(`/api/expenses/${created.body._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 3000 });

      expect(res.statusCode).toBe(200);
      expect(res.body.amount).toBe(3000);
    });

    it('should return 404 for non-existent expense', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/expenses/${fakeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 100 });

      expect(res.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/expenses/:id', () => {
    it('should delete an expense', async () => {
      const created = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validExpense);

      const res = await request(app)
        .delete(`/api/expenses/${created.body._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('removed');
    });
  });
});

describe('Cross-User Authorization', () => {
  it('should NOT allow user A to access user B expenses', async () => {
    // Create expense as main user
    const created = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ title: 'Private', amount: 100, category: 'Private' });

    // Register second user
    const user2 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'User B', email: 'userb@test.com', password: 'SecurePass1' });

    // Try to access user A's expense as user B
    const res = await request(app)
      .get(`/api/expenses/${created.body._id}`)
      .set('Authorization', `Bearer ${user2.body.token}`);

    expect(res.statusCode).toBe(404);
  });
});
