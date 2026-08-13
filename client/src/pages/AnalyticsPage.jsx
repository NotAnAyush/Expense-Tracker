import React, { useState, useEffect } from 'react';
import { Sparkles, AlertOctagon } from 'lucide-react';
import { apiFetch } from '../api/client';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [analyticsRes, explanationRes] = await Promise.all([
        apiFetch('/analytics'),
        apiFetch('/ai/explanation').catch(() => null),
      ]);
      setData(analyticsRes);
      if (explanationRes) setExplanation(explanationRes);
    } catch (err) {
      console.error('Failed to load analytics engine:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <div style={{ padding: '64px', textAlign: 'center', color: 'var(--color-muted-text)' }} className="body-md">Computing Financial Analytics Engine...</div>;
  }

  const { monthlyComparison, categoryBreakdown, anomalies } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 className="heading-xl">Analytics Engine</h1>
        <p className="body-sm" style={{ color: 'var(--color-muted-text)' }}>Statistical MoM comparison, category change deltas, and statistical anomaly detection.</p>
      </div>

      {/* AI Spending Explanation Banner */}
      {explanation && (
        <div className="pin-card-large">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Sparkles size={22} color="var(--color-accent)" />
            <h3 className="heading-lg">"Why Did My Spending Change?" AI Rationale</h3>
          </div>
          <p className="body-md" style={{ fontSize: '18px', color: 'var(--color-foreground)', lineHeight: 1.5 }}>
            "{explanation.explanation}"
          </p>
        </div>
      )}

      {/* MoM Category Deltas */}
      <div className="pin-card" style={{ padding: '24px' }}>
        <h3 className="heading-md" style={{ marginBottom: '16px' }}>Month-Over-Month Category Changes</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '15px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-muted-text)', fontSize: '14px' }}>
              <th style={{ padding: '12px 8px' }}>Category</th>
              <th style={{ padding: '12px 8px' }}>Current Month</th>
              <th style={{ padding: '12px 8px' }}>Previous Month</th>
              <th style={{ padding: '12px 8px', textAlign: 'right' }}>Change Delta</th>
            </tr>
          </thead>
          <tbody>
            {monthlyComparison.categoryDeltas.map((cat, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '14px 8px' }} className="body-strong">{cat.category}</td>
                <td style={{ padding: '14px 8px' }}>₹{cat.currentAmount.toLocaleString()}</td>
                <td style={{ padding: '14px 8px', color: 'var(--color-muted-text)' }} className="body-sm">₹{cat.previousAmount.toLocaleString()}</td>
                <td style={{ padding: '14px 8px', textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-heading)', color: cat.diff > 0 ? 'var(--color-destructive)' : 'var(--color-accent)' }}>
                  {cat.diff > 0 ? `+₹${cat.diff.toLocaleString()}` : `-₹${Math.abs(cat.diff).toLocaleString()}`} ({cat.changePercent}%)
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Flagged Anomalies */}
      <div className="pin-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <AlertOctagon size={22} color="var(--color-destructive)" />
          <h3 className="heading-md">Statistical Anomaly Detection</h3>
        </div>

        {anomalies.anomalies.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {anomalies.anomalies.map((anom, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-secondary)', border: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="body-strong" style={{ color: 'var(--color-foreground)' }}>{anom.title}</div>
                  <div className="body-sm" style={{ marginTop: '2px', color: 'var(--color-muted-text)' }}>{anom.reason}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--color-foreground)', fontSize: '18px', fontFamily: 'var(--font-heading)' }}>₹{anom.amount.toLocaleString()}</div>
                  <span className="pin-overlay-pill" style={{ fontSize: '11px', backgroundColor: 'var(--color-primary)', color: 'var(--color-destructive)', borderColor: 'var(--color-border)' }}>{anom.deviationFactor}x Std Dev</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted-text)' }} className="body-sm">
            No statistical transaction anomalies flagged.
          </div>
        )}
      </div>
    </div>
  );
};
