/**
 * FIRE (Financial Independence, Retire Early) & Stochastic Monte Carlo Wealth Simulator Engine
 * Implements deterministic What-If scenario delta calculations, Rule-of-25 FIRE milestones,
 * and 1,000-run stochastic Monte Carlo simulations using Box-Muller normal transforms.
 */

class FireSimulatorEngine {
  /**
   * Box-Muller Gaussian Random Variable Generator
   * @param {number} mean - Expected mean return (e.g. 0.115 for 11.5%)
   * @param {number} stdev - Annual volatility standard deviation (e.g. 0.15 for 15%)
   * @returns {number} Normally distributed random return
   */
  static _gaussianRandom(mean = 0, stdev = 1) {
    let u1 = 0;
    let u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdev;
  }

  /**
   * Calculate What-If Scenario Impact on Wealth Trajectory
   * @param {Object} params
   * @param {number} params.currentMonthlyIncome
   * @param {number} params.currentMonthlyExpense
   * @param {number} params.currentNetWorth
   * @param {number} params.deltaIncome - Change in monthly income (e.g. +15000 for hike)
   * @param {number} params.deltaExpense - Change in monthly expense (e.g. +8000 for rent hike or -5000 for savings)
   * @param {number} params.deltaOneTime - One-time lump sum injection or expense
   * @param {number} params.annualReturnPct - Expected annual investment return % (default 11.5%)
   * @returns {Object} Comparative trajectory over 1, 3, 5, 10, 20 years
   */
  static calculateWhatIf({
    currentMonthlyIncome = 100000,
    currentMonthlyExpense = 50000,
    currentNetWorth = 500000,
    deltaIncome = 0,
    deltaExpense = 0,
    deltaOneTime = 0,
    annualReturnPct = 11.5,
  }) {
    const monthlyRate = (annualReturnPct / 100) / 12;

    const baseMonthlySavings = Math.max(0, currentMonthlyIncome - currentMonthlyExpense);
    const newMonthlySavings = Math.max(0, (currentMonthlyIncome + deltaIncome) - (currentMonthlyExpense + deltaExpense));
    const monthlySavingsDelta = newMonthlySavings - baseMonthlySavings;

    const timeframes = [1, 3, 5, 10, 20];
    const projections = timeframes.map((years) => {
      const months = years * 12;

      // Future Value: FV = PV*(1+r)^n + PMT * [((1+r)^n - 1) / r]
      let baseFV = currentNetWorth * Math.pow(1 + monthlyRate, months);
      if (monthlyRate > 0) {
        baseFV += baseMonthlySavings * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      } else {
        baseFV += baseMonthlySavings * months;
      }

      let newFV = (currentNetWorth + deltaOneTime) * Math.pow(1 + monthlyRate, months);
      if (monthlyRate > 0) {
        newFV += newMonthlySavings * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
      } else {
        newFV += newMonthlySavings * months;
      }

      return {
        years,
        baseNetWorth: Math.round(baseFV),
        scenarioNetWorth: Math.round(newFV),
        netGain: Math.round(newFV - baseFV),
      };
    });

    return {
      baseMonthlySavings: Math.round(baseMonthlySavings),
      newMonthlySavings: Math.round(newMonthlySavings),
      monthlySavingsDelta: Math.round(monthlySavingsDelta),
      projections,
    };
  }

  /**
   * Calculate Rule-of-25 FIRE Milestones & Target Corpus
   * @param {Object} params
   * @param {number} params.monthlyIncome
   * @param {number} params.monthlyExpense
   * @param {number} params.currentSavings
   * @param {number} params.annualReturnPct (default 11.5%)
   * @param {number} params.inflationPct (default 6.0%)
   * @returns {Object} FIRE target numbers and estimated timeline
   */
  static calculateFireMilestones({
    monthlyIncome = 100000,
    monthlyExpense = 50000,
    currentSavings = 500000,
    annualReturnPct = 11.5,
    inflationPct = 6.0,
  }) {
    const annualExpenses = monthlyExpense * 12;
    const monthlySavings = Math.max(0, monthlyIncome - monthlyExpense);
    const savingsRate = monthlyIncome > 0 ? Math.round((monthlySavings / monthlyIncome) * 10000) / 100 : 0;

    // Real rate of return adjusted for inflation: (1 + r) / (1 + i) - 1
    const realReturnRate = ((1 + annualReturnPct / 100) / (1 + inflationPct / 100)) - 1;
    const realMonthlyRate = realReturnRate / 12;

    // 1. Lean FIRE (20x annual expenses - 5% SWR)
    const leanFireNumber = Math.round(annualExpenses * 20);

    // 2. Standard FIRE (25x annual expenses - 4% SWR Rule of 25)
    const standardFireNumber = Math.round(annualExpenses * 25);

    // 3. Fat FIRE (33x annual expenses - 3% SWR Ultra Conservative)
    const fatFireNumber = Math.round(annualExpenses * 33);

    // Coast FIRE: Amount needed today at real return to hit Standard FIRE at age 60 without further contributions
    const yearsTo60 = 30;
    const coastFireNumber = Math.round(standardFireNumber / Math.pow(1 + realReturnRate, yearsTo60));

    // Calculate months to reach Standard FIRE with current monthly savings
    let monthsToFire = 0;
    let accumulated = currentSavings;
    const maxMonths = 600; // 50 years

    while (accumulated < standardFireNumber && monthsToFire < maxMonths) {
      monthsToFire++;
      accumulated = accumulated * (1 + realMonthlyRate) + monthlySavings;
    }

    const yearsToFire = Math.round((monthsToFire / 12) * 10) / 10;
    const now = new Date();
    const fireDate = new Date(now.getFullYear(), now.getMonth() + monthsToFire, 1);

    return {
      annualExpenses: Math.round(annualExpenses),
      monthlySavings: Math.round(monthlySavings),
      savingsRate,
      milestones: {
        leanFire: { multiplier: '20x (5% SWR)', target: leanFireNumber },
        standardFire: { multiplier: '25x (4% SWR)', target: standardFireNumber },
        fatFire: { multiplier: '33x (3% SWR)', target: fatFireNumber },
        coastFire: { target: coastFireNumber, isCoastAchieved: currentSavings >= coastFireNumber },
      },
      currentProgressPct: standardFireNumber > 0 ? Math.min(100, Math.round((currentSavings / standardFireNumber) * 1000) / 10) : 0,
      yearsToFire,
      fireDate: fireDate.toISOString(),
    };
  }

  /**
   * Run 1,000-Iteration Stochastic Monte Carlo Wealth Simulation
   * @param {Object} params
   * @param {number} params.currentNetWorth
   * @param {number} params.monthlyContribution
   * @param {number} params.years (default 25)
   * @param {number} params.expectedReturn (default 11.5%)
   * @param {number} params.volatility (default 15.0%)
   * @param {number} params.inflation (default 6.0%)
   * @param {number} params.runs (default 1000)
   * @returns {Object} Percentile curves (P10, P50, P90)
   */
  static runMonteCarloSimulation({
    currentNetWorth = 500000,
    monthlyContribution = 30000,
    years = 25,
    expectedReturn = 11.5,
    volatility = 15.0,
    inflation = 6.0,
    runs = 1000,
  }) {
    const realMeanReturn = ((1 + expectedReturn / 100) / (1 + inflation / 100)) - 1;
    const realVolatility = volatility / 100;
    const annualContribution = monthlyContribution * 12;

    // Matrix of results: runs x years
    const allPaths = [];

    for (let r = 0; r < runs; r++) {
      let balance = currentNetWorth;
      const path = [balance];

      for (let y = 1; y <= years; y++) {
        // Sample annual return from normal distribution
        const annualShock = this._gaussianRandom(realMeanReturn, realVolatility);
        balance = balance * (1 + annualShock) + annualContribution;
        if (balance < 0) balance = 0;
        path.push(Math.round(balance));
      }
      allPaths.push(path);
    }

    // Extract percentiles for each year: P10 (conservative/bear), P50 (median), P90 (optimistic/bull)
    const percentileCurve = [];

    for (let y = 0; y <= years; y++) {
      const yearValues = allPaths.map((p) => p[y]);
      yearValues.sort((a, b) => a - b);

      const p10Idx = Math.floor(runs * 0.10);
      const p50Idx = Math.floor(runs * 0.50);
      const p90Idx = Math.floor(runs * 0.90);

      percentileCurve.push({
        year: y,
        bearish_P10: yearValues[p10Idx],
        median_P50: yearValues[p50Idx],
        bullish_P90: yearValues[p90Idx],
      });
    }

    return {
      runs,
      years,
      initialNetWorth: currentNetWorth,
      monthlyContribution,
      finalYearMetrics: {
        conservative_P10: percentileCurve[years].bearish_P10,
        median_P50: percentileCurve[years].median_P50,
        optimistic_P90: percentileCurve[years].bullish_P90,
      },
      trajectory: percentileCurve,
    };
  }
}

module.exports = { FireSimulatorEngine };
