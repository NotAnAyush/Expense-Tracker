const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../src/models/User');

let mongoServer;
let app;
let token;
let userId;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-12345';

  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  const user = await User.create({
    name: 'Ayush Kaushik',
    email: 'ayush@test.com',
    passwordHash: 'hashed_password',
  });
  userId = user._id;

  token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
  app = require('../src/server');
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Feature 4: Group Bill Splitting & UPI QR Settlements API', () => {
  let groupId;

  it('POST /api/groups - should create a new expense group with members', async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Goa Trip 2026',
        description: 'Baga Villa & Food',
        currency: 'INR',
        members: [
          { name: 'Ayush Kaushik', email: 'ayush@test.com', upiId: 'ayush@okhdfcbank' },
          { name: 'Rohan', email: 'rohan@test.com', upiId: 'rohan@oksbi' },
          { name: 'Priya', email: 'priya@test.com', upiId: 'priya@icici' },
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.group).toBeDefined();
    expect(res.body.group.name).toBe('Goa Trip 2026');
    expect(res.body.group.members.length).toBe(3);
    groupId = res.body.group._id;
  });

  it('POST /api/groups/:id/expenses - should add an equal split expense', async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/expenses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Villa Stay',
        amount: 3000,
        paidBy: 'Ayush Kaushik',
        splitType: 'EQUAL',
      });

    expect(res.status).toBe(201);
    expect(res.body.expense).toBeDefined();
    expect(res.body.expense.amount).toBe(3000);
    expect(res.body.expense.splits.length).toBe(3);
    expect(res.body.expense.splits[0].amount).toBe(1000);

    // Ayush paid 3000, owes 1000 -> Net = +2000
    const ayushBalance = res.body.memberBalances.find(m => m.name === 'Ayush Kaushik');
    expect(ayushBalance.net).toBe(2000);

    // Rohan paid 0, owes 1000 -> Net = -1000
    const rohanBalance = res.body.memberBalances.find(m => m.name === 'Rohan');
    expect(rohanBalance.net).toBe(-1000);

    // Check Minimum Cash Flow simplified transfers
    expect(res.body.simplifiedTransfers.length).toBe(2);
    const rohanTransfer = res.body.simplifiedTransfers.find(t => t.from === 'Rohan');
    expect(rohanTransfer.to).toBe('Ayush Kaushik');
    expect(rohanTransfer.amount).toBe(1000);
    expect(rohanTransfer.upiUri).toContain('upi://pay');
    expect(rohanTransfer.upiUri).toContain('ayush@okhdfcbank');
  });

  it('POST /api/groups/:id/expenses - should add a second expense paid by Rohan', async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/expenses`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        description: 'Dinner at Fisherman Wharf',
        amount: 1500,
        paidBy: 'Rohan',
        splitType: 'EQUAL',
      });

    expect(res.status).toBe(201);
    // Rohan previously owed 1000, now paid 1500 (owes 500) -> Net = -1000 + 1500 - 500 = 0
    const rohanBalance = res.body.memberBalances.find(m => m.name === 'Rohan');
    expect(rohanBalance.net).toBe(0);

    // Priya owes 1000 (villa) + 500 (dinner) = -1500
    const priyaBalance = res.body.memberBalances.find(m => m.name === 'Priya');
    expect(priyaBalance.net).toBe(-1500);

    // Ayush is owed 2000 - 500 = +1500
    const ayushBalance = res.body.memberBalances.find(m => m.name === 'Ayush Kaushik');
    expect(ayushBalance.net).toBe(1500);

    // Simplified transfers: Only 1 transaction needed: Priya -> Ayush (1500)
    expect(res.body.simplifiedTransfers.length).toBe(1);
    expect(res.body.simplifiedTransfers[0].from).toBe('Priya');
    expect(res.body.simplifiedTransfers[0].to).toBe('Ayush Kaushik');
    expect(res.body.simplifiedTransfers[0].amount).toBe(1500);
  });

  it('POST /api/groups/:id/settle - should record a settlement between members', async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/settle`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        fromMember: 'Priya',
        toMember: 'Ayush Kaushik',
        amount: 1500,
        method: 'UPI',
        notes: 'Paid via GPay',
      });

    expect(res.status).toBe(201);
    expect(res.body.settlement).toBeDefined();

    // Now all balances should be 0
    res.body.memberBalances.forEach((m) => {
      expect(Math.abs(m.net)).toBe(0);
    });

    // Simplified transfers should be empty
    expect(res.body.simplifiedTransfers.length).toBe(0);
  });
});
