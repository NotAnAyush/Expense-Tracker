const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  TooManyRequestsError,
} = require('../src/utils/errors');
const ApiResponse = require('../src/utils/response');
const asyncHandler = require('../src/utils/asyncHandler');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Node.js Backend Patterns & Utilities', () => {
  describe('Custom Error Classes', () => {
    it('should create ValidationError with 400 status and details', () => {
      const err = new ValidationError('Invalid email', [{ field: 'email', message: 'Must be valid' }]);
      expect(err.statusCode).toBe(400);
      expect(err.errorCode).toBe('VALIDATION_FAILED');
      expect(err.isOperational).toBe(true);
      expect(err.toJSON().error.details[0].field).toBe('email');
    });

    it('should create NotFoundError with 404 status', () => {
      const err = new NotFoundError('Expense not found');
      expect(err.statusCode).toBe(404);
      expect(err.errorCode).toBe('RESOURCE_NOT_FOUND');
    });

    it('should create UnauthorizedError with 401 status', () => {
      const err = new UnauthorizedError('Token expired');
      expect(err.statusCode).toBe(401);
      expect(err.errorCode).toBe('AUTH_UNAUTHORIZED');
    });

    it('should create ForbiddenError with 403 status', () => {
      const err = new ForbiddenError('Access denied');
      expect(err.statusCode).toBe(403);
      expect(err.errorCode).toBe('AUTH_FORBIDDEN');
    });

    it('should create ConflictError with 409 status', () => {
      const err = new ConflictError('Email already exists');
      expect(err.statusCode).toBe(409);
      expect(err.errorCode).toBe('RESOURCE_CONFLICT');
    });

    it('should create TooManyRequestsError with 429 status', () => {
      const err = new TooManyRequestsError('Rate limit exceeded');
      expect(err.statusCode).toBe(429);
      expect(err.errorCode).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('ApiResponse Utility', () => {
    let mockRes;

    beforeEach(() => {
      mockRes = {
        statusCode: 200,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(data) {
          this.body = data;
          return this;
        },
      };
    });

    it('should format success responses', () => {
      ApiResponse.success(mockRes, { user: 'Ayush' }, 'Operation succeeded', 201);
      expect(mockRes.statusCode).toBe(201);
      expect(mockRes.body.status).toBe('success');
      expect(mockRes.body.message).toBe('Operation succeeded');
      expect(mockRes.body.user).toBe('Ayush');
    });

    it('should format error responses', () => {
      ApiResponse.error(mockRes, 'Something went wrong', 400, [{ field: 'title' }]);
      expect(mockRes.statusCode).toBe(400);
      expect(mockRes.body.status).toBe('error');
      expect(mockRes.body.message).toBe('Something went wrong');
      expect(mockRes.body.errors[0].field).toBe('title');
    });

    it('should format paginated responses', () => {
      ApiResponse.paginated(mockRes, ['item1', 'item2'], 1, 10, 25);
      expect(mockRes.statusCode).toBe(200);
      expect(mockRes.body.status).toBe('success');
      expect(mockRes.body.data).toEqual(['item1', 'item2']);
      expect(mockRes.body.pagination.total).toBe(25);
      expect(mockRes.body.pagination.pages).toBe(3);
    });
  });

  describe('asyncHandler Wrapper', () => {
    it('should call next with error when wrapped promise rejects', async () => {
      const failingFn = asyncHandler(async () => {
        throw new Error('Async boom');
      });

      const next = jest.fn();
      await failingFn({}, {}, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('Health Monitoring Endpoints', () => {
    it('should return system diagnostics on GET /health', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.system).toContain('Personal Finance Intelligence Platform');
      expect(res.body.version).toBe('2.2.0');
      expect(res.body.uptimeSeconds).toBeDefined();
      expect(res.body.memoryUsage).toBeDefined();
      expect(res.body.features.requestLogging).toBe(true);
    });

    it('should return system diagnostics on GET /api/health', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.system).toContain('Personal Finance Intelligence Platform');
      expect(res.body.database).toBeDefined();
    });
  });
});
