/**
 * Quantitative Financial Valuation Engine
 * Deterministic implementations of Discounted Cash Flow (DCF),
 * Piotroski 9-Point F-Score, and Altman Z-Score Bankruptcy Model.
 * Adheres to ADR-001 and ADR-011.
 */
class QuantitativeEngine {
  /**
   * Two-Stage Discounted Cash Flow (DCF) Valuation Model
   */
  static calculateDCF({
    currentFCF = 1000,
    growthRateStage1 = 0.12, // Years 1-5 growth (e.g. 12%)
    growthRateStage2 = 0.08, // Years 6-10 growth (e.g. 8%)
    discountRateWACC = 0.10, // Discount rate (e.g. 10%)
    terminalGrowthRate = 0.04, // Long term GDP growth (e.g. 4%)
    sharesOutstanding = 100, // In millions
    netDebt = 200, // Total Debt minus Cash
    currentPrice = 120, // Current market price per share
  }) {
    const fcfProjection = [];
    let prevFCF = currentFCF;
    let sumPvFCF = 0;

    // 10-year projected cash flows
    for (let year = 1; year <= 10; year++) {
      const growth = year <= 5 ? growthRateStage1 : growthRateStage2;
      const projectedFCF = prevFCF * (1 + growth);
      const discountFactor = Math.pow(1 + discountRateWACC, year);
      const presentValue = projectedFCF / discountFactor;

      sumPvFCF += presentValue;
      fcfProjection.push({
        year,
        growthRate: growth,
        projectedFCF: Number(projectedFCF.toFixed(2)),
        presentValue: Number(presentValue.toFixed(2)),
      });
      prevFCF = projectedFCF;
    }

    // Terminal Value calculation (Gordon Growth Model)
    const year10FCF = prevFCF;
    const terminalValue = (year10FCF * (1 + terminalGrowthRate)) / (discountRateWACC - terminalGrowthRate);
    const pvTerminalValue = terminalValue / Math.pow(1 + discountRateWACC, 10);

    const enterpriseValue = sumPvFCF + pvTerminalValue;
    const equityValue = enterpriseValue - netDebt;
    const fairValuePerShare = sharesOutstanding > 0 ? Number((equityValue / sharesOutstanding).toFixed(2)) : 0;

    const marginOfSafetyPercent = currentPrice > 0
      ? Number((((fairValuePerShare - currentPrice) / currentPrice) * 100).toFixed(2))
      : 0;

    return {
      fairValuePerShare,
      currentPrice,
      marginOfSafetyPercent,
      isUndervalued: fairValuePerShare > currentPrice,
      valuationVerdict: fairValuePerShare > currentPrice * 1.2
        ? 'STRONG_UNDERVALUATION'
        : fairValuePerShare > currentPrice
        ? 'FAIRLY_VALUED_DISCOUNT'
        : 'OVERVALUED_PREMIUM',
      enterpriseValue: Number(enterpriseValue.toFixed(2)),
      equityValue: Number(equityValue.toFixed(2)),
      pvTerminalValue: Number(pvTerminalValue.toFixed(2)),
      fcfProjection,
    };
  }

  /**
   * Piotroski 9-Point F-Score
   */
  static calculatePiotroskiFScore({
    netIncomePositive = true,
    operatingCashFlowPositive = true,
    higherRoaYoY = true,
    cashFlowGreaterThanNetIncome = true,
    lowerLongTermDebtRatio = true,
    higherCurrentRatio = true,
    noDilutionOfShares = true,
    higherGrossMarginYoY = true,
    higherAssetTurnoverYoY = true,
  }) {
    let score = 0;
    const breakdown = {
      profitability: 0,
      leverageAndLiquidity: 0,
      operatingEfficiency: 0,
    };

    if (netIncomePositive) { score++; breakdown.profitability++; }
    if (operatingCashFlowPositive) { score++; breakdown.profitability++; }
    if (higherRoaYoY) { score++; breakdown.profitability++; }
    if (cashFlowGreaterThanNetIncome) { score++; breakdown.profitability++; }

    if (lowerLongTermDebtRatio) { score++; breakdown.leverageAndLiquidity++; }
    if (higherCurrentRatio) { score++; breakdown.leverageAndLiquidity++; }
    if (noDilutionOfShares) { score++; breakdown.leverageAndLiquidity++; }

    if (higherGrossMarginYoY) { score++; breakdown.operatingEfficiency++; }
    if (higherAssetTurnoverYoY) { score++; breakdown.operatingEfficiency++; }

    return {
      fScore: score,
      maxScore: 9,
      breakdown,
      strength: score >= 8 ? 'VERY_STRONG' : score >= 5 ? 'MODERATE' : 'WEAK_CONCERNING',
    };
  }

  /**
   * Altman Z-Score Model for Bankruptcy Prediction
   */
  static calculateAltmanZScore({
    workingCapital = 500,
    retainedEarnings = 1200,
    ebit = 400,
    marketCap = 5000,
    sales = 3000,
    totalAssets = 4000,
    totalLiabilities = 1500,
  }) {
    if (!totalAssets || totalAssets <= 0 || !totalLiabilities || totalLiabilities <= 0) {
      return { zScore: 0, zone: 'INSUFFICIENT_DATA' };
    }

    const x1 = workingCapital / totalAssets;
    const x2 = retainedEarnings / totalAssets;
    const x3 = ebit / totalAssets;
    const x4 = marketCap / totalLiabilities;
    const x5 = sales / totalAssets;

    const zScore = Number((1.2 * x1 + 1.4 * x2 + 3.3 * x3 + 0.6 * x4 + 0.999 * x5).toFixed(2));

    let zone = 'SAFE';
    let description = 'Financially sound with negligible default risk.';

    if (zScore < 1.81) {
      zone = 'DISTRESS';
      description = 'High probability of financial distress or insolvency within 2 years.';
    } else if (zScore <= 2.99) {
      zone = 'GREY';
      description = 'Moderate financial stability; cautious monitoring advised.';
    }

    return {
      zScore,
      zone,
      description,
      coefficients: { x1, x2, x3, x4, x5 },
    };
  }
}

module.exports = QuantitativeEngine;
