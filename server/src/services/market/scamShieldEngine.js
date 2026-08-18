/**
 * Automated Scam & Ponzi Shield Engine
 * Evaluates investment schemes against empirical fraud parameters, SEBI/RBI regulations,
 * multi-tier affiliate structures, and mathematical return viability.
 * Adheres to ADR-011.
 */
class ScamShieldEngine {
  static evaluateSchemeRisk({
    schemeName = '',
    promisedReturnPercent = 0,
    returnFrequency = 'annual',
    hasReferralCommission = false,
    referralTiers = 0,
    isRegulatedBySebiOrRbi = false,
    investmentMechanism = '',
    lockInMonths = 0,
    exitPenaltyPercent = 0,
  }) {
    let riskScore = 0;
    const redFlags = [];

    // Normalize monthly or daily promised returns to annual percentage rate (APR)
    let annualRate = Number(promisedReturnPercent) || 0;
    if (returnFrequency === 'monthly') annualRate *= 12;
    else if (returnFrequency === 'daily') annualRate *= 365;

    // 1. Guaranteed Unrealistic Return Check
    if (annualRate >= 36) {
      riskScore += 50;
      redFlags.push({
        severity: 'CRITICAL',
        code: 'ASTRONOMICAL_RETURN_PROMISE',
        message: `Promised return of ${annualRate}%/year is mathematically unsustainable and strongly indicative of a Ponzi scheme.`,
      });
    } else if (annualRate > 18) {
      riskScore += 35;
      redFlags.push({
        severity: 'HIGH',
        code: 'UNREALISTIC_GUARANTEED_RETURN',
        message: `Promised return of ${annualRate}%/year significantly exceeds risk-free sovereign benchmarks (6.8%–7.5%) without market volatility.`,
      });
    }

    // 2. MLM / Pyramid Referral Structure Check
    if (hasReferralCommission) {
      riskScore += 25;
      if (referralTiers > 1) {
        riskScore += 15;
        redFlags.push({
          severity: 'CRITICAL',
          code: 'MULTI_TIER_PYRAMID_COMMISSION',
          message: `Scheme features multi-level referral commissions (${referralTiers} tiers). Paying returns from incoming new member deposits is a primary characteristic of Pyramid schemes.`,
        });
      } else {
        redFlags.push({
          severity: 'WARNING',
          code: 'AFFILIATE_REWARD_INCENTIVE',
          message: 'Direct referral commissions incentivize recruitment over underlying asset appreciation.',
        });
      }
    }

    // 3. Regulatory Registration
    if (!isRegulatedBySebiOrRbi) {
      riskScore += 20;
      redFlags.push({
        severity: 'HIGH',
        code: 'UNREGISTERED_COLLECTIVE_SCHEME',
        message: 'Entity is not registered with or regulated by SEBI, RBI, SEC, or national financial authorities.',
      });
    }

    // 4. Opaque / Buzzword Mechanism Check
    const mechanismLower = (investmentMechanism || '').toLowerCase();
    const SUSPICIOUS_BUZZWORDS = ['crypto bot', 'forex auto', 'guaranteed arbitrage', 'doubling', 'matrix', 'ai trading bot 100%'];
    const matchedBuzzwords = SUSPICIOUS_BUZZWORDS.filter((bw) => mechanismLower.includes(bw));
    if (matchedBuzzwords.length > 0) {
      riskScore += 15;
      redFlags.push({
        severity: 'HIGH',
        code: 'OPAQUE_ARBITRAGE_CLAIMS',
        message: `Claims proprietary opaque trading mechanism: "${matchedBuzzwords.join(', ')}".`,
      });
    }

    // 5. Extreme Lock-In or Exit Penalties
    if (exitPenaltyPercent >= 20 || lockInMonths > 60) {
      riskScore += 10;
      redFlags.push({
        severity: 'WARNING',
        code: 'PREDATORY_LIQUIDITY_LOCK',
        message: `High exit penalty (${exitPenaltyPercent}%) or long lock-in (${lockInMonths} months) restricts capital retrieval.`,
      });
    }

    // Cap score at 100
    riskScore = Math.min(100, Math.max(0, riskScore));

    let verdict = 'VERIFIED_REGULATED';
    let recommendation = 'This scheme aligns with standard regulated financial guidelines.';

    if (riskScore >= 70) {
      verdict = 'CRITICAL_PONZI_ALERT';
      recommendation = '🚨 DO NOT INVEST. High probability of fraudulent capital erosion or total loss.';
    } else if (riskScore >= 40) {
      verdict = 'HIGH_RISK_WARNING';
      recommendation = '⚠️ EXTREME CAUTION. Multiple high-risk indicators detected. Demand regulated registration documents.';
    } else if (riskScore >= 20) {
      verdict = 'ELEVATED_CAUTION';
      recommendation = 'Review fee structures, liquidity lock-ins, and underlying credit ratings before depositing.';
    }

    return {
      schemeName: schemeName || 'Unnamed Investment Scheme',
      riskScore,
      annualizedPromisedYield: annualRate,
      verdict,
      isFlagged: riskScore >= 40,
      redFlags,
      recommendation,
      evaluatedAt: new Date().toISOString(),
    };
  }
}

module.exports = ScamShieldEngine;
