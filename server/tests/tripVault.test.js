const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const User = require('../src/models/User');
const { TripVault } = require('../src/models/TripVault');
const { FxService } = require('../src/services/fx/fxService');
const jwt = require('jsonwebtoken');

let mongoServer;
let token;
let user;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-12345';

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  user = await User.create({
    name: 'Global Nomad',
    email: 'nomad@test.com',
    passwordHash: 'hashed_password',
    currency: 'INR',
  });

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Feature 9: Multi-Currency FX Engine & Travel Trip Vault', () => {
  describe('FxService Unit Calculations', () => {
    it('converts currencies accurately via cross-rates', () => {
      // 100 USD to INR (@ 86.80)
      const usdToInr = FxService.convert({ amount: 100, fromCurrency: 'USD', toCurrency: 'INR' });
      expect(usdToInr.convertedAmount).toBe(8680);

      // 10,000 JPY to INR (@ 0.56)
      const jpyToInr = FxService.convert({ amount: 10000, fromCurrency: 'JPY', toCurrency: 'INR' });
      expect(jpyToInr.convertedAmount).toBe(5600);
    });

    it('returns all live FX rates relative to base currency', () => {
      const rates = FxService.getRates('INR');
      expect(rates.baseCurrency).toBe('INR');
      expect(rates.rates.USD).toBeDefined();
      expect(rates.rates.EUR).toBeDefined();
      expect(rates.rates.JPY).toBeDefined();
    });
  });

  describe('Trip Vault API Endpoints', () => {
    let tripId;

    it('POST /api/trips creates a new travel trip vault', async () => {
      const res = await request(app)
        .post('/api/trips')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Tokyo Spring Exploration 2026',
          destination: 'Tokyo, Japan',
          tripCurrency: 'JPY',
          budgetBaseCurrency: 200000,
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.trip.name).toBe('Tokyo Spring Exploration 2026');
      expect(res.body.trip.tripCurrency).toBe('JPY');
      tripId = res.body.trip._id;
    });

    it('POST /api/trips/:id/expenses logs multi-currency expense with auto FX conversion', async () => {
      const res = await request(app)
        .post(`/api/trips/${tripId}/expenses`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Shibuya Sky Observatory Tickets & Dinner',
          foreignAmount: 15000, // 15,000 JPY
          currency: 'JPY',
          category: 'Entertainment',
          syncToExpenses: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('success');
      expect(res.body.expense.foreignAmount).toBe(15000);
      expect(res.body.expense.currency).toBe('JPY');
      // 15,000 JPY * 0.56 = 8400 INR
      expect(res.body.expense.baseAmount).toBe(8400);
      expect(res.body.totalSpentBase).toBe(8400);
    });

    it('GET /api/trips/:id returns trip vault details and remaining budget', async () => {
      const res = await request(app)
        .get(`/api/trips/${tripId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.totalSpentBase).toBe(8400);
      expect(res.body.remainingBudgetBase).toBe(191600);
      expect(res.body.trip.expenses.length).toBe(1);
    });

    it('GET /api/fx/rates returns rate table', async () => {
      const res = await request(app)
        .get('/api/fx/rates?base=INR')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.rates).toBeDefined();
    });
  });
});
