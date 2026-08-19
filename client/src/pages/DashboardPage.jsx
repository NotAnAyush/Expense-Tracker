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
  Award,
  Wallet,
  ArrowDownRight,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { apiFetch } from '../api/client';
import { PinCard } from '../components/UI/PinCard';
import { FinancialHealthCard } from '../components/Dashboard/FinancialHealthCard';
import { HabitNudgesCard } from '../components/Dashboard/HabitNudgesCard';
import { usePrivacy } from '../context/PrivacyContext';
import { useCustomization } from '../context/CustomizationContext';

// Vibrant Category Colors & Emojis Map
const CATEGORY_META = {
  'Food & Dining': { color: '#00FF87', emoji: '🍔' },
  'Transportation': { color: '#FFD700', emoji: '🚗' },
  'Housing & Utilities': { color: '#A78BFA', emoji: '🏡' },
  'Shopping': { color: '#00F0FF', emoji: '🛍️' },
  'Subscriptions': { color: '#EC4899', emoji: '⚡' },
  'Entertainment': { color: '#F59E0B', emoji: '🍿' },
  'Health & Medical': { color: '#10B981', emoji: '🏥' },
  'General': { color: '#64748B', emoji: '📦' }
};

const DEFAULT_COLORS = ['#00FF87', '#FFD700', '#A78BFA', '#00F0FF', '#EC4899', '#F59E0B', '#10B981'];

export const DashboardPage = ({
  onOpenCopilot,
  onAddExpense,
  onAddIncome,
  onOpenReceiptScan,
  onOpenVoiceLog,
  onOpenBankImport,
  onOpenEcommerceSync,
  onOpenTransactionDetail,
}) => {
  const { isPrivacyMaskActive } = usePrivacy();
  const { activeConfig } = useCustomization();
  const modules = activeConfig?.modules || {};

  const [data, setData] = useState(null);
  const [aiSummary, setAiSummary] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const fetchDashboardData = async (isManualRefresh = false) => {
    try {
      if (isManualRefresh) setRefreshing(true);
      else setLoading(true);

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
      if (isManualRefresh) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(false);
  }, []);

  if (loading || !data) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #00FF87, #FFD700)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 24px rgba(0, 255, 135, 0.3)',
            }}
          >
            <Sparkles size={24} color="#050810" />
          </div>
          <h2 className="heading-lg" style={{ color: '#F1F5F9' }}>
            Syncing Financial Engine...
          </h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>Synthesizing real-time cash flow & velocity</span>
        </motion.div>
      </div>
    );
  }

  const monthlySummary = data?.monthlySummary || { totalSpent: 0, count: 0, daysElapsed: 1, daysRemaining: 29 };
  const categoryBreakdown = data?.categoryBreakdown || { total: 0, breakdown: [] };
  const monthlyComparison = data?.monthlyComparison || { currentTotal: 0, previousTotal: 0, percentageChange: 0, categoryDeltas: [] };
  const budgetUtilization = data?.budgetUtilization || { totalAllocated: 0, totalSpent: 0, totalRemaining: 0, budgets: [] };
  const spendingVelocity = data?.spendingVelocity || { velocityRatio: 0, isAccelerating: false, avgDailyBurn: 0, projectedMonthlySpend: 0 };
  const cashFlowSummary = data?.cashFlowSummary || { totalIncome: 0, totalExpense: 0, netSavings: 0, savingsRate: 0 };
  const categoryList = categoryBreakdown.breakdown || [];

  const chartCategoryData = categoryList.map((c, i) => {
    const meta = CATEGORY_META[c.category] || { color: DEFAULT_COLORS[i % DEFAULT_COLORS.length], emoji: '💳' };
    return {
      name: c.category,
      value: c.amount || 0,
      percentage: c.percentage || 0,
      color: meta.color,
      emoji: meta.emoji,
    };
  });

  const velocityWarning = (spendingVelocity.velocityRatio || 0) > 1.1;
  const utilizationPercent = Math.round(((budgetUtilization.totalSpent || 0) / (budgetUtilization.totalAllocated || 1)) * 100);
  const daysElapsed = Number(monthlySummary.daysElapsed) || 12;
  const daysRemaining = Number(monthlySummary.daysRemaining) || 18;
  const cyclePaceProgress = Math.round((daysElapsed / (daysElapsed + daysRemaining)) * 100);

  // Sparklines datasets
  const sparklineSpend = [14, 18, 16, 24, 20, 28, 25, 32, 29, 36];
  const sparklineCashflow = [20, 22, 25, 28, 30, 32, 34, 38];
  const sparklineBudget = [15, 25, 35, 50, 65, 75, 85, Math.min(utilizationPercent || 80, 100)];
  const sparklineForecast = [24, 28, 30, 34, 38, 42, 45, 50];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataItem = payload[0].payload;
      return (
        <div
          style={{
            background: 'rgba(12, 16, 26, 0.95)',
            backdropFilter: 'blur(16px)',
            border: `1px solid ${dataItem.color}`,
            borderRadius: '12px',
            padding: '10px 14px',
            boxShadow: `0 8px 24px rgba(0, 0, 0, 0.5), 0 0 14px ${dataItem.color}30`,
            color: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '20px' }}>{dataItem.emoji}</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>{dataItem.name}</div>
            <div className="font-display tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: dataItem.color }}>
              ₹{dataItem.value.toLocaleString()} <span style={{ fontSize: '11px', color: '#94A3B8' }}>({dataItem.percentage}%)</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const currentDateFormatted = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. HERO SECTION: Clean Greeting & Live Period Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span className="animate-live-dot" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#00FF87', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Live Ledger • {currentDateFormatted}
            </span>
          </div>
          <h1 className="display-xl" style={{ margin: 0 }}>
            Financial Overview
          </h1>
        </div>

        {/* Top Right Quick Actions & Summary */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {onOpenReceiptScan && (
            <button
              type="button"
              onClick={onOpenReceiptScan}
              className="btn-glass-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', color: '#00F0FF', borderColor: 'rgba(0, 240, 255, 0.3)' }}
            >
              📸 Scan Receipt
            </button>
          )}
          {onOpenEcommerceSync && (
            <button
              type="button"
              onClick={onOpenEcommerceSync}
              className="btn-glass-secondary"
              style={{ padding: '6px 12px', fontSize: '12px', color: '#FF9900', borderColor: 'rgba(255, 153, 0, 0.3)' }}
            >
              🛍️ E-Commerce Sync
            </button>
          )}
          {onAddExpense && (
            <button
              type="button"
              onClick={onAddExpense}
              className="btn-primary-mint"
              style={{ padding: '6px 14px', fontSize: '12px', height: '32px' }}
            >
              + Expense
            </button>
          )}

          <button
            type="button"
            onClick={() => fetchDashboardData(true)}
            disabled={refreshing}
            className="btn-glass-secondary"
            style={{ padding: '6px 10px', fontSize: '12px', height: '32px', color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.3)' }}
            title="Refresh Live Financial Engine"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              padding: '6px 14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}>
              <span style={{ color: '#94A3B8' }}>Savings Rate:</span>
              <span className="tabular-nums" style={{ fontWeight: 800, color: (cashFlowSummary.savingsRate || 0) >= 20 ? '#00FF87' : '#FFD700' }}>
                {cashFlowSummary.savingsRate || 0}%
              </span>
            </div>
            <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.1)' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}>
              <span style={{ color: '#94A3B8' }}>Cycle:</span>
              <span style={{ fontWeight: 700, color: '#F1F5F9' }}>
                {daysRemaining} days left
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. 4-CARD BENTO KPI GRID */}
      <div className="grid-kpi">
        {/* Card 1: Spent This Month */}
        <PinCard
          title="Spent This Month"
          amount={monthlySummary.totalSpend}
          overlayPill="Outflow"
          pillColor="mint"
          sparklineData={sparklineSpend}
          trendDirection={monthlyComparison.isIncrease ? 'up' : 'down'}
          trendPercent={monthlyComparison.changePercent}
          subtitle={`${monthlyComparison.changePercent}% ${monthlyComparison.isIncrease ? 'increase' : 'decrease'} vs last month`}
        />

        {/* Card 2: Inflow & Net Surplus */}
        <PinCard
          title="Monthly Inflow"
          amount={cashFlowSummary.totalIncome}
          overlayPill={cashFlowSummary.netSavings >= 0 ? `+₹${(cashFlowSummary.netSavings || 0).toLocaleString()} Surplus` : `-₹${Math.abs(cashFlowSummary.netSavings || 0).toLocaleString()} Deficit`}
          pillColor={cashFlowSummary.netSavings >= 0 ? 'emerald' : 'rose'}
          sparklineData={sparklineCashflow}
          subtitle={`Net Savings Rate: ${cashFlowSummary.savingsRate || 0}% of income`}
        />

        {/* Card 3: Daily Pace & Burn */}
        <PinCard
          title="Daily Average Pace"
          amount={monthlySummary.averageDailySpend}
          overlayPill={velocityWarning ? "Accelerating ⚡" : "On Pace 🛡️"}
          pillColor={velocityWarning ? "amber" : "emerald"}
          sparklineData={sparklineBudget}
          radialProgress={cyclePaceProgress}
          subtitle={`${daysRemaining} days left in cycle • Burn ₹${monthlySummary.averageDailySpend}/day`}
        />

        {/* Card 4: Projected Month End */}
        <PinCard
          title="Projected Month End"
          amount={spendingVelocity.projectedMonthEndSpend}
          overlayPill="AI Forecast"
          pillColor="cyan"
          sparklineData={sparklineForecast}
          subtitle="Estimated total spend based on velocity"
        />
      </div>

      {/* 3. AI SUMMARY WEATHER REPORT BANNER */}
      {modules.aiCopilot !== false && aiSummary && (
        <motion.div
          whileHover={{ y: -1 }}
          transition={{ duration: 0.15 }}
          className="glass-card"
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(10, 14, 24, 0.9) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: '280px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8B5CF6, #00FF87)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Sparkles size={18} color="#050810" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#F1F5F9' }}>
                  AI Wealth Intelligence Synthesis
                </span>
                <span style={{ fontSize: '10px', fontWeight: 800, color: '#00FF87', background: 'rgba(0, 255, 135, 0.12)', padding: '1px 6px', borderRadius: '4px' }}>
                  RADAR ACTIVE
                </span>
              </div>
              <p style={{ fontSize: '13.5px', color: '#E2E8F0', lineHeight: 1.5, margin: 0 }}>
                "{aiSummary.summaryText}"
              </p>
            </div>
          </div>

          {/* Ask Copilot Quick Prompts */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={onOpenCopilot}
              className="glass-pill"
              style={{ cursor: 'pointer', borderColor: 'rgba(0, 255, 135, 0.3)', color: '#00FF87' }}
            >
              <MessageSquare size={12} />
              "Analyze my spend"
            </button>
            <button
              onClick={onOpenCopilot}
              className="glass-pill"
              style={{ cursor: 'pointer', borderColor: 'rgba(255, 215, 0, 0.3)', color: '#FFD700' }}
            >
              <Flame size={12} />
              "Where can I save?"
            </button>
          </div>
        </motion.div>
      )}

      {/* 4. TWO-COLUMN CORE ANALYTICS: FHI Score + Category Breakdown */}
      <div className="grid-2col">
        
        {/* Left Column: Financial Health Index */}
        {data.financialHealth ? (
          <FinancialHealthCard healthData={data.financialHealth} />
        ) : (
          <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#64748B' }}>Financial Health Score calculating...</span>
          </div>
        )}

        {/* Right Column: Category Breakdown Interactive Donut */}
        <div className="glass-card" style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 className="heading-lg" style={{ margin: 0 }}>
                Category Allocation
              </h3>
              <span style={{ fontSize: '11.5px', color: '#64748B' }}>Breakdown of monthly outflows</span>
            </div>
            <span className="glass-pill" style={{ color: '#FFD700', borderColor: 'rgba(255, 215, 0, 0.25)' }}>
              <Award size={12} /> Top: {chartCategoryData[0]?.name || 'N/A'}
            </span>
          </div>

          {chartCategoryData.length > 0 ? (
            <div>
              <div style={{ width: '100%', height: 180, position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={54}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      cornerRadius={6}
                    >
                      {chartCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(8, 11, 17, 0.8)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Stat Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    pointerEvents: 'none',
                  }}
                  className={isPrivacyMaskActive ? 'privacy-masked' : ''}
                >
                  <div style={{ fontSize: '10px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Spend
                  </div>
                  <div className="font-display tabular-nums" style={{ fontSize: '17px', fontWeight: 800, color: '#00FF87' }}>
                    ₹{monthlySummary.totalSpend.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Progress Bars for Top Categories */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {chartCategoryData.slice(0, 4).map((cat) => (
                  <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', flexShrink: 0 }}>{cat.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#F1F5F9', marginBottom: '2px' }}>
                        <span>{cat.name}</span>
                        <span className="tabular-nums" style={{ color: cat.color }}>
                          ₹{cat.value.toLocaleString()} ({cat.percentage}%)
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${cat.percentage}%`, background: cat.color, borderRadius: '999px' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>
              No transaction categories recorded this cycle.
            </div>
          )}

        </div>
      </div>

      {/* 4.5 LIFESTYLE & HABIT LEARNING NUDGES */}
      {modules.lifestyleHabits !== false && (
        <HabitNudgesCard expenses={data.recentExpenses || []} incomes={[]} />
      )}

      {/* 5. PRIORITIZED ANOMALY & RADAR INSIGHTS */}
      {modules.aiCopilot !== false && insights.length > 0 && (
        <div className="glass-card" style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 className="heading-md" style={{ margin: 0 }}>
                Automated Wealth Alerts & Insights
              </h3>
              <span style={{ fontSize: '12px', color: '#64748B' }}>Anomaly detection & budget pacing</span>
            </div>
            <span className="glass-pill" style={{ color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.25)' }}>
              <ShieldCheck size={12} /> {insights.length} Signals
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
            {insights.map((ins) => {
              const isWarning = ins.title.toLowerCase().includes('high') || ins.title.toLowerCase().includes('alert') || ins.title.toLowerCase().includes('exceed');
              return (
                <div
                  key={ins.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: isWarning ? 'rgba(245, 158, 11, 0.12)' : 'rgba(0, 255, 135, 0.12)',
                      border: isWarning ? '1px solid rgba(245, 158, 11, 0.25)' : '1px solid rgba(0, 255, 135, 0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {isWarning ? <AlertTriangle size={15} color="#F59E0B" /> : <ShieldCheck size={15} color="#00FF87" />}
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#F1F5F9', margin: 0 }}>{ins.title}</h4>
                      <span className="tabular-nums" style={{ fontSize: '11px', fontWeight: 800, color: isWarning ? '#F59E0B' : '#00FF87' }}>
                        {ins.metric}
                      </span>
                    </div>
                    <p style={{ fontSize: '11.5px', color: '#94A3B8', lineHeight: 1.35, margin: '2px 0 6px 0' }}>
                      {ins.explanation}
                    </p>
                    <button
                      onClick={onOpenCopilot}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#00FF87',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        padding: 0,
                      }}
                    >
                      Ask Copilot to optimize <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
