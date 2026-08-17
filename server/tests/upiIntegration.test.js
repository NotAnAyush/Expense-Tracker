const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const User = require('../src/models/User');
const Expense = require('../src/models/Expense');
const Income = require('../src/models/Income');
const LinkedAccount = require('../src/models/LinkedAccount');

let mongoServer;
let userToken;
let userId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  const res = await request(app)
    .post('/api/auth/register')
    .send({ name: 'UPI Test User', email: 'upi@test.com', password: 'SecurePass1' });

  userToken = res.body.token;
  userId = res.body._id;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Expense.deleteMany({});
  await Income.deleteMany({});
  await LinkedAccount.deleteMany({});
});

describe('Universal UPI & GPay Integration Endpoints', () => {
  describe('GET /api/integrations/upi/verify-vpa', () => {
    it('should verify and resolve a Google Pay VPA', async () => {
      const res = await request(app)
        .get('/api/integrations/upi/verify-vpa?vpa=ayush@okhdfcbank')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isValid).toBe(true);
      expect(res.body.data.upiApp).toBe('gpay');
      expect(res.body.data.bankName).toBe('HDFC Bank');
    });

    it('should verify and resolve a PhonePe VPA', async () => {
      const res = await request(app)
        .get('/api/integrations/upi/verify-vpa?vpa=ayush@ybl')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.upiApp).toBe('phonepe');
    });

    it('should reject invalid VPA format', async () => {
      const res = await request(app)
        .get('/api/integrations/upi/verify-vpa?vpa=invalidvpa')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(400);
    });
  });

  describe('Account Aggregator (AA) Linking & Consent Lifecycle', () => {
    it('should initiate and complete bank account linking via OTP consent', async () => {
      // Step 1: Initiate Link
      const initiateRes = await request(app)
        .post('/api/integrations/upi/accounts/link-initiate')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bankName: 'HDFC Bank',
          accountNumber: '50100423184012',
          upiId: 'ayush@okhdfcbank',
          accountType: 'bank_account',
        });

      expect(initiateRes.status).toBe(201);
      expect(initiateRes.body.data.consentStatus).toBe('PENDING_OTP');
      expect(initiateRes.body.data.accountMasked).toBe('••••••••4012');
      const accountId = initiateRes.body.data.accountId;

      // Step 2: Verify OTP
      const verifyRes = await request(app)
        .post('/api/integrations/upi/accounts/verify-otp')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          accountId,
          otp: '482910',
        });

      expect(verifyRes.status).toBe(200);
      expect(verifyRes.body.data.consentStatus).toBe('ACTIVE');

      // Step 3: Fetch linked accounts
      const listRes = await request(app)
        .get('/api/integrations/upi/accounts')
        .set('Authorization', `Bearer ${userToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.count).toBe(1);
      expect(listRes.body.data[0].bankName).toBe('HDFC Bank');
      expect(listRes.body.data[0].consentStatus).toBe('ACTIVE');

      // Step 4: Revoke Consent (1-Click Wipe)
      const deleteRes = await request(app)
        .delete(`/api/integrations/upi/accounts/${accountId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(deleteRes.status).toBe(200);

      // Verify account is marked revoked and inactive
      const activeAccounts = await request(app)
        .get('/api/integrations/upi/accounts')
        .set('Authorization', `Bearer ${userToken}`);

      expect(activeAccounts.body.count).toBe(0);
    });
  });

  describe('POST /api/integrations/upi/webhook (Payment Gateway & Live Bank Feed)', () => {
    it('should ingest a GPay DEBIT transaction, auto-categorize, and store UTR', async () => {
      const webhookPayload = {
        userId,
        utr: '412345678901',
        amount: 450,
        type: 'DEBIT',
        vpa: 'swiggy@icici',
        narrative: 'UPI/412345678901/SWIGGY_BLR/HDFC/swiggy@icici',
        accountMasked: '50100423184012',
      };

      const res = await request(app)
        .post('/api/integrations/upi/webhook')
        .send(webhookPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Swiggy');
      expect(res.body.data.amount).toBe(450);
      expect(res.body.data.upiDetails.utr).toBe('412345678901');
      expect(res.body.data.source).toBe('upi_sync');
      expect(res.body.data.paymentMethod).toBe('UPI');

      // Verify in DB
      const saved = await Expense.findOne({ 'upiDetails.utr': '412345678901' });
      expect(saved).not.toBeNull();
      expect(saved.title).toBe('Swiggy');
    });

    it('should ingest a CREDIT transaction and automatically record it in Income ledger', async () => {
      const creditWebhook = {
        userId,
        utr: '778899001122',
        amount: 85000,
        type: 'CREDIT',
        vpa: 'payroll@google',
        narrative: 'SALARY CREDIT GOOGLE INDIA AUG 2026',
      };

      const res = await request(app)
        .post('/api/integrations/upi/webhook')
        .send(creditWebhook);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.type).toBe('CREDIT');
      expect(res.body.data.amount).toBe(85000);
      expect(res.body.data.category).toBe('Salary');

      // Verify in Income collection
      const savedIncome = await Income.findOne({ userId });
      expect(savedIncome).not.toBeNull();
      expect(savedIncome.amount).toBe(85000);
      expect(savedIncome.category).toBe('Salary');
    });

    it('should prevent duplicate transaction ingestion via UTR idempotency', async () => {
      const payload = {
        userId,
        utr: '987654321098',
        amount: 250,
        vpa: 'uber@axisbank',
        narrative: 'UPI/987654321098/UBER_INDIA/AXIS/uber@axisbank',
      };

      // 1st Ingestion
      const res1 = await request(app)
        .post('/api/integrations/upi/webhook')
        .send(payload);
      expect(res1.status).toBe(201);

      // 2nd Ingestion (Duplicate Webhook replay)
      const res2 = await request(app)
        .post('/api/integrations/upi/webhook')
        .send(payload);
      expect(res2.status).toBe(200);
      expect(res2.body.message).toContain('already recorded');

      // Total expenses count in DB must still be 1
      const count = await Expense.countDocuments({ userId });
      expect(count).toBe(1);
    });
  });

  describe('POST /api/integrations/upi/device-notification (SMS/Push Companion Ingest)', () => {
    it('should parse debit SMS notification and auto-create expense', async () => {
      const smsPayload = {
        rawText: 'Debited INR 750.00 from A/C XX4012 on 17-Aug-26 to ZOMATO Ref 429183746102',
        sender: 'VM-HDFCBK',
      };

      const res = await request(app)
        .post('/api/integrations/upi/device-notification')
        .set('Authorization', `Bearer ${userToken}`)
        .send(smsPayload);

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Zomato');
      expect(res.body.data.amount).toBe(750);
      expect(res.body.data.upiDetails.utr).toBe('429183746102');
    });

    it('should parse credit SMS notification and auto-create income', async () => {
      const creditSms = {
        rawText: 'A/C XX4012 Credited with INR 12,500.00 on 17-Aug-26 by UPWORK FREELANCE Ref 554433221100',
        sender: 'VM-HDFCBK',
      };

      const res = await request(app)
        .post('/api/integrations/upi/device-notification')
        .set('Authorization', `Bearer ${userToken}`)
        .send(creditSms);

      expect(res.status).toBe(201);
      expect(res.body.type).toBe('CREDIT');
      expect(res.body.data.amount).toBe(12500);
      expect(res.body.data.category).toBe('Freelance');
    });
  });

  describe('POST /api/integrations/upi/generate-intent', () => {
    it('should generate a standard NPCI UPI URI with deep-link payload', async () => {
      const res = await request(app)
        .post('/api/integrations/upi/generate-intent')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          payeeVpa: 'roommate@okhdfcbank',
          payeeName: 'Roommate Rent Split',
          amount: 5000,
          note: 'August Rent Share',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.upiUri).toContain('upi://pay?pa=roommate%40okhdfcbank');
      expect(res.body.data.upiUri).toContain('am=5000.00');
      expect(res.body.data.upiUri).toContain('cu=INR');
      expect(res.body.data.supportedApps).toContain('Google Pay');
    });
  });
});
