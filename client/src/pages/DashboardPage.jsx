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

const OLED_CHART_COLORS = ['#22C55E', '#38BDF8', '#A855F7', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'];

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
      <div style={{ padding: '64px', textAlign: 'center', color: 'var(--color-muted-text)' }} className="body-md">
        Loading Richy Rich Financial Intelligence Platform...
      </div>
    );
  }

  const { monthlySummary, categoryBreakdown, monthlyComparison, budgetUtilization, spendingVelocity } = data;

  const filteredCategories = activeChip === 'All'
    ? categoryBreakdown.breakdown
    : categoryBreakdown.breakdown.filter(c => c.category.toLowerCase() === activeChip.toLowerCase());

  const selectedCategoryInfo = activeChip !== 'All'
    ? categoryBreakdown.breakdown.find(c => c.category.toLowerCase() === activeChip.toLowerCase())
    : null;

  const selectedCategoryBudget = activeChip !== 'All'
    ? budgetUtilization.budgets.find(b => b.category.toLowerCase() === activeChip.toLowerCase())
    : null;

  const chartCategoryData = (filteredCategories.length > 0 ? filteredCategories : categoryBreakdown.breakdown).map(c => ({
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

      {/* Selected Category Spotlight (when a category chip is active) */}
      {selectedCategoryInfo && (
        <div className="pin-card-large" style={{ backgroundColor: 'var(--canvas)', border: '1px solid var(--hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="pin-overlay-pill" style={{ backgroundColor: 'var(--ink)', color: '#ffffff' }}>Category Focus</span>
              <h3 className="heading-lg">{selectedCategoryInfo.category}</h3>
            </div>
            <p className="body-sm">
              Accounting for {selectedCategoryInfo.percentage}% of your total spending this month.
              {selectedCategoryBudget ? ` Allocated Limit: ₹${selectedCategoryBudget.allocated.toLocaleString()} (${selectedCategoryBudget.percentage}% used).` : ' No budget limit set.'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--primary)' }}>
              ₹{selectedCategoryInfo.amount.toLocaleString()}
            </div>
            <button onClick={() => setActiveChip('All')} className="body-sm" style={{ color: 'var(--mute)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
              Reset to All
            </button>
          </div>
        </div>
      )}

      {/* 1. FINANCIAL SUMMARY MASONRY CARDS */}
      <div className="grid-masonry">
        <PinCard
          title={activeChip === 'All' ? "Spent This Month" : `${activeChip} Spend`}
          amount={selectedCategoryInfo ? selectedCategoryInfo.amount : monthlySummary.totalSpend}
          overlayPill={activeChip === 'All' ? "Overview" : `${selectedCategoryInfo?.percentage || 0}% of Total`}
          subtitle={selectedCategoryInfo ? `${selectedCategoryInfo.percentage}% of your monthly expenses` : `${monthlyComparison.changePercent}% ${monthlyComparison.isIncrease ? 'increase' : 'decrease'} vs last month`}
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
      {aiSummary && activeChip === 'All' && (
        <div className="pin-card-large">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={22} color="var(--color-accent)" />
              <h3 className="heading-lg">Monthly AI Synthesis</h3>
            </div>
            <span className="pin-overlay-pill" style={{ backgroundColor: 'var(--color-secondary)', color: 'var(--color-accent)' }}>Ground Truth</span>
          </div>
          <p className="body-md" style={{ color: 'var(--color-foreground)', fontSize: '18px', lineHeight: 1.5 }}>
            "{aiSummary.summaryText}"
          </p>
        </div>
      )}

      {/* 3. VISUALIZATION CHARTS & INSIGHTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Category Donut Chart Card */}
        <div className="pin-card">
          <h3 className="heading-md" style={{ marginBottom: '16px' }}>
            {activeChip === 'All' ? 'Category Distribution' : `${activeChip} Focus`}
          </h3>
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
                      <Cell key={`cell-${index}`} fill={OLED_CHART_COLORS[index % OLED_CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => `₹${val.toLocaleString()}`}
                    contentStyle={{ background: '#0F172A', border: '1px solid #334155', borderRadius: '12px', color: '#F8FAFC' }}
                    itemStyle={{ color: '#F8FAFC' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-muted-text)' }}>No category data for {activeChip}</div>
          )}
        </div>

        {/* Prioritized AI Insights List */}
        <div className="pin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="heading-md">Prioritized Insights</h3>
            <span className="body-sm" style={{ color: 'var(--color-muted-text)' }}>Scored Impact</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {insights.length > 0 ? (
              insights.map((ins) => (
                <div
                  key={ins.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--color-secondary)',
                    border: '1px solid var(--color-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div className="body-strong" style={{ color: 'var(--color-foreground)' }}>{ins.title}</div>
                    <div className="body-sm" style={{ marginTop: '2px', color: 'var(--color-muted-text)' }}>{ins.explanation}</div>
                  </div>
                  <span className="pin-overlay-pill" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-accent)' }}>
                    {ins.metric}
                  </span>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--color-muted-text)' }} className="body-sm">
                All systems healthy. No critical anomalies flagged.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
