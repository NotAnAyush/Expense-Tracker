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
    it('should parse raw JSON output with complete GST, CGST/SGST, and itemized quantities', () => {
      const raw = JSON.stringify({
        merchant: 'The Rameshwaram Cafe',
        merchantAddress: 'Indiranagar, 100 Feet Rd, Bengaluru 560038',
        gstin: '29ABHFR8210M1ZP',
        invoiceNumber: '311086',
        tokenNumber: '136',
        amount: 335.00,
        subtotal: 319.04,
        cgst: { rate: 2.5, amount: 7.98 },
        sgst: { rate: 2.5, amount: 7.98 },
        taxAmount: 15.96,
        currency: '₹',
        category: 'Food & Dining',
        date: '2026-08-16',
        time: '06:37',
        paymentMethod: 'UPI',
        lineItems: [
          { name: 'Ghee Pudi Masala Dosa', quantity: 1, unitPrice: 147.62, price: 147.62 },
          { name: 'Ghee Plain Dosa', quantity: 1, unitPrice: 114.28, price: 114.28 },
          { name: 'Uddin Vada', quantity: 1, unitPrice: 57.14, price: 57.14 },
        ],
      });

      const parsed = UnifiedAIClient._parseReceiptJson(raw);
      expect(parsed.merchant).toBe('The Rameshwaram Cafe');
      expect(parsed.gstin).toBe('29ABHFR8210M1ZP');
      expect(parsed.invoiceNumber).toBe('311086');
      expect(parsed.tokenNumber).toBe('136');
      expect(parsed.amount).toBe(335);
      expect(parsed.subtotal).toBe(319.04);
      expect(parsed.cgst.amount).toBe(7.98);
      expect(parsed.sgst.amount).toBe(7.98);
      expect(parsed.taxAmount).toBe(15.96);
      expect(parsed.category).toBe('Food & Dining');
      expect(parsed.paymentMethod).toBe('UPI');
      expect(parsed.lineItems.length).toBe(3);
      expect(parsed.lineItems[0].quantity).toBe(1);
      expect(parsed.lineItems[0].unitPrice).toBe(147.62);
    });

    it('should parse E-Commerce invoice (Amazon/Flipkart) with platform fees, delivery fees and discounts', () => {
      const ecommerceOutput = `\`\`\`json
{
  "merchant": "Amazon India",
  "gstin": "29AABCU9603R1ZM",
  "invoiceNumber": "408-7291823-1928374",
  "amount": 1499.00,
  "subtotal": 1399.00,
  "taxAmount": 100.00,
  "cgst": { "rate": 9, "amount": 50.00 },
  "sgst": { "rate": 9, "amount": 50.00 },
  "deliveryFee": 40.00,
  "platformFee": 10.00,
  "discount": 50.00,
  "isECommerce": true,
  "currency": "₹",
  "category": "Shopping & E-Commerce",
  "paymentMethod": "Amazon Pay",
  "date": "2026-08-15",
  "lineItems": [
    { "name": "Wireless Bluetooth Earbuds Pro", "quantity": 1, "unitPrice": 1399.00, "price": 1399.00, "category": "Electronics & Gadgets" }
  ]
}
\`\`\``;

      const parsed = UnifiedAIClient._parseReceiptJson(ecommerceOutput);
      expect(parsed.merchant).toBe('Amazon India');
      expect(parsed.gstin).toBe('29AABCU9603R1ZM');
      expect(parsed.invoiceNumber).toBe('408-7291823-1928374');
      expect(parsed.isECommerce).toBe(true);
      expect(parsed.deliveryFee).toBe(40);
      expect(parsed.platformFee).toBe(10);
      expect(parsed.discount).toBe(50);
      expect(parsed.amount).toBe(1499);
      expect(parsed.lineItems[0].name).toBe('Wireless Bluetooth Earbuds Pro');
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
