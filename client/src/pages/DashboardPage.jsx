import React, { useState, useEffect } from 'react';
import { 
  PieChart as PieIcon, 
  Calendar, 
  Sparkles, 
  Plus,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Bot,
  MessageSquare,
  Flame,
  Award,
  CheckCircle2,
  Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { apiFetch } from '../api/client';
import { PinCard } from '../components/UI/PinCard';

// Vibrant Category Colors for Dark Mode
const CATEGORY_META = {
  'Food & Dining': { color: '#00FF87', emoji: '🍔' },
  'Transportation': { color: '#FFD700', emoji: '🚗' },
  'Housing & Utilities': { color: '#38BDF8', emoji: '🏡' },
  'Shopping': { color: '#A855F7', emoji: '🛍️' },
  'Subscriptions': { color: '#EC4899', emoji: '⚡' },
  'Entertainment': { color: '#FB923C', emoji: '🍿' },
  'Health & Medical': { color: '#34D399', emoji: '🌿' },
  'General': { color: '#94A3B8', emoji: '📦' }
};

const DEFAULT_COLORS = ['#00FF87', '#FFD700', '#38BDF8', '#A855F7', '#EC4899', '#FB923C', '#34D399', '#94A3B8'];

export const DashboardPage = ({ onOpenCopilot, onAddExpense }) => {
  const [data, setData] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChip, setActiveChip] = useState('All');

  const filterChips = ['All', 'Food & Dining', 'Transportation', 'Housing & Utilities', 'Shopping', 'Subscriptions'];

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
      <div style={{ padding: '80px', textAlign: 'center' }}>
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '18px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)',
            }}
          >
            <Sparkles size={28} color="#00FF87" />
          </div>
          <h2 className="heading-lg" style={{ color: 'var(--color-text-main)' }}>
            Initializing Wealth Engine...
          </h2>
          <span style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>Calculating pace, velocity, and AI synthesis</span>
        </motion.div>
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

  const chartCategoryData = (filteredCategories.length > 0 ? filteredCategories : categoryBreakdown.breakdown).map((c, i) => {
    const meta = CATEGORY_META[c.category] || { color: DEFAULT_COLORS[i % DEFAULT_COLORS.length], emoji: '💳' };
    return {
      name: c.category,
      value: c.amount,
      percentage: c.percentage,
      color: meta.color,
      emoji: meta.emoji,
    };
  });

  // Calculate velocity health badge & cycle progress
  const velocityWarning = spendingVelocity.velocityRatio > 1.1;
  const utilizationPercent = Math.round((budgetUtilization.totalSpent / (budgetUtilization.totalAllocated || 1)) * 100);
  const daysElapsed = Number(monthlySummary.daysElapsed) || 12;
  const daysRemaining = Number(monthlySummary.daysRemaining) || 18;
  const cyclePaceProgress = Math.round((daysElapsed / (daysElapsed + daysRemaining)) * 100);

  // Sparkline motion datasets for all 4 KPI cards
  const sparklineSpend = [12, 18, 14, 22, 19, 28, 25, 34, 30, 38];
  const sparklinePace = [18, 22, 20, 26, 24, 30, 28, 32];
  const sparklineBudget = [10, 20, 30, 45, 60, 75, 85, utilizationPercent || 94];
  const sparklineForecast = [25, 28, 32, 36, 40, 44, 48, 52];

  // Custom Segmented Ring Hover Tooltip Component (Dark Glass)
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div
          style={{
            background: 'rgba(15, 22, 36, 0.95)',
            backdropFilter: 'blur(16px)',
            border: `1.5px solid ${dataItem.color}`,
            borderRadius: '14px',
            padding: '12px 18px',
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px ${dataItem.color}30`,
            color: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '22px' }}>{dataItem.emoji}</span>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-muted)' }}>{dataItem.name}</div>
            <div style={{ fontSize: '17px', fontWeight: 800, color: dataItem.color, fontFamily: 'var(--font-display)' }}>
              ₹{dataItem.value.toLocaleString()} <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>({dataItem.percentage}%)</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* 1. HERO TITLE & FILTER CHIPS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 800,
                color: '#00FF87',
                background: 'rgba(0, 255, 135, 0.12)',
                border: '1px solid rgba(0, 255, 135, 0.3)',
                padding: '3px 10px',
                borderRadius: '999px',
                letterSpacing: '0.4px',
                textTransform: 'uppercase',
              }}
            >
              ⚡ Live Intelligence
            </span>
            <span style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Updated moments ago</span>
          </div>
          <h1 className="display-xl">
            Financial Overview
          </h1>
        </div>

        {/* Filter Chip Strip */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', maxWidth: '100%' }}>
          {filterChips.map((chip) => (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`filter-chip ${activeChip === chip ? 'filter-chip-active' : ''}`}
            >
              {CATEGORY_META[chip]?.emoji && <span style={{ marginRight: '6px' }}>{CATEGORY_META[chip].emoji}</span>}
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Category Spotlight (when category chip active) */}
      {selectedCategoryInfo && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(15, 22, 36, 0.9) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {CATEGORY_META[selectedCategoryInfo.category]?.emoji || '💳'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="heading-lg" style={{ color: 'var(--color-text-main)' }}>{selectedCategoryInfo.category}</h3>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    color: '#00FF87',
                    padding: '2px 10px',
                    borderRadius: '999px',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {selectedCategoryInfo.percentage}% of Monthly Spend
                </span>
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                {selectedCategoryBudget
                  ? `Allocated Limit: ₹${selectedCategoryBudget.allocated.toLocaleString()} (${selectedCategoryBudget.percentage}% utilized).`
                  : 'No strict budget cap set for this category.'}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: '#00FF87' }}>
              ₹{selectedCategoryInfo.amount.toLocaleString()}
            </div>
            <button
              onClick={() => setActiveChip('All')}
              style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
            >
              Reset to All Categories
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. METRIC / KPI CARDS WIDGET GRID */}
      <div className="grid-kpi">
        <PinCard
          title={activeChip === 'All' ? "Spent This Month" : `${activeChip} Spend`}
          amount={selectedCategoryInfo ? selectedCategoryInfo.amount : monthlySummary.totalSpend}
          overlayPill={activeChip === 'All' ? "Total Outflow" : `${selectedCategoryInfo?.percentage || 0}% of Total`}
          pillColor="mint"
          sparklineData={sparklineSpend}
          trendDirection={monthlyComparison.isIncrease ? 'up' : 'down'}
          trendPercent={monthlyComparison.changePercent}
          subtitle={selectedCategoryInfo ? `${selectedCategoryInfo.percentage}% of total expenses` : `${monthlyComparison.changePercent}% ${monthlyComparison.isIncrease ? 'increase' : 'decrease'} vs last month`}
        />

        <PinCard
          title="Daily Average Pace"
          amount={monthlySummary.averageDailySpend}
          overlayPill={velocityWarning ? "Elevated Pace" : "Pace On Track"}
          pillColor={velocityWarning ? "amber" : "emerald"}
          sparklineData={sparklinePace}
          radialProgress={cyclePaceProgress}
          subtitle={`${daysRemaining} days remaining in cycle • Daily pace ₹${monthlySummary.averageDailySpend}`}
        />

        <PinCard
          title="Budget Utilization"
          amount={budgetUtilization.totalSpent}
          overlayPill={`${utilizationPercent}% Used`}
          pillColor={utilizationPercent > 90 ? "amber" : "emerald"}
          sparklineData={sparklineBudget}
          radialProgress={utilizationPercent}
          subtitle={`₹${budgetUtilization.totalAllocated.toLocaleString()} Total Allocated Cap`}
        />

        <PinCard
          title="Projected Month End"
          amount={spendingVelocity.projectedMonthEndSpend}
          overlayPill="AI Forecast"
          pillColor="cyan"
          sparklineData={sparklineForecast}
          subtitle="Calculated trajectory based on current pace"
        />
      </div>

      {/* 3. MONTHLY AI SYNTHESIS BANNER ("AI Finance Weather Report") */}
      {aiSummary && activeChip === 'All' && (
        <motion.div
          whileHover={{ y: -1 }}
          className="glass-card"
          style={{
            padding: '28px 32px',
            background: 'var(--grad-banner-mesh)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: 'var(--shadow-sm)',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 2 }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid rgba(16, 185, 129, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(16, 185, 129, 0.25)',
                  }}
                >
                  <Sparkles size={20} color="#00FF87" />
                </div>
                <div>
                  <h3 className="heading-lg" style={{ color: 'var(--color-text-main)' }}>
                    AI Finance Weather Report
                  </h3>
                  <span style={{ fontSize: '12.5px', color: '#00FF87', fontWeight: 700 }}>
                    Supportive Overview • Real-Time Radar Active
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '15.5px', color: '#F1F5F9', lineHeight: 1.6, fontWeight: 500 }}>
                "{aiSummary.summaryText}"
              </p>
            </div>

            {/* Quick "Ask Copilot" Interactive Action Pills */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Copilot Quick Actions
              </span>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onOpenCopilot}
                  style={{
                    background: 'rgba(16, 185, 129, 0.12)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#00FF87',
                    borderRadius: '999px',
                    padding: '7px 14px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition)',
                  }}
                >
                  <MessageSquare size={13} color="#00FF87" />
                  "Cut food spend?"
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onOpenCopilot}
                  style={{
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: '#FBBF24',
                    borderRadius: '999px',
                    padding: '7px 14px',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'var(--transition)',
                  }}
                >
                  <Flame size={13} color="#FBBF24" />
                  "Analyze Velocity"
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. CHARTS & INSIGHTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Category Segmented Ring Chart Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 className="heading-md" style={{ color: 'var(--color-text-main)' }}>
                {activeChip === 'All' ? 'Category Breakdown' : `${activeChip} Focus`}
              </h3>
              <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>Segmented Spend Distribution</span>
            </div>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                color: '#FFD700',
                padding: '4px 10px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <Award size={13} color="#FFD700" /> Top: {chartCategoryData[0]?.name || 'N/A'}
            </div>
          </div>

          {chartCategoryData.length > 0 ? (
            <div>
              <div style={{ width: '100%', height: 260, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={72}
                      outerRadius={104}
                      paddingAngle={4}
                      dataKey="value"
                      cornerRadius={6}
                    >
                      {chartCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(11, 15, 25, 0.9)" strokeWidth={2.5} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Ring Stat Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                    Total Spend
                  </div>
                  <div className="font-display" style={{ fontSize: '22px', fontWeight: 800, color: '#00FF87' }}>
                    ₹{monthlySummary.totalSpend.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Custom Category Progress Bars Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
                {chartCategoryData.slice(0, 4).map((cat) => (
                  <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{cat.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: 'var(--color-text-main)', marginBottom: '4px' }}>
                        <span>{cat.name}</span>
                        <span style={{ color: cat.color, fontWeight: 700 }}>₹{cat.value.toLocaleString()} ({cat.percentage}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${cat.percentage}%`, background: cat.color, borderRadius: '999px', boxShadow: `0 0 6px ${cat.color}` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-muted)' }}>
              No spend data available for {activeChip}
            </div>
          )}
        </div>

        {/* Prioritized Insights */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 className="heading-md" style={{ color: 'var(--color-text-main)' }}>Prioritized AI Insights</h3>
              <span style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>Automated Radar Detection</span>
            </div>
            <span
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#00FF87',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11.5px',
                fontWeight: 700,
              }}
            >
              {insights.length} Flagged
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {insights.length > 0 ? (
              insights.map((ins) => {
                const isWarning = ins.title.toLowerCase().includes('high') || ins.title.toLowerCase().includes('alert') || ins.title.toLowerCase().includes('exceed');
                return (
                  <motion.div
                    key={ins.id}
                    whileHover={{ x: 2, borderColor: isWarning ? 'rgba(245, 158, 11, 0.5)' : 'rgba(16, 185, 129, 0.5)' }}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      background: isWarning ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                      border: `1px solid ${isWarning ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '14px',
                      transition: 'var(--transition)',
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: isWarning ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        border: `1px solid ${isWarning ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isWarning ? <AlertTriangle size={18} color="#FBBF24" /> : <ShieldCheck size={18} color="#00FF87" />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC' }}>{ins.title}</h4>
                        <span style={{ fontSize: '11.5px', fontWeight: 800, color: isWarning ? '#FBBF24' : '#00FF87' }}>
                          {ins.metric}
                        </span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', lineHeight: 1.45, marginBottom: '10px' }}>
                        {ins.explanation}
                      </p>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onOpenCopilot}
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          border: '1px solid var(--border-light)',
                          borderRadius: '8px',
                          padding: '5px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#F8FAFC',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <span>Take Action with Copilot</span>
                        <ArrowUpRight size={12} color="#00FF87" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '14px' }}>
                🛡️ All finances in healthy equilibrium. No spending anomalies detected.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
