import React, { useState, useEffect } from 'react';
import { Sparkles, AlertOctagon, TrendingUp, TrendingDown, Zap, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiFetch } from '../api/client';
import { FinancialHealthCard } from '../components/Dashboard/FinancialHealthCard';
import { usePrivacy } from '../context/PrivacyContext';

export const AnalyticsPage = () => {
  const { isPrivacyMaskActive } = usePrivacy();
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

  const monthlyComparison = data?.monthlyComparison || { categoryDeltas: [] };
  const categoryDeltas = monthlyComparison?.categoryDeltas || [];
  const anomalyList = data?.anomalies?.anomalies || (Array.isArray(data?.anomalies) ? data.anomalies : []);
  const financialHealth = data?.financialHealth || null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span className="glass-pill" style={{ color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.25)' }}>
            <Zap size={12} /> Deep Analytics Engine
          </span>
        </div>
        <h1 className="display-xl" style={{ margin: 0 }}>Analytics & MoM Deltas</h1>
        <p style={{ fontSize: '13px', color: '#94A3B8', marginTop: '2px' }}>
          Statistical month-over-month comparison, category shift deltas, and automated anomaly detection.
        </p>
      </div>

      {/* Financial Health Index 5-Pillar Scorecard */}
      {financialHealth && (
        <FinancialHealthCard healthData={financialHealth} />
      )}

      {/* AI Spending Explanation Banner */}
      {explanation && explanation.explanation && (
        <motion.div
          whileHover={{ y: -1 }}
          transition={{ duration: 0.15 }}
          className="glass-card"
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(10, 14, 24, 0.9) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sparkles size={18} color="#00FF87" />
            <h3 className="heading-lg" style={{ color: '#F1F5F9', margin: 0 }}>
              "Why Did My Spending Change?" AI Rationale
            </h3>
          </div>
          <p style={{ fontSize: '14px', color: '#E2E8F0', lineHeight: 1.5, margin: 0 }}>
            "{explanation.explanation}"
          </p>
        </motion.div>
      )}

      {/* MoM Category Deltas Table Card */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <h3 className="heading-md" style={{ color: '#F1F5F9', marginBottom: '14px' }}>
          Month-Over-Month Category Changes
        </h3>
        {categoryDeltas.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Current Month</th>
                  <th>Previous Month</th>
                  <th style={{ textAlign: 'right' }}>Change Delta</th>
                </tr>
              </thead>
              <tbody>
                {categoryDeltas.map((cat, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 700, color: '#F1F5F9' }}>
                      {cat.category}
                    </td>
                    <td className={`tabular-nums ${isPrivacyMaskActive ? 'privacy-masked' : ''}`} style={{ color: '#F1F5F9', fontWeight: 600 }}>
                      ₹{(Number(cat.currentAmount) || 0).toLocaleString()}
                    </td>
                    <td className={`tabular-nums ${isPrivacyMaskActive ? 'privacy-masked' : ''}`} style={{ color: '#94A3B8' }}>
                      ₹{(Number(cat.previousAmount) || 0).toLocaleString()}
                    </td>
                    <td
                      className={`tabular-nums ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}
                      style={{
                        textAlign: 'right',
                        fontWeight: 800,
                        color: (Number(cat.diff) || 0) > 0 ? '#FB7185' : '#00FF87',
                      }}
                    >
                      {(Number(cat.diff) || 0) > 0 ? `+₹${Number(cat.diff).toLocaleString()}` : `-₹${Math.abs(Number(cat.diff) || 0).toLocaleString()}`} ({cat.changePercent || 0}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
            No month-over-month category variance recorded yet. Log expenses across months to see delta trends.
          </div>
        )}
      </div>

      {/* Flagged Anomalies Card */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <AlertOctagon size={18} color="#FB7185" />
          <h3 className="heading-md" style={{ color: '#F1F5F9', margin: 0 }}>
            Statistical Anomaly Detection
          </h3>
        </div>

        {anomalyList.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {anomalyList.map((anom, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#F1F5F9', fontSize: '13.5px' }}>{anom.title}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px' }}>{anom.reason}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className={`font-display tabular-nums ${isPrivacyMaskActive ? 'privacy-masked' : ''}`} style={{ fontWeight: 800, color: '#FB7185', fontSize: '16px' }}>
                    ₹{(Number(anom.amount) || 0).toLocaleString()}
                  </div>
                  <span style={{ fontSize: '10.5px', color: '#FB7185', background: 'rgba(244, 63, 94, 0.12)', padding: '1px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                    {anom.deviationFactor || '1.5'}x Std Dev
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
            🛡️ All transaction patterns match historical standard distribution.
          </div>
        )}
      </div>
    </div>
  );
};
