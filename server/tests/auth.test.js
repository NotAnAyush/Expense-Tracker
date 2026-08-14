const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const User = require('../src/models/User');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await User.deleteMany({});
});

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'SecurePass1',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.token).toBeDefined();
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.name).toBe('Test User');
    });

    it('should reject registration with duplicate email', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'User 1', email: 'dupe@example.com', password: 'SecurePass1' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'User 2', email: 'dupe@example.com', password: 'SecurePass1' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject registration with missing required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'missing@example.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toBeDefined();
    });

    it('should reject weak password (no uppercase or number)', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'weak@example.com', password: 'weakpassword' });

      expect(res.statusCode).toBe(400);
    });

    it('should reject password shorter than 8 characters', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'short@example.com', password: 'Ab1' });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ name: 'Login User', email: 'login@example.com', password: 'SecurePass1' });
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'SecurePass1' });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'WrongPass1' });

      expect(res.statusCode).toBe(401);
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'noone@example.com', password: 'SecurePass1' });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Me User', email: 'me@example.com', password: 'SecurePass1' });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${reg.body.token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('me@example.com');
    });

    it('should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should reject request with malformed token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('JWT Refresh Token & Logout Lifecycle', () => {
    let authUser;

    beforeEach(async () => {
      const reg = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Refresh User', email: 'refresh@example.com', password: 'SecurePass1' });
      authUser = reg.body;
    });

    it('should issue both access token and refresh token on registration/login', () => {
      expect(authUser.token).toBeDefined();
      expect(authUser.refreshToken).toBeDefined();
    });

    it('should refresh access token with valid refresh token and rotate refresh token', async () => {
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: authUser.refreshToken });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.refreshToken).toBeDefined();
      expect(res.body.refreshToken).not.toBe(authUser.refreshToken); // Token rotated
    });

    it('should reject refresh with invalid or reused refresh token', async () => {
      // First refresh succeeds
      await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: authUser.refreshToken });

      // Reusing old rotated refresh token should fail with 401
      const res = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: authUser.refreshToken });

      expect(res.statusCode).toBe(401);
    });

    it('should invalidate refresh token on logout', async () => {
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken: authUser.refreshToken });

      expect(logoutRes.statusCode).toBe(200);

      // Attempting to refresh after logout should fail
      const refreshRes = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: authUser.refreshToken });

      expect(refreshRes.statusCode).toBe(401);
    });
  });
});
