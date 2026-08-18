const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const EcommerceService = require('../src/services/import/ecommerceService');
const Expense = require('../src/models/Expense');

jest.setTimeout(30000);

let mongoServer;
let userToken;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'Ecommerce User', email: 'ecom@test.com', password: 'SecurePass123!' });

  userToken = res.body.token;
  userId = res.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('E-Commerce & Quick-Commerce Multi-Platform Sync Tests', () => {
  describe('EcommerceService Platform Detection & Motive Inference Unit Tests', () => {
    it('should detect Amazon India from order text and order ID format', () => {
      const text = 'Amazon.in Order Confirmation for Order #408-1928374-9182374. Items: Logitech Wireless Mouse.';
      const platform = EcommerceService.detectPlatform(text);
      expect(platform).toBe('amazon');
    });

    it('should detect Blinkit from 10-minute grocery receipt', () => {
      const text = 'Blinkit Commerce Pvt Ltd. 10 minutes delivery. Order BLN-827192. Amul Butter 500g, Nandini Milk 1L.';
      const platform = EcommerceService.detectPlatform(text);
      expect(platform).toBe('blinkit');
    });

    it('should detect Swiggy from food delivery order', () => {
      const text = 'Swiggy Order SW-91827391. Restaurant: Meghana Foods. Chicken Biryani x 2. Total Paid: ₹640.';
      const platform = EcommerceService.detectPlatform(text);
      expect(platform).toBe('swiggy');
    });

    it('should infer "Work" motive for computer accessories and monitors', () => {
      const items = [{ name: 'Logitech MX Master 3S Mouse', quantity: 1, price: 7999 }];
      const motive = EcommerceService.inferMotive(items, 'amazon', 7999, 'Logitech MX Master 3S Mouse');
      expect(motive.motive).toBe('Work');
      expect(motive.motiveInsight).toContain('Productivity');
    });

    it('should infer "Need" motive for essential groceries from Blinkit', () => {
      const items = [
        { name: 'Nandini Toned Milk 1L', quantity: 2, price: 84 },
        { name: 'Modern Brown Bread 400g', quantity: 1, price: 45 },
      ];
      const motive = EcommerceService.inferMotive(items, 'blinkit', 129, 'Milk Bread Eggs');
      expect(motive.motive).toBe('Need');
      expect(motive.motiveInsight).toContain('household essentials');
    });

    it('should infer "Impulse" motive for late-night quick snacks', () => {
      const items = [
        { name: 'Doritos Sweet Chilli Nachos', quantity: 2, price: 100 },
        { name: 'Kwality Walls Dark Chocolate Tub', quantity: 1, price: 240 },
      ];
      const motive = EcommerceService.inferMotive(items, 'zepto', 340, 'chips ice cream');
      expect(motive.motive).toBe('Impulse');
    });
  });

  describe('EcommerceService Text & Invoice Decomposition', () => {
    it('should parse an Amazon order invoice text with items, fees, and GSTIN', () => {
      const rawText = `
        Amazon.in Order # 408-7654321-1234567
        Sold by: Appario Retail Private Ltd
        GSTIN: 29AABCA1234M1ZP
        1x Portronics Type-C Fast Charger Cable ₹299.00
        1x Sandisk 64GB Ultra Flash Drive ₹499.00
        Delivery Fee: ₹40.00
        Discount: ₹40.00
        CGST (9%): ₹35.91
        SGST (9%): ₹35.91
        Grand Total: ₹869.82
      `;

      const parsed = EcommerceService.parseOrderText(rawText);
      expect(parsed.platform).toBe('amazon');
      expect(parsed.orderId).toBe('408-7654321-1234567');
      expect(parsed.gstin).toBe('29AABCA1234M1ZP');
      expect(parsed.lineItems.length).toBe(2);
      expect(parsed.lineItems[0].name).toContain('Portronics');
      expect(parsed.lineItems[0].quantity).toBe(1);
      expect(parsed.lineItems[1].name).toContain('Sandisk');
      expect(parsed.deliveryFee).toBe(40);
      expect(parsed.discount).toBe(40);
      expect(parsed.taxes.cgst.amount).toBe(35.91);
      expect(parsed.totalAmount).toBe(869.82);
    });

    it('should parse Blinkit order text with quantities, platform fee, and items', () => {
      const rawText = `
        Blinkit Instant Delivery (10 Mins)
        Order # BLN-998877
        2x Amul Pasteurized Butter 100g ₹116.00
        1x Farm Fresh Eggs Pack of 6 ₹54.00
        Platform Fee: ₹4.00
        Delivery Fee: ₹15.00
        Discount: ₹10.00
        Total Paid: ₹179.00
      `;

      const parsed = EcommerceService.parseOrderText(rawText);
      expect(parsed.platform).toBe('blinkit');
      expect(parsed.orderId).toBe('BLN-998877');
      expect(parsed.lineItems.length).toBe(2);
      expect(parsed.lineItems[0].quantity).toBe(2);
      expect(parsed.lineItems[0].unitPrice).toBe(58);
      expect(parsed.totalAmount).toBe(179);
      expect(parsed.motive).toBe('Need');
    });
  });

  describe('E-Commerce API Endpoints', () => {
    it('POST /api/ecommerce/parse-order should parse order snippet for authenticated user', async () => {
      const res = await request(app)
        .post('/api/ecommerce/parse-order')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          text: 'Swiggy Order SW-55443322. 2x Veg Steamed Momos ₹240.00. Delivery Fee: ₹30.00. Grand Total: ₹270.00',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.platform).toBe('swiggy');
      expect(res.body.orderId).toBe('SW-55443322');
      expect(res.body.totalAmount).toBe(270);
    });

    it('POST /api/ecommerce/sync-order should commit e-commerce order into MongoDB', async () => {
      const orderPayload = {
        platform: 'blinkit',
        platformLabel: 'Blinkit (10-Min Groceries)',
        orderId: 'BLN-TEST-001',
        merchant: 'Blinkit Commerce',
        orderDate: '2026-08-18',
        category: 'Food & Dining',
        totalAmount: 320,
        subtotal: 300,
        deliveryFee: 15,
        platformFee: 5,
        discount: 0,
        gstin: '29AABCB1234D1ZE',
        motive: 'Need',
        motiveInsight: 'Essential grocery restock via Blinkit.',
        lineItems: [
          { name: 'Nandini GoodLife Milk 1L', quantity: 2, unitPrice: 60, price: 120, category: 'Food & Dining' },
          { name: 'Fortune Sunlite Sunflower Oil 1L', quantity: 1, unitPrice: 180, price: 180, category: 'Food & Dining' },
        ],
      };

      const res = await request(app)
        .post('/api/ecommerce/sync-order')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.expense.source).toBe('ecommerce_sync');
      expect(res.body.expense.ecommercePlatform).toBe('blinkit');
      expect(res.body.expense.motive).toBe('Need');
      expect(res.body.expense.receiptDetails.invoiceNumber).toBe('BLN-TEST-001');
      expect(res.body.expense.receiptDetails.lineItems.length).toBe(2);
      expect(res.body.expense.splits.length).toBe(2);

      // Duplicate sync check
      const dupRes = await request(app)
        .post('/api/ecommerce/sync-order')
        .set('Authorization', `Bearer ${userToken}`)
        .send(orderPayload);

      expect(dupRes.statusCode).toBe(200);
      expect(dupRes.body.isDuplicate).toBe(true);
      expect(dupRes.body.message).toContain('already been synced');
    });

    it('GET /api/ecommerce/platforms should return supported platforms and spend summary', async () => {
      const res = await request(app)
        .get('/api/ecommerce/platforms')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.platforms).toBeDefined();
      expect(res.body.platforms.length).toBe(8);

      const blinkitCard = res.body.platforms.find(p => p.id === 'blinkit');
      expect(blinkitCard).toBeDefined();
      expect(blinkitCard.status).toBe('Connected');
      expect(blinkitCard.totalSpent).toBe(320);
    });
  });
});
