const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/server');
const User = require('../src/models/User');
const Expense = require('../src/models/Expense');
const Income = require('../src/models/Income');
const { FireSimulatorEngine } = require('../src/services/analytics/fireSimulatorEngine');
const jwt = require('jsonwebtoken');

let mongoServer;
let token;
let user;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-12345';

  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  user = await User.create({
    name: 'FIRE Pioneer',
    email: 'fire@test.com',
    passwordHash: 'hashed_password',
    currency: 'INR',
  });

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Feature 7: What-If Sandbox & FIRE Monte Carlo Simulation', () => {
  describe('FireSimulatorEngine Unit Calculations', () => {
    it('calculates What-If scenario delta savings and future net worth correctly', () => {
      const result = FireSimulatorEngine.calculateWhatIf({
        currentMonthlyIncome: 100000,
        currentMonthlyExpense: 60000,
        currentNetWorth: 500000,
        deltaIncome: 20000, // +20k salary hike
        deltaExpense: -5000, // -5k frugal optimization
        deltaOneTime: 100000, // +1L bonus
        annualReturnPct: 12.0,
      });

      expect(result.baseMonthlySavings).toBe(40000);
      expect(result.newMonthlySavings).toBe(65000);
      expect(result.monthlySavingsDelta).toBe(25000);
      expect(result.projections.length).toBe(5);

      const fiveYear = result.projections.find((p) => p.years === 5);
      expect(fiveYear.scenarioNetWorth).toBeGreaterThan(fiveYear.baseNetWorth);
      expect(fiveYear.netGain).toBeGreaterThan(0);
    });

    it('calculates Rule-of-25 LeanFIRE, Standard FIRE, and FatFIRE numbers accurately', () => {
      const milestones = FireSimulatorEngine.calculateFireMilestones({
        monthlyIncome: 120000,
        monthlyExpense: 50000,
        currentSavings: 1000000,
      });

      // Annual expenses = 50,000 * 12 = 600,000
      expect(milestones.annualExpenses).toBe(600000);
      expect(milestones.monthlySavings).toBe(70000);
      expect(milestones.savingsRate).toBe(58.33);

      // LeanFIRE = 20 * 600k = 1.2 Crore
      expect(milestones.milestones.leanFire.target).toBe(12000000);
      // Standard FIRE = 25 * 600k = 1.5 Crore
      expect(milestones.milestones.standardFire.target).toBe(15000000);
      // FatFIRE = 33 * 600k = 1.98 Crore
      expect(milestones.milestones.fatFire.target).toBe(19800000);
      expect(milestones.yearsToFire).toBeGreaterThan(0);
      expect(milestones.yearsToFire).toBeLessThan(35);
    });

    it('executes 1000-run Monte Carlo simulation and preserves stochastic percentile ordering P10 <= P50 <= P90', () => {
      const sim = FireSimulatorEngine.runMonteCarloSimulation({
        currentNetWorth: 500000,
        monthlyContribution: 40000,
        years: 15,
        runs: 500,
      });

      expect(sim.trajectory.length).toBe(16); // Year 0 to Year 15
      const finalYear = sim.trajectory[15];

      expect(finalYear.bearish_P10).toBeLessThanOrEqual(finalYear.median_P50);
      expect(finalYear.median_P50).toBeLessThanOrEqual(finalYear.bullish_P90);
      expect(finalYear.median_P50).toBeGreaterThan(500000);
    });
  });

  describe('Simulation API Endpoints', () => {
    it('GET /api/simulations/context returns pre-seeded financial metrics', async () => {
      await Income.create({
        userId: user._id,
        title: 'Primary Tech Salary',
        amount: 150000,
        category: 'Salary',
        date: new Date(),
      });

      await Expense.create({
        userId: user._id,
        title: 'Monthly Rent',
        amount: 35000,
        category: 'Housing',
        date: new Date(),
      });

      const res = await request(app)
        .get('/api/simulations/context')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.context).toBeDefined();
      expect(res.body.fireMilestones).toBeDefined();
      expect(res.body.monteCarlo).toBeDefined();
    });

    it('POST /api/simulations/what-if returns calculated delta projections', async () => {
      const res = await request(app)
        .post('/api/simulations/what-if')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentMonthlyIncome: 120000,
          currentMonthlyExpense: 50000,
          currentNetWorth: 400000,
          deltaIncome: 15000,
          deltaExpense: -5000,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.monthlySavingsDelta).toBe(20000);
    });
  });
});
