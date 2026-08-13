import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  Calendar, 
  Sparkles, 
  Plus
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { apiFetch } from '../api/client';
import { PinCard } from '../components/UI/PinCard';

const PINTEREST_COLORS = ['#e60023', '#262622', '#62625b', '#91918c', '#dadad3', '#435ee5', '#7e238b'];

export const DashboardPage = ({ onOpenCopilot, onAddExpense }) => {
  const [data, setData] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChip, setActiveChip] = useState('All');

  const filterChips = ['All', 'Food & Dining', 'Transportation', 'Housing & Utilities', 'Shopping', 'Subscriptions', 'Budgets'];

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, summaryRes, insightsRes] = await Promise.all([
        apiFetch('/analytics'),
        apiFetch('/ai/summary').catch(() => null),
        apiFetch('/ai/insights').catch(() => ({ insights: [] })),
      ]);

      setData(analyticsRes);
      if (summaryRes) setAiSummary(summaryRes);
      if (insightsRes) setInsights(insightsRes.insights || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div style={{ padding: '64px', textAlign: 'center', color: 'var(--mute)' }} className="body-md">
        Loading Pinterest Financial Intelligence Platform...
      </div>
    );
  }

  const { monthlySummary, categoryBreakdown, monthlyComparison, budgetUtilization, spendingVelocity } = data;

  const chartCategoryData = categoryBreakdown.breakdown.map(c => ({
    name: c.category,
    value: c.amount
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Hero Title & Filter Chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h1 className="heading-xl">Financial Overview</h1>
        
        {/* Horizontal Filter Chip Strip */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`filter-chip ${activeChip === chip ? 'filter-chip-active' : ''}`}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* 1. FINANCIAL SUMMARY MASONRY CARDS */}
      <div className="grid-masonry">
        <PinCard
          title="Spent This Month"
          amount={monthlySummary.totalSpend}
          overlayPill="Overview"
          subtitle={`${monthlyComparison.changePercent}% ${monthlyComparison.isIncrease ? 'increase' : 'decrease'} vs last month`}
        />

        <PinCard
          title="Daily Average Pace"
          amount={monthlySummary.averageDailySpend}
          overlayPill="Spending Velocity"
          subtitle={`${monthlySummary.daysRemaining} days remaining in month`}
        />

        <PinCard
          title="Budget Utilization"
          amount={budgetUtilization.totalSpent}
          overlayPill="Allocated Limit"
          subtitle={`₹${budgetUtilization.totalAllocated.toLocaleString()} Total Allocated Limit`}
        />

        <PinCard
          title="Projected Month End"
          amount={spendingVelocity.projectedMonthEndSpend}
          overlayPill="Forecast"
          subtitle="Estimated based on current daily pace"
        />
      </div>

      {/* 2. AI MONTHLY SUMMARY CARD */}
      {aiSummary && (
        <div className="pin-card-large" style={{ backgroundColor: 'var(--canvas)', border: '1px solid var(--hairline)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={20} color="var(--primary)" />
              <h3 className="heading-lg">Monthly AI Synthesis</h3>
            </div>
            <span className="pin-overlay-pill">Ground Truth</span>
          </div>
          <p className="body-md" style={{ color: 'var(--body)', fontSize: '18px', lineHeight: 1.5 }}>
            "{aiSummary.summaryText}"
          </p>
        </div>
      )}

      {/* 3. VISUALIZATION CHARTS & INSIGHTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Category Donut Chart Card */}
        <div className="pin-card" style={{ backgroundColor: 'var(--canvas)', border: '1px solid var(--hairline)' }}>
          <h3 className="heading-md" style={{ marginBottom: '16px' }}>Category Distribution</h3>
          {chartCategoryData.length > 0 ? (
            <div style={{ width: '100%', height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PINTEREST_COLORS[index % PINTEREST_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${val.toLocaleString()}`} contentStyle={{ background: '#ffffff', border: '1px solid var(--hairline)', borderRadius: '16px', color: '#000000' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--mute)' }}>No category data</div>
          )}
        </div>

        {/* Prioritized AI Insights List */}
        <div className="pin-card" style={{ backgroundColor: 'var(--canvas)', border: '1px solid var(--hairline)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="heading-md">Prioritized Insights</h3>
            <span className="body-sm">Scored Impact</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {insights.length > 0 ? (
              insights.map((ins) => (
                <div
                  key={ins.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--surface-card)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div className="body-strong">{ins.title}</div>
                    <div className="body-sm" style={{ marginTop: '2px' }}>{ins.explanation}</div>
                  </div>
                  <span className="pin-overlay-pill">
                    {ins.metric}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--mute)' }} className="body-sm">
                All systems healthy. No critical anomalies flagged.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
