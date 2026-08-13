import React, { useState, useEffect } from 'react';
import { Sparkles, AlertOctagon, TrendingUp, TrendingDown, Zap, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
    return (
      <div style={{ padding: '64px', textAlign: 'center', color: '#94A3B8' }}>
        <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <Sparkles size={32} color="#00FF87" style={{ marginBottom: '12px' }} />
          <div>Computing Financial Analytics Engine & AI Deltas...</div>
        </motion.div>
      </div>
    );
  }

  const { monthlyComparison, categoryBreakdown, anomalies } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span className="glass-pill" style={{ color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.3)' }}>
            <Zap size={12} /> Deep Analytics Engine
          </span>
        </div>
        <h1 className="display-xl">Analytics & MoM Deltas</h1>
        <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
          Statistical month-over-month comparison, category shift deltas, and automated anomaly detection.
        </p>
      </div>

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
          <p style={{ fontSize: '17px', color: '#F1F5F9', lineHeight: 1.6, fontWeight: 500 }}>
            "{explanation.explanation}"
          </p>
        </motion.div>
      )}

      {/* MoM Category Deltas Table Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <h3 className="heading-md" style={{ color: '#F1F5F9', marginBottom: '16px' }}>
          Month-Over-Month Category Changes
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94A3B8', fontSize: '13px' }}>
                <th style={{ padding: '12px 12px' }}>Category</th>
                <th style={{ padding: '12px 12px' }}>Current Month</th>
                <th style={{ padding: '12px 12px' }}>Previous Month</th>
                <th style={{ padding: '12px 12px', textAlign: 'right' }}>Change Delta</th>
              </tr>
            </thead>
            <tbody>
              {monthlyComparison.categoryDeltas.map((cat, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'var(--transition)',
                  }}
                >
                  <td style={{ padding: '14px 12px', fontWeight: 700, color: '#F1F5F9' }}>
                    {cat.category}
                  </td>
                  <td style={{ padding: '14px 12px', color: '#F1F5F9', fontWeight: 600 }}>
                    ₹{cat.currentAmount.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 12px', color: '#94A3B8' }}>
                    ₹{cat.previousAmount.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: '14px 12px',
                      textAlign: 'right',
                      fontWeight: 800,
                      fontFamily: 'var(--font-display)',
                      color: cat.diff > 0 ? '#F43F5E' : '#00FF87',
                    }}
                  >
                    {cat.diff > 0 ? `+₹${cat.diff.toLocaleString()}` : `-₹${Math.abs(cat.diff).toLocaleString()}`} ({cat.changePercent}%)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flagged Anomalies Card */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <AlertOctagon size={20} color="#FF007A" />
          <h3 className="heading-md" style={{ color: '#F1F5F9' }}>
            Statistical Anomaly Detection
          </h3>
        </div>

        {anomalies.anomalies.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {anomalies.anomalies.map((anom, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 4 }}
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '15px' }}>{anom.title}</div>
                  <div style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>{anom.reason}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="font-display" style={{ fontWeight: 800, color: '#F43F5E', fontSize: '18px' }}>
                    ₹{anom.amount.toLocaleString()}
                  </div>
                  <span className="glass-pill" style={{ color: '#FF007A', borderColor: 'rgba(255, 0, 122, 0.3)', fontSize: '11px' }}>
                    {anom.deviationFactor}x Std Dev
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
            🛡️ All transaction patterns match historical standard distribution.
          </div>
        )}
      </div>
    </div>
  );
};
