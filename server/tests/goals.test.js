const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const Goal = require('../src/models/Goal');

let mongoServer;
let userToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Goal User', email: 'goal@test.com', password: 'SecurePass1' });
  userToken = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Goal.deleteMany({});
});

describe('Goal Endpoints', () => {
  const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

  const validGoal = {
    name: 'Emergency Fund',
    targetAmount: 100000,
    currentAmount: 25000,
    targetDate: futureDate,
  };

  describe('POST /api/goals', () => {
    it('should create a goal with valid data', async () => {
      const res = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validGoal);

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Emergency Fund');
      expect(res.body.targetAmount).toBe(100000);
    });

    it('should reject goal with negative target amount', async () => {
      const res = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ ...validGoal, targetAmount: -500 });

      expect(res.statusCode).toBe(400);
    });

    it('should reject goal without target date', async () => {
      const res = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'No Date', targetAmount: 5000 });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/goals/:id', () => {
    it('should update goal progress', async () => {
      const created = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validGoal);

      const res = await request(app)
        .put(`/api/goals/${created.body._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ currentAmount: 50000 });

      expect(res.statusCode).toBe(200);
      expect(res.body.currentAmount).toBe(50000);
    });

    it('should auto-transition to achieved when target met', async () => {
      const created = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validGoal);

      const res = await request(app)
        .put(`/api/goals/${created.body._id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ currentAmount: 100000 });

      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('achieved');
    });
  });

  describe('DELETE /api/goals/:id', () => {
    it('should delete a goal', async () => {
      const created = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${userToken}`)
        .send(validGoal);

      const res = await request(app)
        .delete(`/api/goals/${created.body._id}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
    });
  });
});
