const LifestyleHabitEngine = require('../src/services/analytics/lifestyleHabitEngine');

describe('LifestyleHabitEngine Tests', () => {
  describe('Income Cadence & Irregularity (Cv)', () => {
    it('should return default predictable cadence when less than 2 incomes are provided', () => {
      const result = LifestyleHabitEngine.calculateIncomeCadence([]);
      expect(result.cadenceType).toBe('SALARIED_FIXED');
      expect(result.isPredictable).toBe(true);
      expect(result.coefficientOfVariation).toBe(0.05);
    });

    it('should identify fixed monthly salaried cadence (low Cv)', () => {
      const incomes = [
        { date: '2026-01-01', amount: 100000 },
        { date: '2026-01-31', amount: 100000 },
        { date: '2026-03-02', amount: 100000 },
        { date: '2026-04-01', amount: 100000 },
      ];
      const result = LifestyleHabitEngine.calculateIncomeCadence(incomes);
      expect(result.cadenceType).toBe('SALARIED_FIXED');
      expect(result.coefficientOfVariation).toBeLessThan(0.15);
      expect(result.isPredictable).toBe(true);
    });

    it('should identify irregular freelance/gig cadence (high Cv)', () => {
      const incomes = [
        { date: '2026-01-01', amount: 30000 },
        { date: '2026-01-05', amount: 20000 },
        { date: '2026-02-28', amount: 80000 },
        { date: '2026-03-02', amount: 15000 },
        { date: '2026-05-15', amount: 95000 },
      ];
      const result = LifestyleHabitEngine.calculateIncomeCadence(incomes);
      expect(result.cadenceType).toBe('IRREGULAR_GIG');
      expect(result.coefficientOfVariation).toBeGreaterThanOrEqual(0.4);
      expect(result.isPredictable).toBe(false);
    });
  });

  describe('Payday Euphoria Decay Rate (λ)', () => {
    it('should handle empty transactions gracefully', () => {
      const result = LifestyleHabitEngine.calculatePaydayEuphoria([], []);
      expect(result.hasEuphoriaSpike).toBe(false);
      expect(result.surgeSeverity).toBe('LOW');
    });

    it('should detect payday euphoria surge when large purchases happen within 48h of income', () => {
      const incomes = [{ date: '2026-08-01T10:00:00Z', amount: 150000 }];
      const expenses = [
        { date: '2026-08-01T14:00:00Z', amount: 45000 },
        { date: '2026-08-02T16:00:00Z', amount: 30000 },
        { date: '2026-08-10T12:00:00Z', amount: 2000 },
        { date: '2026-08-15T12:00:00Z', amount: 2000 },
      ];
      const result = LifestyleHabitEngine.calculatePaydayEuphoria(expenses, incomes);
      expect(result.hasEuphoriaSpike).toBe(true);
      expect(result.day0SurgeRatio).toBeGreaterThan(2.0);
      expect(result.surgeSeverity).toMatch(/MODERATE|CRITICAL/);
    });
  });

  describe('Late-Night Impulse Buying Ratio (I_night)', () => {
    it('should detect high risk when majority of discretionary spend occurs between 22:00 and 04:00', () => {
      const expenses = [
        { date: '2026-08-01T23:30:00Z', amount: 8000, category: 'Shopping' },
        { date: '2026-08-03T01:15:00Z', amount: 6000, category: 'Entertainment' },
        { date: '2026-08-05T14:00:00Z', amount: 2000, category: 'Shopping' },
      ];
      const result = LifestyleHabitEngine.calculateLateNightImpulses(expenses);
      expect(result.lateNightCount).toBe(2);
      expect(result.impulseRatio).toBeGreaterThan(0.25);
      expect(result.isHighRisk).toBe(true);
    });

    it('should return low risk for daytime spending', () => {
      const expenses = [
        { date: '2026-08-01T12:30:00', amount: 5000, category: 'Shopping' },
        { date: '2026-08-03T15:00:00', amount: 4000, category: 'Food & Dining' },
      ];
      const result = LifestyleHabitEngine.calculateLateNightImpulses(expenses);
      expect(result.lateNightCount).toBe(0);
      expect(result.impulseRatio).toBe(0);
      expect(result.isHighRisk).toBe(false);
    });
  });

  describe('Lifestyle Inflation Index (L_inf)', () => {
    it('should compute lifestyle inflation when spending accelerates faster than income', () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const oneTwentyDaysAgo = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000).toISOString();

      const incomes = [
        { date: oneTwentyDaysAgo, amount: 100000 },
        { date: thirtyDaysAgo, amount: 110000 }, // +10% income growth
      ];

      const expenses = [
        { date: oneTwentyDaysAgo, amount: 30000 },
        { date: thirtyDaysAgo, amount: 60000 }, // +100% spend growth
      ];

      const result = LifestyleHabitEngine.calculateLifestyleInflation(expenses, incomes);
      expect(result.isInflating).toBe(true);
      expect(result.inflationRatio).toBeGreaterThan(1.5);
    });
  });

  describe('Master Habit Profile Generator', () => {
    it('should aggregate all metrics into a complete habit profile', () => {
      const incomes = [{ date: '2026-08-01', amount: 100000 }];
      const expenses = [{ date: '2026-08-02', amount: 5000, category: 'Food & Dining' }];

      const profile = LifestyleHabitEngine.generateHabitProfile(expenses, incomes);
      expect(profile).toHaveProperty('habitScore');
      expect(profile.habitScore).toBeGreaterThanOrEqual(20);
      expect(profile.habitScore).toBeLessThanOrEqual(100);
      expect(profile).toHaveProperty('cadence');
      expect(profile).toHaveProperty('euphoria');
      expect(profile).toHaveProperty('lateNight');
      expect(profile).toHaveProperty('inflation');
      expect(Array.isArray(profile.nudges)).toBe(true);
    });
  });
});
