const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const User = require('../src/models/User');
const RefreshToken = require('../src/models/RefreshToken');
const Expense = require('../src/models/Expense');

let mongoServer;
let token;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await User.deleteMany({});
  await RefreshToken.deleteMany({});
  await Expense.deleteMany({});

  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Ayush Kaushik',
      email: 'ayush@example.com',
      password: 'SecurePass1',
    });

  token = registerRes.body.token;
  userId = registerRes.body._id;
});

describe('User Profile & Account Endpoints', () => {
  describe('GET /api/users/profile', () => {
    it('should retrieve full user profile with stats', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.name).toBe('Ayush Kaushik');
      expect(res.body.user.email).toBe('ayush@example.com');
      expect(res.body.user.passwordHash).toBeUndefined();
      expect(res.body.stats).toBeDefined();
      expect(res.body.stats.sovereigntyTier).toBe('Diamond Sovereign VIP');
    });

    it('should reject unauthorized profile request without token', async () => {
      const res = await request(app).get('/api/users/profile');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile details and financial preferences', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Ayush Kaushik VIP',
          phone: '+919876543210',
          upiId: 'ayush@okhdfcbank',
          occupation: 'Principal Systems Architect',
          preferredCurrency: '$',
          monthlyIncomeEstimate: 250000,
          targetSavingsRate: 50,
          defaultPaymentMethod: 'UPI',
          taxRegime: 'new_regime_in',
          notificationPreferences: {
            budgetAlerts: true,
            anomalyAlerts: true,
            weeklySummary: false,
          },
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user.name).toBe('Ayush Kaushik VIP');
      expect(res.body.user.upiId).toBe('ayush@okhdfcbank');
      expect(res.body.user.preferredCurrency).toBe('$');
      expect(res.body.user.monthlyIncomeEstimate).toBe(250000);
      expect(res.body.user.targetSavingsRate).toBe(50);
      expect(res.body.user.notificationPreferences.weeklySummary).toBe(false);
    });

    it('should reject invalid UPI format', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          upiId: 'invalid-upi-without-at-sign',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/users/password', () => {
    it('should change password successfully with valid credentials', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'SecurePass1',
          newPassword: 'BrandNewPassword2',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('Password changed successfully');

      // Verify login with new password works
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ayush@example.com',
          password: 'BrandNewPassword2',
        });

      expect(loginRes.statusCode).toBe(200);
      expect(loginRes.body.token).toBeDefined();
    });

    it('should reject password change with incorrect current password', async () => {
      const res = await request(app)
        .put('/api/users/password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'WrongPassword99',
          newPassword: 'BrandNewPassword2',
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('Sessions Management', () => {
    it('should list and revoke active sessions', async () => {
      // Create test refresh tokens
      await RefreshToken.create({
        userId,
        token: 'token1234567890abcdef1234567890abcdef',
        expiresAt: new Date(Date.now() + 86400000),
      });

      const listRes = await request(app)
        .get('/api/users/sessions')
        .set('Authorization', `Bearer ${token}`);

      expect(listRes.statusCode).toBe(200);
      expect(listRes.body.sessions).toBeInstanceOf(Array);
      expect(listRes.body.sessions.length).toBeGreaterThanOrEqual(1);

      const sessionId = listRes.body.sessions[0].id;
      const revokeRes = await request(app)
        .delete(`/api/users/sessions/${sessionId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(revokeRes.statusCode).toBe(200);
    });
  });
});
