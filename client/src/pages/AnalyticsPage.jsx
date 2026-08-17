import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, TrendingDown, ArrowUpRight, ShieldCheck, Flame, PieChart, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../api/client';
import { FinancialHealthCard } from '../components/Dashboard/FinancialHealthCard';

export const AnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/analytics');
      setAnalytics(res);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !analytics) {
    return (
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <h2 className="heading-lg" style={{ color: 'var(--color-text-main)' }}>Aggregating Deep Financial Telemetry...</h2>
      </div>
    );
  }

  const { monthlyComparison, categoryBreakdown, anomalies, financialHealth } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <h1 className="heading-xl">Analytics & Trajectory Engine</h1>
        <p className="body-sm" style={{ color: 'var(--color-text-muted)', marginTop: '2px' }}>
          Deep mathematical telemetry, month-over-month variances, and predictive velocity models.
        </p>
      </div>

      {/* Financial Health Index 5-Pillar Scorecard */}
      {financialHealth && (
        <FinancialHealthCard healthData={financialHealth} />
      )}

      {/* AI Spending Explanation Banner */}
      {explanation && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="glass-card"
          style={{
            padding: '24px 28px',
            background: 'linear-gradient(135deg, rgba(121, 40, 202, 0.2) 0%, rgba(10, 13, 20, 0.85) 100%)',
            border: '1px solid rgba(121, 40, 202, 0.35)',
            boxShadow: 'var(--shadow-glow-violet)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Sparkles size={20} color="#00FF87" />
            <h3 className="heading-lg" style={{ color: '#F1F5F9' }}>
              "Why Did My Spending Change?" AI Rationale
            </h3>
          </div>

          <div className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>
            ₹{monthlyComparison.difference.toLocaleString()}
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
            {monthlyComparison.isIncrease
              ? `You've spent ₹${monthlyComparison.difference.toLocaleString()} more compared to the same calendar window last month.`
              : `Spend has decreased by ₹${Math.abs(monthlyComparison.difference).toLocaleString()} compared to last month.`}
          </p>
        </div>

        {/* Velocity Ratio Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Spending Velocity Ratio</span>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                background: spendingVelocity.velocityRatio > 1.1 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                border: `1px solid ${spendingVelocity.velocityRatio > 1.1 ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                color: spendingVelocity.velocityRatio > 1.1 ? '#FBBF24' : '#00FF87',
              }}
            >
              {spendingVelocity.velocityRatio}x
            </span>
          </div>

          <div className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '8px' }}>
            ₹{spendingVelocity.averageSpendPerDay?.toLocaleString()}/day
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
            {spendingVelocity.velocityRatio > 1.0
              ? 'Current spending is progressing faster than the uniform linear monthly distribution rate.'
              : 'Pacing is consistent with normal monthly distribution.'}
          </p>
        </div>

        {/* Projected Total Outflow */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-muted)' }}>Projected Outflow</span>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.35)',
                color: '#22D3EE',
              }}
            >
              Month-End Model
            </span>
          </div>

          <div className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: '#00FF87', marginBottom: '8px' }}>
            ₹{spendingVelocity.projectedMonthEndSpend?.toLocaleString()}
          </div>

          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
            Estimated final monthly figure assuming current velocity remains stable over remaining {monthlySummary.daysRemaining} days.
          </p>
        </div>
      </div>

      {/* Category Contribution Table */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 className="heading-md" style={{ color: 'var(--color-text-main)', marginBottom: '16px' }}>Category Variance & Contribution</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--color-text-muted)', fontSize: '12.5px' }}>
              <th style={{ padding: '10px' }}>Category</th>
              <th style={{ padding: '10px' }}>Monthly Spend</th>
              <th style={{ padding: '10px' }}>Percentage</th>
              <th style={{ padding: '10px' }}>Trajectory Status</th>
            </tr>
          </thead>
          <tbody>
            {categoryBreakdown.breakdown.map((c) => (
              <tr key={c.category} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                <td style={{ padding: '12px 10px', fontWeight: 700, color: 'var(--color-text-main)' }}>{c.category}</td>
                <td style={{ padding: '12px 10px', fontWeight: 800, color: '#00FF87', fontFamily: 'var(--font-display)' }}>₹{c.amount.toLocaleString()}</td>
                <td style={{ padding: '12px 10px', color: 'var(--color-text-muted)' }}>{c.percentage}%</td>
                <td style={{ padding: '12px 10px' }}>
                  <span
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      background: c.percentage > 35 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: c.percentage > 35 ? '#FBBF24' : '#00FF87',
                    }}
                  >
                    {c.percentage > 35 ? 'Heavy Concentration' : 'Balanced'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
