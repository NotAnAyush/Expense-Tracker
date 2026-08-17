const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const SecretVault = require('../src/models/SecretVault');
const AuditLog = require('../src/models/AuditLog');

let mongoServer;
let userToken;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Vault Test User', email: 'vault@test.com', password: 'SecurePass1' });

  userToken = res.body.token;
  userId = res.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await SecretVault.deleteMany({});
  await AuditLog.deleteMany({});
});

describe('Confidential Secret Vault Endpoints (/api/vault)', () => {
  describe('POST /api/vault/secrets', () => {
    it('should securely encrypt and store an AI API key without exposing plaintext in response', async () => {
      const res = await request(app)
        .post('/api/vault/secrets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Production Gemini 3.7 Key',
          secretValue: 'AIzaSyA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P',
          provider: 'gemini',
          category: 'ai_api_key',
          isDefault: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Production Gemini 3.7 Key');
      expect(res.body.data.maskedValue.startsWith('AIzaSy')).toBe(true);
      expect(res.body.data.maskedValue).not.toContain('A1B2C3D4E5F6');
      expect(res.body.data.encryptedValue).toBeUndefined(); // Never returned to client

      // Verify Audit Log
      const audit = await AuditLog.findOne({ userId, action: 'VAULT_SECRET_CREATED' });
      expect(audit).not.toBeNull();
      expect(audit.resourceType).toBe('vault');
    });

    it('should reject creation if secret name or secret value is missing', async () => {
      const res = await request(app)
        .post('/api/vault/secrets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: '',
          secretValue: '',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/vault/secrets & /api/vault/secrets/:id', () => {
    it('should list all stored secrets in masked format and never expose ciphertext or plaintext', async () => {
      // Create 2 secrets
      await request(app)
        .post('/api/vault/secrets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Gemini Primary',
          secretValue: 'AIzaSyTest1234567890abcdef',
          provider: 'gemini',
        });

      await request(app)
        .post('/api/vault/secrets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'OpenAI Secondary',
          secretValue: 'sk-proj-test99998888777766665555',
          provider: 'openai',
        });

      const res = await request(app)
        .get('/api/vault/secrets')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
      expect(res.body.data[0].maskedValue).toBeDefined();
      expect(res.body.data[0].encryptedValue).toBeUndefined();

      // Test single get
      const firstId = res.body.data[0].id;
      const singleRes = await request(app)
        .get(`/api/vault/secrets/${firstId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(singleRes.status).toBe(200);
      expect(singleRes.body.data.id).toBe(firstId);
    });
  });

  describe('PUT /api/vault/secrets/:id/rotate', () => {
    it('should rotate and re-encrypt a secret with a new credential value', async () => {
      const createRes = await request(app)
        .post('/api/vault/secrets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Groq Cloud Key',
          secretValue: 'gsk_oldKey12345678901234567890',
          provider: 'groq',
        });

      const secretId = createRes.body.data.id;

      const rotateRes = await request(app)
        .put(`/api/vault/secrets/${secretId}/rotate`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          newSecretValue: 'gsk_newKey99999999999999999999',
          name: 'Groq Cloud Key (Rotated)',
        });

      expect(rotateRes.status).toBe(200);
      expect(rotateRes.body.data.name).toBe('Groq Cloud Key (Rotated)');
      expect(rotateRes.body.data.maskedValue.endsWith('9999')).toBe(true);

      // Verify Audit Log
      const audit = await AuditLog.findOne({ userId, action: 'VAULT_SECRET_ROTATED' });
      expect(audit).not.toBeNull();
    });
  });

  describe('POST /api/vault/secrets/:id/test (Connectivity Ping)', () => {
    it('should ping provider format and return latency metrics without exposing key', async () => {
      const createRes = await request(app)
        .post('/api/vault/secrets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Custom Provider Test',
          secretValue: 'custom-secret-key-12345678',
          provider: 'custom',
        });

      const secretId = createRes.body.data.id;

      const testRes = await request(app)
        .post(`/api/vault/secrets/${secretId}/test`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(testRes.status).toBe(200);
      expect(testRes.body.data.valid).toBe(true);
      expect(testRes.body.data.latencyMs).toBeDefined();
    });
  });

  describe('DELETE /api/vault/secrets/:id & POST /api/vault/purge', () => {
    it('should permanently delete a single secret with zeroization', async () => {
      const createRes = await request(app)
        .post('/api/vault/secrets')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Temporary Mistral Key',
          secretValue: 'mistral-api-key-test-123456',
          provider: 'mistral',
        });

      const secretId = createRes.body.data.id;

      const deleteRes = await request(app)
        .delete(`/api/vault/secrets/${secretId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(deleteRes.status).toBe(200);

      // Verify deleted from DB
      const found = await SecretVault.findById(secretId);
      expect(found).toBeNull();
    });

    it('should emergency purge all secrets in vault with 1-click', async () => {
      // Add 3 secrets
      await request(app).post('/api/vault/secrets').set('Authorization', `Bearer ${userToken}`).send({ name: 'Key 1', secretValue: 'key1-test-1234', provider: 'gemini' });
      await request(app).post('/api/vault/secrets').set('Authorization', `Bearer ${userToken}`).send({ name: 'Key 2', secretValue: 'key2-test-1234', provider: 'openai' });
      await request(app).post('/api/vault/secrets').set('Authorization', `Bearer ${userToken}`).send({ name: 'Key 3', secretValue: 'key3-test-1234', provider: 'claude' });

      const purgeRes = await request(app)
        .post('/api/vault/purge')
        .set('Authorization', `Bearer ${userToken}`);

      expect(purgeRes.status).toBe(200);
      expect(purgeRes.body.deletedCount).toBe(3);

      const remaining = await SecretVault.countDocuments({ userId });
      expect(remaining).toBe(0);
    });
  });
});
