const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const User = require('../src/models/User');
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
    .send({ name: 'Income Tester', email: 'income@test.com', password: 'SecurePass1' });

  userToken = res.body.token;
  userId = res.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Income.deleteMany({});
});

describe('Income CRUD Endpoints', () => {
  const validIncome = {
    title: 'Software Developer Monthly Salary',
    amount: 120000,
    category: 'Salary',
    source: 'Tech Corp',
    isRecurring: true,
    recurringFrequency: 'monthly',
    tags: ['Primary', 'Job'],
  };

  describe('POST /api/income', () => {
    it('should create an income record with valid data', async () => {
      const res = await request(app)
        .post('/api/income')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validIncome);

      expect(res.statusCode).toBe(201);
      expect(res.body.title).toBe(validIncome.title);
      expect(res.body.amount).toBe(120000);
      expect(res.body.category).toBe('Salary');
      expect(res.body.source).toBe('Tech Corp');
    });

    it('should reject income with negative amount', async () => {
      const res = await request(app)
        .post('/api/income')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validIncome, amount: -100 });

      expect(res.statusCode).toBe(400);
    });

    it('should reject income with empty title', async () => {
      const res = await request(app)
        .post('/api/income')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validIncome, title: '' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/income', () => {
    beforeEach(async () => {
      await Income.create([
        { userId, title: 'Salary', amount: 100000, category: 'Salary', date: new Date('2026-08-01') },
        { userId, title: 'Freelance Design', amount: 25000, category: 'Freelance', date: new Date('2026-08-05') },
        { userId, title: 'Dividends', amount: 5000, category: 'Dividends', date: new Date('2026-08-10') },
      ]);
    });

    it('should list all incomes for the user', async () => {
      const res = await request(app)
        .get('/api/income')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.incomes.length).toBe(3);
      expect(res.body.total).toBe(3);
    });

    it('should filter by category', async () => {
      const res = await request(app)
        .get('/api/income?category=Freelance')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.incomes.length).toBe(1);
      expect(res.body.incomes[0].title).toBe('Freelance Design');
    });

    it('should calculate income summary correctly', async () => {
      const res = await request(app)
        .get('/api/income/summary')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.totalAmount).toBe(130000);
      expect(res.body.count).toBe(3);
    });
  });

  describe('PUT & DELETE /api/income/:id', () => {
    let incomeId;

    beforeEach(async () => {
      const inc = await Income.create({
        userId,
        title: 'Old Income',
        amount: 50000,
        category: 'Salary',
      });
      incomeId = inc._id.toString();
    });

    it('should update an existing income', async () => {
      const res = await request(app)
        .put(`/api/income/${incomeId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ amount: 60000, title: 'Updated Salary' });

      expect(res.statusCode).toBe(200);
      expect(res.body.amount).toBe(60000);
      expect(res.body.title).toBe('Updated Salary');
    });

    it('should delete an existing income', async () => {
      const res = await request(app)
        .delete(`/api/income/${incomeId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);

      const found = await Income.findById(incomeId);
      expect(found).toBeNull();
    });
  });
});
