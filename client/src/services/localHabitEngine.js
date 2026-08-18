/**
 * Client-Side Local Habit Engine
 * Mirror of LifestyleHabitEngine for 100% on-device offline calculation.
 * Adheres to ADR-008.
 */

export const calculateLocalHabitProfile = (expenses = [], incomes = []) => {
  // 1. Cadence
  const sortedIncomes = [...incomes].sort((a, b) => new Date(a.date) - new Date(b.date));
  let cv = 0.05;
  let cadenceType = 'SALARIED_FIXED';

  if (sortedIncomes.length >= 2) {
    const intervals = [];
    for (let i = 1; i < sortedIncomes.length; i++) {
      const diffMs = Math.abs(new Date(sortedIncomes[i].date) - new Date(sortedIncomes[i - 1].date));
      intervals.push(Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24))));
    }
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / intervals.length;
    cv = mean > 0 ? Number((Math.sqrt(variance) / mean).toFixed(3)) : 0;
    if (cv >= 0.4) cadenceType = 'IRREGULAR_GIG';
    else if (cv >= 0.15) cadenceType = 'SEMI_REGULAR';
  }

  // 2. Late Night Impulses
  const DISCRETIONARY = ['shopping', 'entertainment', 'food & dining', 'subscriptions', 'general'];
  let totalDiscretionary = 0;
  let lateNightSpend = 0;
  let lateNightCount = 0;

  expenses.forEach((exp) => {
    const cat = (exp.category || 'General').toLowerCase();
    const amount = Number(exp.amount) || 0;
    if (DISCRETIONARY.includes(cat)) {
      totalDiscretionary += amount;
      const d = new Date(exp.date);
      const h = d.getHours();
      const utcH = d.getUTCHours();
      if ((h >= 22 || h < 4) || (utcH >= 22 || utcH < 4)) {
        lateNightSpend += amount;
        lateNightCount++;
      }
    }
  });

  const lateNightRatio = totalDiscretionary > 0 ? Number((lateNightSpend / totalDiscretionary).toFixed(2)) : 0;
  const isHighLateNightRisk = lateNightRatio > 0.25;

  // 3. Score
  let score = 88;
  if (isHighLateNightRisk) score -= 15;
  if (cadenceType === 'IRREGULAR_GIG') score -= 10;
  score = Math.max(20, Math.min(100, score));

  const nudges = [];
  if (isHighLateNightRisk) {
    nudges.push({
      id: 'nudge-latenight',
      title: 'Late-Night Guardrail Active',
      text: `${Math.round(lateNightRatio * 100)}% of discretionary shopping occurs between 10 PM and 4 AM. Turn on a 24h cooling off window.`,
      type: 'alert',
    });
  } else {
    nudges.push({
      id: 'nudge-optimal',
      title: 'Healthy Financial Discipline',
      text: 'Spending rhythm is balanced with zero impulse anomalies detected this cycle.',
      type: 'success',
    });
  }

  return {
    habitScore: score,
    cadence: { cadenceType, coefficientOfVariation: cv },
    lateNight: { lateNightSpend, impulseRatio: lateNightRatio, isHighRisk: isHighLateNightRisk, lateNightCount },
    nudges,
  };
};
