/**
 * Debt Amortization Engine
 * Simulates and compares Baseline, Snowball, and Avalanche debt payoff strategies.
 */

class DebtAmortizationEngine {
  /**
   * Run multi-strategy payoff simulation
   * @param {Array} debts - Array of { id, name, principalBalance, interestRate, minimumPayment }
   * @param {number} extraMonthlyBudget - Additional monthly payment amount
   * @returns {Object} { baseline, snowball, avalanche, comparison }
   */
  static simulate({ debts = [], extraMonthlyBudget = 0 }) {
    const activeDebts = debts
      .filter((d) => Number(d.principalBalance) > 0)
      .map((d) => ({
        id: d._id?.toString() || d.id || d.name,
        name: d.name,
        category: d.category || 'Other',
        principalBalance: Number(d.principalBalance),
        interestRate: Number(d.interestRate), // Annual %
        minimumPayment: Number(d.minimumPayment),
      }));

    if (activeDebts.length === 0) {
      return {
        totalDebts: 0,
        totalBalance: 0,
        totalMinimumPayment: 0,
        baseline: { months: 0, totalInterest: 0, debtFreeDate: new Date().toISOString() },
        snowball: { months: 0, totalInterest: 0, debtFreeDate: new Date().toISOString(), schedule: [] },
        avalanche: { months: 0, totalInterest: 0, debtFreeDate: new Date().toISOString(), schedule: [] },
        comparison: { interestSavedWithAvalanche: 0, monthsSavedWithAvalanche: 0 },
      };
    }

    const totalBalance = activeDebts.reduce((sum, d) => sum + d.principalBalance, 0);
    const totalMinimumPayment = activeDebts.reduce((sum, d) => sum + d.minimumPayment, 0);

    const baselineResult = this._runSimulation(activeDebts, 0, 'BASELINE');
    const snowballResult = this._runSimulation(activeDebts, Number(extraMonthlyBudget), 'SNOWBALL');
    const avalancheResult = this._runSimulation(activeDebts, Number(extraMonthlyBudget), 'AVALANCHE');

    return {
      totalDebts: activeDebts.length,
      totalBalance: Math.round(totalBalance * 100) / 100,
      totalMinimumPayment: Math.round(totalMinimumPayment * 100) / 100,
      extraMonthlyBudget: Number(extraMonthlyBudget),
      baseline: baselineResult,
      snowball: snowballResult,
      avalanche: avalancheResult,
      comparison: {
        interestSavedWithSnowball: Math.max(0, Math.round((baselineResult.totalInterest - snowballResult.totalInterest) * 100) / 100),
        interestSavedWithAvalanche: Math.max(0, Math.round((baselineResult.totalInterest - avalancheResult.totalInterest) * 100) / 100),
        monthsSavedWithSnowball: Math.max(0, baselineResult.months - snowballResult.months),
        monthsSavedWithAvalanche: Math.max(0, baselineResult.months - avalancheResult.months),
        snowballVsAvalancheInterestDiff: Math.round((snowballResult.totalInterest - avalancheResult.totalInterest) * 100) / 100,
      },
    };
  }

  /**
   * Internal simulation runner for a single strategy
   * @private
   */
  static _runSimulation(debts, extraPayment, strategy) {
    const state = debts.map((d) => ({
      ...d,
      currentBalance: d.principalBalance,
      isPaidOff: false,
      payoffMonth: 0,
      totalInterestPaid: 0,
    }));

    const maxMonths = 360;
    let currentMonth = 0;
    let totalInterestAccumulated = 0;
    const monthlySummary = [];

    while (state.some((d) => !d.isPaidOff) && currentMonth < maxMonths) {
      currentMonth++;
      let extraAvailable = extraPayment;

      // 1. Accrue monthly interest & apply minimum payments
      state.forEach((d) => {
        if (!d.isPaidOff) {
          const monthlyRate = (d.interestRate / 100) / 12;
          const interestAccrued = d.currentBalance * monthlyRate;
          d.currentBalance += interestAccrued;
          d.totalInterestPaid += interestAccrued;
          totalInterestAccumulated += interestAccrued;

          const minPay = Math.min(d.currentBalance, d.minimumPayment);
          d.currentBalance -= minPay;

          if (d.currentBalance <= 0.01) {
            d.currentBalance = 0;
            d.isPaidOff = true;
            d.payoffMonth = currentMonth;
          }
        } else {
          // Roll over freed minimum payment from previously paid off debts
          extraAvailable += d.minimumPayment;
        }
      });

      // 2. Sort active debts according to strategy to distribute extra cash
      const remainingDebts = state.filter((d) => !d.isPaidOff);

      if (strategy === 'SNOWBALL') {
        remainingDebts.sort((a, b) => a.currentBalance - b.currentBalance);
      } else if (strategy === 'AVALANCHE') {
        remainingDebts.sort((a, b) => b.interestRate - a.interestRate);
      }

      // 3. Apply extra available pool sequentially to priority debt(s)
      for (const d of remainingDebts) {
        if (extraAvailable <= 0) break;

        const extraToApply = Math.min(d.currentBalance, extraAvailable);
        d.currentBalance -= extraToApply;
        extraAvailable -= extraToApply;

        if (d.currentBalance <= 0.01) {
          d.currentBalance = 0;
          d.isPaidOff = true;
          d.payoffMonth = currentMonth;
        }
      }

      if (currentMonth <= 60 || state.every((d) => d.isPaidOff)) {
        const remainingTotal = state.reduce((sum, d) => sum + d.currentBalance, 0);
        monthlySummary.push({
          month: currentMonth,
          remainingBalance: Math.round(remainingTotal * 100) / 100,
          paidOffCount: state.filter((d) => d.isPaidOff).length,
        });
      }
    }

    const now = new Date();
    const debtFreeDate = new Date(now.getFullYear(), now.getMonth() + currentMonth, 1);

    return {
      strategy,
      months: currentMonth,
      debtFreeDate: debtFreeDate.toISOString(),
      totalInterest: Math.round(totalInterestAccumulated * 100) / 100,
      debtPayoffOrder: state.map((d) => ({
        id: d.id,
        name: d.name,
        payoffMonth: d.payoffMonth || currentMonth,
        totalInterestPaid: Math.round(d.totalInterestPaid * 100) / 100,
      })),
      monthlyTrajectory: monthlySummary,
    };
  }
}

module.exports = { DebtAmortizationEngine };
