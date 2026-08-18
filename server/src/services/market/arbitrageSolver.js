/**
 * Debt Prepayment vs. Investment Yield Arbitrage Solver
 * Mathematically determines whether surplus cash flow should be deployed towards
 * debt avalanche liquidation or equity/fixed-income investment.
 * Adheres to ADR-011.
 */
class ArbitrageSolver {
  static solveArbitrage({
    surplusMonthlyCash = 20000,
    debtBalance = 150000,
    debtInterestRatePercent = 14.0, // e.g. Credit Card (36%) or Personal Loan (14%)
    expectedEquityReturnPercent = 12.0, // Expected long term equity CAGR (12%)
    capitalGainsTaxRatePercent = 12.5, // Indian LTCG above 1.25L is 12.5%
    emergencyFundCoveredMonths = 6, // Months of emergency buffer
  }) {
    const netEquityReturn = Number((expectedEquityReturnPercent * (1 - capitalGainsTaxRatePercent / 100)).toFixed(2));
    const effectiveDebtHurdle = Number(debtInterestRatePercent.toFixed(2));
    const arbitrageSpread = Number((effectiveDebtHurdle - netEquityReturn).toFixed(2));

    let allocationStrategy = 'BALANCED_SPLIT';
    let debtPrepayAllocationPercent = 50;
    let investmentAllocationPercent = 50;
    let rationale = '';

    // Rule 1: Emergency buffer check
    if (emergencyFundCoveredMonths < 3) {
      allocationStrategy = 'PRIORITIZE_EMERGENCY_BUFFER';
      debtPrepayAllocationPercent = 30;
      investmentAllocationPercent = 0;
      rationale = `Emergency fund covers only ${emergencyFundCoveredMonths} months (recommended: 6). Direct surplus to liquid emergency reserve before aggressive equity risk.`;
    }
    // Rule 2: High interest debt (> 10% effective) beats equity market hurdle
    else if (effectiveDebtHurdle > netEquityReturn + 1.0) {
      allocationStrategy = 'ACCELERATED_DEBT_AVALANCHE';
      debtPrepayAllocationPercent = 90;
      investmentAllocationPercent = 10;
      rationale = `Guaranteed, risk-free savings of ${effectiveDebtHurdle}% on debt prepayment exceeds post-tax expected equity return of ${netEquityReturn}%. Direct 90% of surplus to debt extinction.`;
    }
    // Rule 3: Low interest debt (< 7.5% e.g. subsidized home loan)
    else if (effectiveDebtHurdle < netEquityReturn - 2.5) {
      allocationStrategy = 'EQUITY_WEALTH_ACCUMULATION';
      debtPrepayAllocationPercent = 20;
      investmentAllocationPercent = 80;
      rationale = `Effective debt interest (${effectiveDebtHurdle}%) is comfortably below post-tax equity CAGR (${netEquityReturn}%). Maintain minimum EMI and invest 80% surplus in compounding assets.`;
    } else {
      allocationStrategy = 'BALANCED_ARBITRAGE';
      debtPrepayAllocationPercent = 50;
      investmentAllocationPercent = 50;
      rationale = `Debt interest (${effectiveDebtHurdle}%) and expected equity yield (${netEquityReturn}%) are closely balanced. Split surplus 50/50 for dual debt reduction and portfolio growth.`;
    }

    const monthlyToDebt = Number(((surplusMonthlyCash * debtPrepayAllocationPercent) / 100).toFixed(2));
    const monthlyToInvest = Number(((surplusMonthlyCash * investmentAllocationPercent) / 100).toFixed(2));
    const estimatedMonthsToDebtFree = monthlyToDebt > 0 ? Math.ceil(debtBalance / monthlyToDebt) : 0;

    return {
      surplusMonthlyCash,
      debtBalance,
      effectiveDebtHurdle,
      netEquityReturn,
      arbitrageSpread,
      allocationStrategy,
      debtPrepayAllocationPercent,
      investmentAllocationPercent,
      monthlyToDebt,
      monthlyToInvest,
      estimatedMonthsToDebtFree,
      rationale,
      solvedAt: new Date().toISOString(),
    };
  }
}

module.exports = ArbitrageSolver;
