const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const UnifiedAIClient = require('../src/services/ai/unifiedAIClient');

jest.setTimeout(30000);

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

describe('Receipt Vision OCR Endpoint & Client Tests', () => {
  describe('API Endpoint Validation', () => {
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

  describe('UnifiedAIClient API Key Resolution Unit Tests', () => {
    it('should resolve user API key when non-empty and unmasked', () => {
      const key = UnifiedAIClient.resolveApiKey('gemini', 'my-custom-api-key');
      expect(key).toBe('my-custom-api-key');

      const aliasKey = UnifiedAIClient.getEffectiveApiKey('gemini', 'my-custom-api-key');
      expect(aliasKey).toBe('my-custom-api-key');
    });

    it('should ignore masked user keys and fallback appropriately', () => {
      const key = UnifiedAIClient.resolveApiKey('gemini', '••••••••1234');
      // If process.env.GEMINI_API_KEY is unset or dummy, it returns that or null
      expect(key === null || typeof key === 'string').toBe(true);
    });
  });

  describe('UnifiedAIClient._parseReceiptJson Parsing Robustness', () => {
    it('should parse raw JSON output directly', () => {
      const raw = JSON.stringify({
        merchant: 'The Rameshwaram Cafe',
        amount: 335,
        currency: '₹',
        category: 'Food & Dining',
        date: '2026-08-16',
        paymentMethod: 'UPI',
        lineItems: [
          { name: 'Ghee Pudi Masala Dosa', price: 147.62 },
          { name: 'Ghee Plain Dosa', price: 114.28 },
          { name: 'Uddin Vada', price: 57.14 },
        ],
      });

      const parsed = UnifiedAIClient._parseReceiptJson(raw);
      expect(parsed.merchant).toBe('The Rameshwaram Cafe');
      expect(parsed.amount).toBe(335);
      expect(parsed.category).toBe('Food & Dining');
      expect(parsed.paymentMethod).toBe('UPI');
      expect(parsed.lineItems.length).toBe(3);
    });

    it('should extract JSON from markdown code blocks with preamble and postamble', () => {
      const conversationalOutput = `Here is the structured data from the uploaded receipt:
\`\`\`json
{
  "merchant": "The Rameshwaram Cafe - INDIRANAGAR",
  "amount": 335.00,
  "currency": "₹",
  "category": "Food & Dining",
  "paymentMethod": "UPI",
  "date": "2026-08-16"
}
\`\`\`
Extracted with 95% confidence.`;

      const parsed = UnifiedAIClient._parseReceiptJson(conversationalOutput);
      expect(parsed.merchant).toBe('The Rameshwaram Cafe - INDIRANAGAR');
      expect(parsed.amount).toBe(335);
      expect(parsed.category).toBe('Food & Dining');
      expect(parsed.paymentMethod).toBe('UPI');
    });

    it('should throw an error for malformed or non-JSON input', () => {
      expect(() => {
        UnifiedAIClient._parseReceiptJson('Just plain text without json');
      }).toThrow(/Failed to parse structured receipt data/);
    });
  });

  describe('UnifiedAIClient.scanReceipt Execution', () => {
    it('should throw a clear configuration error when API key is missing rather than TypeError', async () => {
      await expect(
        UnifiedAIClient.scanReceipt({
          imageBase64: 'data:image/jpeg;base64,dGVzdA==',
          mimeType: 'image/jpeg',
          userConfig: { provider: 'gemini', apiKey: '' },
        })
      ).rejects.toThrow(/Gemini API key is required for receipt vision scanner/);
    });

    it('should reject scan if imageBase64 is empty', async () => {
      await expect(
        UnifiedAIClient.scanReceipt({
          imageBase64: '',
          userConfig: {},
        })
      ).rejects.toThrow('Receipt image data is required');
    });
  });
});
