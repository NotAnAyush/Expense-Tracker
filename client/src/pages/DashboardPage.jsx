import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  Calendar, 
  Sparkles, 
  Plus,
  Zap,
  AlertTriangle,
  ArrowUpRight,
  ShieldCheck,
  Bot,
  MessageSquare,
  Flame,
  Award
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { apiFetch } from '../api/client';
import { PinCard } from '../components/UI/PinCard';

// Vibrant Category Colors & Emojis Map
const CATEGORY_META = {
  'Food & Dining': { color: '#00FF87', emoji: '🍔' },
  'Transportation': { color: '#FFD700', emoji: '🚗' },
  'Housing & Utilities': { color: '#9D4EDD', emoji: '🏡' },
  'Shopping': { color: '#00F0FF', emoji: '🛍️' },
  'Subscriptions': { color: '#FF007A', emoji: '⚡' },
  'Entertainment': { color: '#FF9900', emoji: '🍿' },
  'General': { color: '#64748B', emoji: '📦' }
};

const DEFAULT_COLORS = ['#00FF87', '#FFD700', '#9D4EDD', '#00F0FF', '#FF007A', '#FF9900', '#10B981'];

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
          animate={{ scale: [0.95, 1.05, 0.95] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #00FF87, #FFD700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 30px rgba(0, 255, 135, 0.4)',
            }}
          >
            <Sparkles size={32} color="#050810" />
          </div>
          <h2 className="heading-lg" style={{ color: '#F1F5F9' }}>
            Initializing Richy Rich Wealth Engine...
          </h2>
          <span style={{ fontSize: '14px', color: '#94A3B8' }}>Calculating velocity metrics and AI synthesis</span>
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

  // Custom 3D Segmented Ring Hover Tooltip Component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div
          style={{
            background: 'rgba(15, 20, 32, 0.95)',
            backdropFilter: 'blur(16px)',
            border: `1.5px solid ${dataItem.color}`,
            borderRadius: '16px',
            padding: '12px 18px',
            boxShadow: `0 8px 32px rgba(0, 0, 0, 0.6), 0 0 20px ${dataItem.color}40`,
            color: '#F1F5F9',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '24px' }}>{dataItem.emoji}</span>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8' }}>{dataItem.name}</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: dataItem.color, fontFamily: 'var(--font-display)' }}>
              ₹{dataItem.value.toLocaleString()} <span style={{ fontSize: '12px', color: '#94A3B8' }}>({dataItem.percentage}%)</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* 1. HERO TITLE & GAMIFIED FILTER CHIPS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, color: '#00FF87', background: 'rgba(0, 255, 135, 0.12)', padding: '3px 10px', borderRadius: '999px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              ⚡ Live Intelligence
            </span>
            <span style={{ fontSize: '13px', color: '#94A3B8' }}>Updated moments ago</span>
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
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
          style={{
            padding: '24px',
            background: 'linear-gradient(135deg, rgba(0, 255, 135, 0.1) 0%, rgba(15, 20, 32, 0.8) 100%)',
            border: '1px solid rgba(0, 255, 135, 0.3)',
            display: 'flex',
            justify: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontSize: '36px' }}>{CATEGORY_META[selectedCategoryInfo.category]?.emoji || '💳'}</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="heading-lg">{selectedCategoryInfo.category}</h3>
                <span className="glass-pill" style={{ borderColor: '#00FF87', color: '#00FF87' }}>
                  {selectedCategoryInfo.percentage}% of Monthly Spend
                </span>
              </div>
              <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
                {selectedCategoryBudget
                  ? `Allocated Limit: ₹${selectedCategoryBudget.allocated.toLocaleString()} (${selectedCategoryBudget.percentage}% utilized).`
                  : 'No strict budget cap set for this category.'}
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="font-display" style={{ fontSize: '32px', fontWeight: 800, color: '#00FF87' }}>
              ₹{selectedCategoryInfo.amount.toLocaleString()}
            </div>
            <button
              onClick={() => setActiveChip('All')}
              style={{ color: '#94A3B8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
            >
              Reset to All Categories
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. METRIC / KPI CARDS WIDGET GRID (Upgraded with Sparklines & Radial Meters) */}
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
          overlayPill={velocityWarning ? "High Velocity ⚡" : "Budget Safety 🛡️"}
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
          subtitle="Calculated trajectory based on velocity"
        />
      </div>

      {/* 3. MONTHLY AI SYNTHESIS BANNER ("AI Finance Weather Report") */}
      {aiSummary && activeChip === 'All' && (
        <motion.div
          whileHover={{ scale: 1.01 }}
          className="glass-card"
          style={{
            padding: '28px 32px',
            background: 'var(--grad-banner-mesh)',
            border: '1px solid rgba(121, 40, 202, 0.4)',
            boxShadow: 'var(--shadow-glow-violet)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Glowing Ambient Backdrop Orb */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '200px',
              height: '200px',
              borderRadius: '999px',
              background: 'radial-gradient(circle, rgba(0, 255, 135, 0.25), transparent 70%)',
              filter: 'blur(30px)',
              pointerEvents: 'none',
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', position: 'relative', zIndex: 2 }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #7928CA, #00FF87)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(0, 255, 135, 0.4)',
                  }}
                  className="animate-mascot"
                >
                  <Sparkles size={20} color="#050810" />
                </div>
                <div>
                  <h3 className="heading-lg" style={{ color: '#F1F5F9' }}>
                    AI Finance Weather Report
                  </h3>
                  <span style={{ fontSize: '12px', color: '#00FF87', fontWeight: 700 }}>
                    Ground Truth Synthesis • Wealth Radar Active
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '17px', color: '#F1F5F9', lineHeight: 1.6, fontWeight: 500 }}>
                "{aiSummary.summaryText}"
              </p>
            </div>

            {/* Quick "Ask Copilot" Interactive Prompt Action */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Copilot Quick Actions
              </span>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenCopilot}
                  className="glass-pill"
                  style={{ borderColor: 'rgba(0, 255, 135, 0.4)', color: '#00FF87', cursor: 'pointer', background: 'rgba(0, 255, 135, 0.08)' }}
                >
                  <MessageSquare size={13} />
                  "Cut food spend?"
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onOpenCopilot}
                  className="glass-pill"
                  style={{ borderColor: 'rgba(255, 215, 0, 0.4)', color: '#FFD700', cursor: 'pointer', background: 'rgba(255, 215, 0, 0.08)' }}
                >
                  <Flame size={13} />
                  "Analyze Velocity"
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 4. CHARTS & INSIGHTS GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        
        {/* Category 3D Segmented Ring Chart Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 className="heading-md" style={{ color: '#F1F5F9' }}>
                {activeChip === 'All' ? 'Category Breakdown' : `${activeChip} Spotlight`}
              </h3>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>Interactive Segmented Ring</span>
            </div>
            <div className="glass-pill" style={{ color: '#FFD700', borderColor: 'rgba(255, 215, 0, 0.3)' }}>
              <Award size={13} /> Top: {chartCategoryData[0]?.name || 'N/A'}
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
                      innerRadius={70}
                      outerRadius={105}
                      paddingAngle={6}
                      dataKey="value"
                      cornerRadius={8}
                    >
                      {chartCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(10, 13, 20, 0.8)" strokeWidth={2} />
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
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>
                    Total
                  </div>
                  <div className="font-display" style={{ fontSize: '20px', fontWeight: 800, color: '#00FF87' }}>
                    ₹{monthlySummary.totalSpend.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Custom Category Progress Bars Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                {chartCategoryData.slice(0, 4).map((cat) => (
                  <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{cat.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#F1F5F9', marginBottom: '3px' }}>
                        <span>{cat.name}</span>
                        <span style={{ color: cat.color }}>₹{cat.value.toLocaleString()} ({cat.percentage}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${cat.percentage}%`, background: cat.color, borderRadius: '999px' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
              No spend data available for {activeChip}
            </div>
          )}
        </div>

        {/* Prioritized Insights (Floating Action Cards) */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 className="heading-md" style={{ color: '#F1F5F9' }}>Prioritized AI Insights</h3>
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>Automated Anomaly Detection</span>
            </div>
            <span className="glass-pill" style={{ color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.3)' }}>
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
                    whileHover={{ x: 4, borderColor: isWarning ? 'rgba(255, 153, 0, 0.5)' : 'rgba(0, 255, 135, 0.5)' }}
                    style={{
                      padding: '16px',
                      borderRadius: '16px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
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
                        borderRadius: '12px',
                        background: isWarning ? 'rgba(255, 153, 0, 0.15)' : 'rgba(0, 255, 135, 0.15)',
                        border: isWarning ? '1px solid rgba(255, 153, 0, 0.3)' : '1px solid rgba(0, 255, 135, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {isWarning ? <AlertTriangle size={18} color="#FF9900" /> : <ShieldCheck size={18} color="#00FF87" />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#F1F5F9' }}>{ins.title}</h4>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: isWarning ? '#FF9900' : '#00FF87' }}>
                          {ins.metric}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.4, marginBottom: '10px' }}>
                        {ins.explanation}
                      </p>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onOpenCopilot}
                        style={{
                          background: 'rgba(255, 255, 255, 0.06)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: '8px',
                          padding: '5px 10px',
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#F1F5F9',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
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
              <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>
                🛡️ All systems healthy. No spending anomalies detected.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
};
