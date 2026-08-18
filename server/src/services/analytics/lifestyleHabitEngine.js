/**
 * Lifestyle & Habit Learning Analytics Engine
 * Pure mathematical algorithms for behavioral financial profiling:
 * - Income Cadence & Irregularity Coefficient (Cv)
 * - Payday Euphoria Decay Curve (λ)
 * - Late-Night Impulse Buying Ratio (I_night)
 * - Lifestyle Inflation Index (L_inf)
 * - Deterministic Behavioral Nudges
 *
 * Adheres to ADR-008 and ADR-001 (Deterministic Javascript Math, Zero Hallucinations).
 */

class LifestyleHabitEngine {
  /**
   * Calculate Income Cadence and Irregularity Coefficient (Cv = σ / μ)
   */
  static calculateIncomeCadence(incomes = []) {
    if (!Array.isArray(incomes) || incomes.length < 2) {
      return {
        cadenceType: 'SALARIED_FIXED',
        coefficientOfVariation: 0.05,
        averageIntervalDays: 30,
        isPredictable: true,
        description: 'Predictable recurring monthly cash flow.',
      };
    }

    // Sort incomes chronologically
    const sorted = [...incomes].sort((a, b) => new Date(a.date) - new Date(b.date));
    const intervals = [];

    for (let i = 1; i < sorted.length; i++) {
      const diffMs = Math.abs(new Date(sorted[i].date) - new Date(sorted[i - 1].date));
      const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
      intervals.push(diffDays);
    }

    const meanInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((acc, val) => acc + Math.pow(val - meanInterval, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    const cv = meanInterval > 0 ? Number((stdDev / meanInterval).toFixed(3)) : 0;

    let cadenceType = 'SALARIED_FIXED';
    let description = 'Regular fixed income rhythm (Salaried).';

    if (cv >= 0.4) {
      cadenceType = 'IRREGULAR_GIG';
      description = 'High cash flow variance (Gig Economy / Freelance). Buffer fund strongly recommended.';
    } else if (cv >= 0.15) {
      cadenceType = 'SEMI_REGULAR';
      description = 'Semi-variable income cadence with periodic fluctuations.';
    }

    return {
      cadenceType,
      coefficientOfVariation: cv,
      averageIntervalDays: Math.round(meanInterval),
      isPredictable: cv < 0.25,
      description,
    };
  }

  /**
   * Calculate Payday Euphoria Decay Rate (λ)
   * Evaluates if spending surges within 72 hours of income receipt.
   */
  static calculatePaydayEuphoria(expenses = [], incomes = []) {
    if (!expenses.length || !incomes.length) {
      return {
        hasEuphoriaSpike: false,
        decayLambda: 0.1,
        day0SurgeRatio: 1.0,
        surgeSeverity: 'LOW',
        nudge: 'Spending pace remains steady throughout the month.',
      };
    }

    const incomeDates = incomes.map((inc) => new Date(inc.date).getTime());
    const postPaydaySpend = { day0: 0, day1: 0, day2: 0, day3: 0, rest: 0 };
    let totalSpend = 0;

    expenses.forEach((exp) => {
      const expTime = new Date(exp.date).getTime();
      const amount = Number(exp.amount) || 0;
      totalSpend += amount;

      // Find closest prior income event
      const priorIncomes = incomeDates.filter((t) => t <= expTime);
      if (priorIncomes.length > 0) {
        const lastIncomeTime = Math.max(...priorIncomes);
        const daysDiff = (expTime - lastIncomeTime) / (1000 * 60 * 60 * 24);

        if (daysDiff >= 0 && daysDiff < 1) postPaydaySpend.day0 += amount;
        else if (daysDiff >= 1 && daysDiff < 2) postPaydaySpend.day1 += amount;
        else if (daysDiff >= 2 && daysDiff < 3) postPaydaySpend.day2 += amount;
        else if (daysDiff >= 3 && daysDiff < 4) postPaydaySpend.day3 += amount;
        else postPaydaySpend.rest += amount;
      } else {
        postPaydaySpend.rest += amount;
      }
    });

    const averageDailyBaseline = totalSpend / Math.max(1, expenses.length);
    const day0Ratio = averageDailyBaseline > 0 ? Number((postPaydaySpend.day0 / averageDailyBaseline).toFixed(2)) : 1.0;

    // Exponential decay parameter estimation: lambda ≈ ln(day0 / day3) / 3
    let lambda = 0.15;
    if (postPaydaySpend.day0 > 0 && postPaydaySpend.day3 > 0) {
      lambda = Number((Math.log(Math.max(1, postPaydaySpend.day0 / postPaydaySpend.day3)) / 3).toFixed(2));
    }

    const hasEuphoriaSpike = day0Ratio > 2.2 && (postPaydaySpend.day0 + postPaydaySpend.day1) > (totalSpend * 0.35);
    let surgeSeverity = 'LOW';
    let nudge = 'Healthy spending distribution across your billing cycle.';

    if (hasEuphoriaSpike) {
      surgeSeverity = day0Ratio > 3.5 ? 'CRITICAL' : 'MODERATE';
      nudge = `High Payday Euphoria detected: You spend ${day0Ratio}x your daily average within 48h of receiving salary. Consider setting a 48-hour cooling off window on non-essential purchases.`;
    }

    return {
      hasEuphoriaSpike,
      decayLambda: lambda,
      day0SurgeRatio: day0Ratio,
      surgeSeverity,
      postPaydayDistribution: postPaydaySpend,
      nudge,
    };
  }

  /**
   * Calculate Late-Night Impulse Buying Ratio (I_night)
   * Tracks discretionary spending between 22:00 and 04:00.
   */
  static calculateLateNightImpulses(expenses = []) {
    const DISCRETIONARY_CATEGORIES = ['Shopping', 'Entertainment', 'Food & Dining', 'Subscriptions', 'General'];
    let totalDiscretionary = 0;
    let lateNightDiscretionary = 0;
    let lateNightCount = 0;

    expenses.forEach((exp) => {
      const category = exp.category || 'General';
      const isDiscretionary = DISCRETIONARY_CATEGORIES.some((c) => c.toLowerCase() === category.toLowerCase());
      const amount = Number(exp.amount) || 0;

      if (isDiscretionary) {
        totalDiscretionary += amount;
        const dateObj = new Date(exp.date);
        const hour = dateObj.getHours();
        const utcHour = dateObj.getUTCHours();

        // 22:00 (10 PM) to 04:00 (4 AM) in local or UTC timestamp
        if ((hour >= 22 || hour < 4) || (utcHour >= 22 || utcHour < 4)) {
          lateNightDiscretionary += amount;
          lateNightCount++;
        }
      }
    });

    const ratio = totalDiscretionary > 0 ? Number((lateNightDiscretionary / totalDiscretionary).toFixed(3)) : 0;
    const isHighRisk = ratio > 0.25;

    let nudge = 'Minimal late-night spending detected. Great financial impulse control!';
    if (isHighRisk) {
      nudge = `${Math.round(ratio * 100)}% of your discretionary spending occurs between 10 PM and 4 AM (${lateNightCount} purchases). Late-night dopamine shopping is increasing your monthly burn.`;
    }

    return {
      lateNightSpendAmount: lateNightDiscretionary,
      discretionaryTotalAmount: totalDiscretionary,
      impulseRatio: ratio,
      lateNightCount,
      isHighRisk,
      nudge,
    };
  }

  /**
   * Calculate Lifestyle Inflation Index (L_inf)
   * Compares discretionary spending growth relative to income growth.
   */
  static calculateLifestyleInflation(expenses = [], incomes = []) {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const oneEightyDaysAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    const recentIncomes = incomes.filter((i) => new Date(i.date) >= ninetyDaysAgo);
    const priorIncomes = incomes.filter((i) => new Date(i.date) >= oneEightyDaysAgo && new Date(i.date) < ninetyDaysAgo);

    const recentExpenses = expenses.filter((e) => new Date(e.date) >= ninetyDaysAgo);
    const priorExpenses = expenses.filter((e) => new Date(e.date) >= oneEightyDaysAgo && new Date(e.date) < ninetyDaysAgo);

    const sumRecentIncome = recentIncomes.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);
    const sumPriorIncome = priorIncomes.reduce((acc, i) => acc + (Number(i.amount) || 0), 0);

    const sumRecentSpend = recentExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
    const sumPriorSpend = priorExpenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

    // If historical baseline is insufficient, return standard baseline
    if (sumPriorIncome === 0 || sumPriorSpend === 0) {
      return {
        inflationRatio: 1.0,
        isInflating: false,
        severity: 'STABLE',
        incomeGrowthPercent: 0,
        spendGrowthPercent: 0,
        nudge: 'Consistent cash flow baseline. Continue logging for long-term lifestyle inflation tracking.',
      };
    }

    const incomeGrowth = (sumRecentIncome - sumPriorIncome) / sumPriorIncome;
    const spendGrowth = (sumRecentSpend - sumPriorSpend) / sumPriorSpend;

    let inflationRatio = 1.0;
    if (incomeGrowth > 0) {
      inflationRatio = Number((spendGrowth / incomeGrowth).toFixed(2));
    } else {
      inflationRatio = spendGrowth > 0 ? 1.5 : 0.8;
    }

    const isInflating = inflationRatio > 1.15 && spendGrowth > 0.08;
    let severity = 'STABLE';
    let nudge = 'Your spending is growing proportionally with your income. Wealth accumulation is intact.';

    if (isInflating) {
      severity = inflationRatio > 1.5 ? 'SEVERE' : 'MODERATE';
      nudge = `Warning: Lifestyle Inflation Index is ${inflationRatio}x. Your spending is accelerating faster than your income growth. Divert increments to automated investments before upgrading discretionary lifestyle.`;
    }

    return {
      inflationRatio,
      isInflating,
      severity,
      incomeGrowthPercent: Number((incomeGrowth * 100).toFixed(1)),
      spendGrowthPercent: Number((spendGrowth * 100).toFixed(1)),
      nudge,
    };
  }

  /**
   * Master Habit Profile Generator combining all mathematical signals
   */
  static generateHabitProfile(expenses = [], incomes = []) {
    const cadence = this.calculateIncomeCadence(incomes);
    const euphoria = this.calculatePaydayEuphoria(expenses, incomes);
    const lateNight = this.calculateLateNightImpulses(expenses);
    const inflation = this.calculateLifestyleInflation(expenses, incomes);

    // Calculate Sovereign Habit Health Score (0 - 100)
    let score = 85;
    if (euphoria.hasEuphoriaSpike) score -= 15;
    if (lateNight.isHighRisk) score -= 15;
    if (inflation.isInflating) score -= 20;
    if (!cadence.isPredictable) score -= 5;
    score = Math.max(20, Math.min(100, score));

    const nudges = [];
    if (euphoria.hasEuphoriaSpike) {
      nudges.push({ id: 'nudge-euphoria', title: 'Payday Cooling Off', text: euphoria.nudge, type: 'warning' });
    }
    if (lateNight.isHighRisk) {
      nudges.push({ id: 'nudge-latenight', title: 'Late-Night Guardrail', text: lateNight.nudge, type: 'alert' });
    }
    if (inflation.isInflating) {
      nudges.push({ id: 'nudge-inflation', title: 'Lifestyle Inflation Alert', text: inflation.nudge, type: 'critical' });
    }
    if (nudges.length === 0) {
      nudges.push({
        id: 'nudge-optimal',
        title: 'Sovereign Discipline',
        text: 'Your spending cadence is optimal with zero impulse leaks and disciplined compounding.',
        type: 'success',
      });
    }

    return {
      habitScore: score,
      cadence,
      euphoria,
      lateNight,
      inflation,
      nudges,
      evaluatedAt: new Date().toISOString(),
    };
  }
}

module.exports = LifestyleHabitEngine;
