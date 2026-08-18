const BrokerClient = require('../src/services/market/brokerClient');
const SchemeRadarService = require('../src/services/market/schemeRadarService');
const ScamShieldEngine = require('../src/services/market/scamShieldEngine');
const QuantitativeEngine = require('../src/services/market/quantitativeEngine');
const ArbitrageSolver = require('../src/services/market/arbitrageSolver');

describe('Stock Market, Verified Schemes & Passive Income Tests (Phase 8)', () => {
  describe('Broker Quotes Feed', () => {
    it('should return valid market quotes for specified symbols', async () => {
      const quotes = await BrokerClient.getQuotes(['NIFTY50', 'RELIANCE', 'AAPL']);
      expect(Array.isArray(quotes)).toBe(true);
      expect(quotes.length).toBe(3);
      expect(quotes[0]).toHaveProperty('price');
      expect(quotes[0]).toHaveProperty('changePercent');
      expect(quotes[0].price).toBeGreaterThan(0);
    });
  });

  describe('Verified Sovereign Scheme Radar', () => {
    it('should return categorized sovereign and fixed income schemes', () => {
      const schemes = SchemeRadarService.getVerifiedSchemes();
      expect(schemes).toHaveProperty('treasuryBills');
      expect(schemes).toHaveProperty('goldBonds');
      expect(schemes).toHaveProperty('governmentSchemes');
      expect(schemes).toHaveProperty('bankFixedDeposits');
      expect(schemes.treasuryBills.length).toBeGreaterThanOrEqual(3);
      expect(schemes.bankFixedDeposits.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe('Scam & Ponzi Shield Engine', () => {
    it('should flag fraudulent scheme promising 36% annual return with MLM downline', () => {
      const result = ScamShieldEngine.evaluateSchemeRisk({
        schemeName: 'Super Matrix Arbitrage',
        promisedReturnPercent: 36,
        returnFrequency: 'annual',
        hasReferralCommission: true,
        referralTiers: 3,
        isRegulatedBySebiOrRbi: false,
        investmentMechanism: 'crypto bot guaranteed',
      });

      expect(result.isFlagged).toBe(true);
      expect(result.riskScore).toBeGreaterThanOrEqual(70);
      expect(result.verdict).toBe('CRITICAL_PONZI_ALERT');
      expect(result.redFlags.length).toBeGreaterThanOrEqual(3);
    });

    it('should verify standard regulated investment scheme with low risk score', () => {
      const result = ScamShieldEngine.evaluateSchemeRisk({
        schemeName: 'Nifty 50 Index Fund',
        promisedReturnPercent: 0,
        hasReferralCommission: false,
        isRegulatedBySebiOrRbi: true,
      });

      expect(result.isFlagged).toBe(false);
      expect(result.riskScore).toBeLessThan(20);
      expect(result.verdict).toBe('VERIFIED_REGULATED');
    });
  });

  describe('Quantitative Valuation Engine', () => {
    it('should calculate DCF intrinsic value and margin of safety', () => {
      const dcf = QuantitativeEngine.calculateDCF({
        currentFCF: 1000,
        growthRateStage1: 0.12,
        growthRateStage2: 0.08,
        discountRateWACC: 0.10,
        terminalGrowthRate: 0.04,
        sharesOutstanding: 100,
        netDebt: 200,
        currentPrice: 120,
      });

      expect(dcf.fairValuePerShare).toBeGreaterThan(0);
      expect(dcf).toHaveProperty('marginOfSafetyPercent');
      expect(dcf).toHaveProperty('valuationVerdict');
      expect(dcf.fcfProjection.length).toBe(10);
    });

    it('should calculate Piotroski 9-Point F-Score', () => {
      const fScore = QuantitativeEngine.calculatePiotroskiFScore({
        netIncomePositive: true,
        operatingCashFlowPositive: true,
        higherRoaYoY: true,
        cashFlowGreaterThanNetIncome: true,
        lowerLongTermDebtRatio: true,
        higherCurrentRatio: true,
        noDilutionOfShares: true,
        higherGrossMarginYoY: true,
        higherAssetTurnoverYoY: true,
      });

      expect(fScore.fScore).toBe(9);
      expect(fScore.strength).toBe('VERY_STRONG');
    });

    it('should classify balance sheets using Altman Z-Score', () => {
      const healthyZ = QuantitativeEngine.calculateAltmanZScore({
        workingCapital: 1000,
        retainedEarnings: 2000,
        ebit: 800,
        marketCap: 10000,
        sales: 6000,
        totalAssets: 5000,
        totalLiabilities: 1000,
      });
      expect(healthyZ.zone).toBe('SAFE');
      expect(healthyZ.zScore).toBeGreaterThan(2.99);

      const distressedZ = QuantitativeEngine.calculateAltmanZScore({
        workingCapital: -200,
        retainedEarnings: -500,
        ebit: -100,
        marketCap: 300,
        sales: 500,
        totalAssets: 2000,
        totalLiabilities: 2500,
      });
      expect(distressedZ.zone).toBe('DISTRESS');
      expect(distressedZ.zScore).toBeLessThan(1.81);
    });
  });

  describe('Debt vs. Investment Arbitrage Solver', () => {
    it('should recommend accelerated debt payoff for high-interest debt', () => {
      const solver = ArbitrageSolver.solveArbitrage({
        surplusMonthlyCash: 30000,
        debtBalance: 150000,
        debtInterestRatePercent: 16.0,
        expectedEquityReturnPercent: 12.0,
        capitalGainsTaxRatePercent: 12.5,
        emergencyFundCoveredMonths: 6,
      });

      expect(solver.allocationStrategy).toBe('ACCELERATED_DEBT_AVALANCHE');
      expect(solver.debtPrepayAllocationPercent).toBe(90);
      expect(solver.monthlyToDebt).toBe(27000);
    });

    it('should recommend equity wealth accumulation for low-interest debt', () => {
      const solver = ArbitrageSolver.solveArbitrage({
        surplusMonthlyCash: 30000,
        debtBalance: 150000,
        debtInterestRatePercent: 6.5,
        expectedEquityReturnPercent: 12.0,
        capitalGainsTaxRatePercent: 12.5,
        emergencyFundCoveredMonths: 6,
      });

      expect(solver.allocationStrategy).toBe('EQUITY_WEALTH_ACCUMULATION');
      expect(solver.investmentAllocationPercent).toBe(80);
    });
  });
});
