const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const User = require('../src/models/User');

let mongoServer;
let userToken;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'OCR User', email: 'ocr@test.com', password: 'SecurePass1' });

  userToken = res.body.token;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Receipt Vision OCR Endpoint', () => {
  it('should reject requests without imageBase64 payload', async () => {
    const res = await request(app)
      .post('/api/ai/receipt-scan')
      .set('Authorization', `Bearer ${userToken}`)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.error.message).toContain('imageBase64');
  });

  it('should reject unauthenticated calls to receipt scan', async () => {
    const res = await request(app)
      .post('/api/ai/receipt-scan')
      .send({ imageBase64: 'fake-base-64' });

    expect(res.statusCode).toBe(401);
  });
});
