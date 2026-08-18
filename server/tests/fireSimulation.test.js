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
    fireTargetAge: 55,
  });

  token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Feature 7: Institutional What-If Sandbox & Stochastic Monte Carlo Engine', () => {
  describe('FireSimulatorEngine Unit Calculations', () => {
    it('calculates What-If scenario delta savings, step-ups, and future net worth correctly', () => {
      const result = FireSimulatorEngine.calculateWhatIf({
        currentMonthlyIncome: 100000,
        currentMonthlyExpense: 60000,
        currentNetWorth: 500000,
        deltaIncome: 20000, // +20k salary hike
        deltaExpense: -5000, // -5k frugal optimization
        deltaOneTime: 100000, // +1L bonus
        annualReturnPct: 12.0,
        annualStepUpPct: 5.0,
        timedEvents: [
          { year: 3, amount: -200000, description: 'Vehicle Downpayment' }
        ]
      });

      expect(result.baseMonthlySavings).toBe(40000);
      expect(result.newMonthlySavings).toBe(65000);
      expect(result.monthlySavingsDelta).toBe(25000);
      expect(result.projections.length).toBe(8); // 1, 3, 5, 10, 15, 20, 25, 30 years

      const fiveYear = result.projections.find((p) => p.years === 5);
      expect(fiveYear.scenarioNetWorth).toBeGreaterThan(fiveYear.baseNetWorth);
      expect(fiveYear.netGain).toBeGreaterThan(0);
    });

    it('calculates comprehensive 6-Tier FIRE milestones accurately (Lean, Barista, Standard, Chubby, Fat, Coast)', () => {
      const milestones = FireSimulatorEngine.calculateFireMilestones({
        monthlyIncome: 120000,
        monthlyExpense: 50000,
        currentSavings: 1000000,
        annualReturnPct: 11.5,
        inflationPct: 6.0,
        customSwrPct: 4.0,
        targetRetirementAge: 55,
        currentAge: 30,
      });

      // Annual expenses = 50,000 * 12 = 600,000
      expect(milestones.annualExpenses).toBe(600000);
      expect(milestones.monthlySavings).toBe(70000);
      expect(milestones.savingsRate).toBe(58.33);

      // 1. Lean FIRE = 20 * 600k = 1.2 Crore
      expect(milestones.milestones.leanFire.target).toBe(12000000);
      // 2. Barista FIRE = 15 * 600k = 90 Lakh
      expect(milestones.milestones.baristaFire.target).toBe(9000000);
      // 3. Standard FIRE = 25 * 600k = 1.5 Crore
      expect(milestones.milestones.standardFire.target).toBe(15000000);
      // 4. Chubby FIRE = 30 * 600k = 1.8 Crore
      expect(milestones.milestones.chubbyFire.target).toBe(18000000);
      // 5. Fat FIRE = 35 * 600k = 2.1 Crore
      expect(milestones.milestones.fatFire.target).toBe(21000000);
      // 6. Coast FIRE
      expect(milestones.milestones.coastFire.target).toBeGreaterThan(0);
      expect(milestones.milestones.coastFire.yearsToTargetAge).toBe(25);

      expect(milestones.yearsToFire).toBeGreaterThan(0);
      expect(milestones.yearsToFire).toBeLessThan(35);
      expect(milestones.velocityScore).toBeGreaterThan(30);
    });

    it('executes Geometric Brownian Motion (GBM) Monte Carlo and preserves stochastic percentile ordering P5 <= P10 <= P25 <= P50 <= P75 <= P90 <= P95', () => {
      const sim = FireSimulatorEngine.runMonteCarloSimulation({
        currentNetWorth: 500000,
        monthlyContribution: 40000,
        years: 15,
        runs: 1000,
        model: 'gbm',
      });

      expect(sim.trajectory.length).toBe(16); // Year 0 to Year 15
      const finalYear = sim.trajectory[15];

      expect(finalYear.deepBear_P5).toBeLessThanOrEqual(finalYear.bearish_P10);
      expect(finalYear.bearish_P10).toBeLessThanOrEqual(finalYear.lowerQuartile_P25);
      expect(finalYear.lowerQuartile_P25).toBeLessThanOrEqual(finalYear.median_P50);
      expect(finalYear.median_P50).toBeLessThanOrEqual(finalYear.upperQuartile_P75);
      expect(finalYear.upperQuartile_P75).toBeLessThanOrEqual(finalYear.bullish_P90);
      expect(finalYear.bullish_P90).toBeLessThanOrEqual(finalYear.superBull_P95);

      expect(sim.metrics.sharpeRatio).toBeDefined();
      expect(sim.metrics.valueAtRisk95).toBeDefined();
      expect(sim.metrics.conditionalVaR95).toBeDefined();
      expect(sim.sampleTrajectories.length).toBe(20);
      expect(finalYear.nominal_P50).toBeGreaterThanOrEqual(finalYear.median_P50);
    });

    it('executes Merton Jump-Diffusion model with Poisson crash shocks', () => {
      const sim = FireSimulatorEngine.runMonteCarloSimulation({
        currentNetWorth: 500000,
        monthlyContribution: 30000,
        years: 10,
        runs: 1000,
        model: 'jump_diffusion',
      });

      expect(sim.model).toBe('jump_diffusion');
      expect(sim.trajectory.length).toBe(11);
      expect(sim.finalYearMetrics.median_P50).toBeGreaterThan(500000);
    });

    it('executes Historical Bootstrap Resampling across empirical economic regimes', () => {
      const sim = FireSimulatorEngine.runMonteCarloSimulation({
        currentNetWorth: 500000,
        monthlyContribution: 30000,
        years: 10,
        runs: 1000,
        model: 'historical_bootstrap',
      });

      expect(sim.model).toBe('historical_bootstrap');
      expect(sim.trajectory.length).toBe(11);
      expect(sim.finalYearMetrics.median_P50).toBeGreaterThan(0);
    });

    it('calculates Multi-Asset covariance blended returns correctly', () => {
      const blended = FireSimulatorEngine.calculateBlendedAssetMetrics({
        equity: 60,
        debt: 30,
        gold: 10,
        cash: 0,
      });

      expect(blended.blendedReturn).toBeGreaterThan(8.0);
      expect(blended.blendedReturn).toBeLessThan(12.0);
      expect(blended.blendedVolatility).toBeGreaterThan(5.0);
      expect(blended.blendedVolatility).toBeLessThan(16.0);
    });

    it('simulates Decumulation retirement survival and computes Ruin & Survival rates with Guyton-Klinkis Guardrails', () => {
      const simWithGuardrails = FireSimulatorEngine.runMonteCarloSimulation({
        currentNetWorth: 15000000, // 1.5 Cr retirement nest egg
        monthlyContribution: 0,
        annualExpenseWithdrawal: 600000, // 4% SWR on 1.5 Cr = 6L/yr
        years: 30,
        runs: 1000,
        phase: 'decumulation',
        inflation: 5.0,
        expectedReturn: 10.0,
        guardrailsEnabled: true,
      });

      expect(simWithGuardrails.phase).toBe('decumulation');
      expect(simWithGuardrails.guardrailsEnabled).toBe(true);
      expect(simWithGuardrails.metrics.successProbabilityPct).toBeGreaterThan(60);
      expect(simWithGuardrails.metrics.ruinProbabilityPct).toBeLessThan(40);
    });
  });

  describe('Simulation API Endpoints', () => {
    it('GET /api/simulations/context returns enriched financial context & 6-tier milestones', async () => {
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
      expect(res.body.fireMilestones.milestones.baristaFire).toBeDefined();
      expect(res.body.fireMilestones.milestones.chubbyFire).toBeDefined();
      expect(res.body.monteCarlo).toBeDefined();
      expect(res.body.monteCarlo.metrics).toBeDefined();
    });

    it('POST /api/simulations/what-if returns calculated delta projections with step-up & timed events', async () => {
      const res = await request(app)
        .post('/api/simulations/what-if')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentMonthlyIncome: 120000,
          currentMonthlyExpense: 50000,
          currentNetWorth: 400000,
          deltaIncome: 15000,
          deltaExpense: -5000,
          annualStepUpPct: 5.0,
          timedEvents: [{ year: 5, amount: 500000, description: 'ESOP Vesting' }],
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.monthlySavingsDelta).toBe(20000);
      expect(res.body.projections.length).toBe(8);
    });

    it('POST /api/simulations/monte-carlo supports variable 5k runs, jump diffusion, and risk metrics', async () => {
      const res = await request(app)
        .post('/api/simulations/monte-carlo')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentNetWorth: 1000000,
          monthlyContribution: 50000,
          years: 20,
          runs: 5000,
          model: 'jump_diffusion',
          phase: 'accumulation',
          assetAllocation: { equity: 80, debt: 15, gold: 5, cash: 0 },
          stepUpPct: 5,
          guardrailsEnabled: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.runs).toBe(5000);
      expect(res.body.metrics.successProbabilityPct).toBeDefined();
      expect(res.body.metrics.valueAtRisk95).toBeDefined();
      expect(res.body.trajectory.length).toBe(21);
    });
  });
});
