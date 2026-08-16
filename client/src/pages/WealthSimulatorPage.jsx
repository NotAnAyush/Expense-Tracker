import React, { useState, useEffect } from 'react';
import { 
  Flame, 
  Sparkles, 
  TrendingUp, 
  Sliders, 
  ShieldCheck, 
  Calendar, 
  DollarSign, 
  Percent, 
  Zap, 
  RefreshCw, 
  ArrowUpRight, 
  Target, 
  Activity 
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { motion } from 'framer-motion';
import { apiFetch } from '../api/client';
import { usePrivacy } from '../context/PrivacyContext';

export const WealthSimulatorPage = () => {
  const { isPrivacyMaskActive } = usePrivacy();
  const [loading, setLoading] = useState(true);
  const [contextData, setContextData] = useState(null);
  const [activeTab, setActiveTab] = useState('fire'); // 'fire' | 'whatif' | 'montecarlo'

  // What-If Sandbox Inputs
  const [deltaIncome, setDeltaIncome] = useState(20000);
  const [deltaExpense, setDeltaExpense] = useState(-5000);
  const [deltaOneTime, setDeltaOneTime] = useState(100000);
  const [expectedReturn, setExpectedReturn] = useState(11.5);
  const [whatIfResults, setWhatIfResults] = useState(null);
  const [calculatingWhatIf, setCalculatingWhatIf] = useState(false);

  // Monte Carlo Custom Inputs
  const [mcYears, setMcYears] = useState(25);
  const [mcMonthlyContrib, setMcMonthlyContrib] = useState(30000);
  const [mcResults, setMcResults] = useState(null);
  const [runningMc, setRunningMc] = useState(false);

  const fetchContext = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/simulations/context');
      setContextData(res);
      if (res.monteCarlo) {
        setMcResults(res.monteCarlo);
        setMcMonthlyContrib(res.monteCarlo.monthlyContribution || 30000);
      }
    } catch (err) {
      console.error('Failed to load simulation context:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateWhatIf = async () => {
    if (!contextData?.context) return;
    try {
      setCalculatingWhatIf(true);
      const res = await apiFetch('/simulations/what-if', {
        method: 'POST',
        body: JSON.stringify({
          currentMonthlyIncome: contextData.context.currentMonthlyIncome,
          currentMonthlyExpense: contextData.context.currentMonthlyExpense,
          currentNetWorth: contextData.context.currentNetWorth,
          deltaIncome,
          deltaExpense,
          deltaOneTime,
          annualReturnPct: expectedReturn,
        }),
      });
      setWhatIfResults(res);
    } catch (err) {
      console.error('What-If simulation failed:', err);
    } finally {
      setCalculatingWhatIf(false);
    }
  };

  const runCustomMonteCarlo = async () => {
    if (!contextData?.context) return;
    try {
      setRunningMc(true);
      const res = await apiFetch('/simulations/monte-carlo', {
        method: 'POST',
        body: JSON.stringify({
          currentNetWorth: contextData.context.currentNetWorth,
          monthlyContribution: mcMonthlyContrib,
          years: mcYears,
          expectedReturn,
          volatility: 15.0,
          inflation: 6.0,
          runs: 1000,
        }),
      });
      setMcResults(res);
    } catch (err) {
      console.error('Monte Carlo run failed:', err);
    } finally {
      setRunningMc(false);
    }
  };

  useEffect(() => {
    fetchContext();
  }, []);

  useEffect(() => {
    if (contextData?.context) {
      calculateWhatIf();
    }
  }, [contextData, deltaIncome, deltaExpense, deltaOneTime, expectedReturn]);

  const fire = contextData?.fireMilestones;
  const ctx = contextData?.context;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span className="glass-pill" style={{ color: '#FF7D7D', borderColor: 'rgba(255, 125, 125, 0.3)' }}>
              <Flame size={12} /> FIRE & Monte Carlo Engine
            </span>
            <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>• Sovereign Wealth Projections</span>
          </div>
          <h1 className="display-xl">Wealth & FIRE Simulator</h1>
          <p style={{ fontSize: '14px', color: '#94A3B8', marginTop: '4px' }}>
            Simulate life decision What-Ifs, calculate your Rule-of-25 FIRE retirement date, and run 1,000 Monte Carlo stochastic scenarios.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(255, 255, 255, 0.04)', padding: '4px', borderRadius: '14px' }}>
          {[
            { id: 'fire', label: 'FIRE Freedom Planner', icon: Flame },
            { id: 'whatif', label: 'What-If Sandbox', icon: Sliders },
            { id: 'montecarlo', label: '1,000-Run Monte Carlo', icon: Activity },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeTab === t.id ? 'linear-gradient(135deg, #00FF87 0%, #60EFFF 100%)' : 'transparent',
                  color: activeTab === t.id ? '#050810' : '#94A3B8',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <Icon size={14} />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '64px', textAlign: 'center', color: '#94A3B8' }}>
          <RefreshCw size={32} className="animate-spin" style={{ margin: '0 auto 12px', color: '#00FF87' }} />
          <div>Synthesizing portfolio trajectory & Monte Carlo probability curves...</div>
        </div>
      ) : (
        <>
          {/* TAB 1: FIRE FREEDOM PLANNER */}
          {activeTab === 'fire' && fire && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Summary KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Target FIRE Corpus (25x)</div>
                  <div
                    className={`font-display ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}
                    style={{ fontSize: '28px', fontWeight: 800, color: '#00FF87', marginTop: '4px' }}
                  >
                    ₹{(fire.milestones.standardFire.target / 10000000).toFixed(2)} Cr
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                    Rule of 25 (4% Safe Withdrawal Rate)
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Years to Freedom</div>
                  <div className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: '#00F0FF', marginTop: '4px' }}>
                    {fire.yearsToFire} Years
                  </div>
                  <div style={{ fontSize: '12px', color: '#00F0FF', marginTop: '4px' }}>
                    Estimated {new Date(fire.fireDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Current Savings Rate</div>
                  <div className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: '#FFD700', marginTop: '4px' }}>
                    {fire.savingsRate}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                    Saving ₹{fire.monthlySavings.toLocaleString()}/month
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase' }}>Coast FIRE Status</div>
                  <div className="font-display" style={{ fontSize: '22px', fontWeight: 800, color: fire.milestones.coastFire.isCoastAchieved ? '#00FF87' : '#FF7D7D', marginTop: '4px' }}>
                    {fire.milestones.coastFire.isCoastAchieved ? 'Coast Achieved ✓' : `Target: ₹${(fire.milestones.coastFire.target / 100000).toFixed(1)}L`}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                    Self-sustaining compounding to 60
                  </div>
                </div>
              </div>

              {/* 3-Tier FIRE Thresholds */}
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 className="heading-md" style={{ color: '#F1F5F9', marginBottom: '16px' }}>
                  Multi-Tiered FIRE Target Milestones
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '18px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, color: '#00F0FF', fontSize: '16px', fontWeight: 700 }}>Lean FIRE</h4>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>20x Annual Spend</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: '6px 0 12px' }}>
                      Frugal essentials-only living (5% Safe Withdrawal Rate).
                    </p>
                    <div
                      className={`font-display ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}
                      style={{ fontSize: '24px', fontWeight: 800, color: '#00F0FF' }}
                    >
                      ₹{(fire.milestones.leanFire.target / 10000000).toFixed(2)} Cr
                    </div>
                  </div>

                  <div style={{ background: 'rgba(0, 255, 135, 0.06)', border: '1.5px solid rgba(0, 255, 135, 0.35)', borderRadius: '18px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, color: '#00FF87', fontSize: '16px', fontWeight: 700 }}>Standard FIRE</h4>
                      <span style={{ fontSize: '11px', color: '#00FF87', fontWeight: 700 }}>25x Annual Spend ★</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: '6px 0 12px' }}>
                      Current lifestyle full financial freedom (4% Safe Withdrawal Rate).
                    </p>
                    <div
                      className={`font-display ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}
                      style={{ fontSize: '24px', fontWeight: 800, color: '#00FF87' }}
                    >
                      ₹{(fire.milestones.standardFire.target / 10000000).toFixed(2)} Cr
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255, 215, 0, 0.05)', border: '1px solid rgba(255, 215, 0, 0.3)', borderRadius: '18px', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h4 style={{ margin: 0, color: '#FFD700', fontSize: '16px', fontWeight: 700 }}>Fat FIRE</h4>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>33x Annual Spend</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: '6px 0 12px' }}>
                      Abundance & luxury living with zero compromises (3% Safe Withdrawal Rate).
                    </p>
                    <div
                      className={`font-display ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}
                      style={{ fontSize: '24px', fontWeight: 800, color: '#FFD700' }}
                    >
                      ₹{(fire.milestones.fatFire.target / 10000000).toFixed(2)} Cr
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WHAT-IF SANDBOX */}
          {activeTab === 'whatif' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-card" style={{ padding: '24px' }}>
                <h3 className="heading-md" style={{ color: '#F1F5F9', marginBottom: '8px' }}>
                  What-If Scenario Sandbox
                </h3>
                <p style={{ fontSize: '13.5px', color: '#94A3B8', margin: '0 0 20px' }}>
                  Adjust life variables to immediately calculate the compounding delta on your future net worth.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                      Monthly Salary / Income Change (₹)
                    </label>
                    <input
                      type="number"
                      step="5000"
                      value={deltaIncome}
                      onChange={(e) => setDeltaIncome(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(0, 255, 135, 0.3)',
                        color: '#00FF87',
                        fontWeight: 700,
                        fontSize: '14px',
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748B' }}>e.g. +20000 for promo/job switch</span>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                      Monthly Expense Shift (₹)
                    </label>
                    <input
                      type="number"
                      step="1000"
                      value={deltaExpense}
                      onChange={(e) => setDeltaExpense(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 125, 125, 0.3)',
                        color: deltaExpense > 0 ? '#FF7D7D' : '#00FF87',
                        fontWeight: 700,
                        fontSize: '14px',
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748B' }}>e.g. -5000 optimization or +8000 rent hike</span>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                      Lump Sum Injected / One-time (₹)
                    </label>
                    <input
                      type="number"
                      step="25000"
                      value={deltaOneTime}
                      onChange={(e) => setDeltaOneTime(parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                        color: '#FFD700',
                        fontWeight: 700,
                        fontSize: '14px',
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748B' }}>e.g. +100000 bonus or ESOP vesting</span>
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                      Expected Annual Return (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="30"
                      value={expectedReturn}
                      onChange={(e) => setExpectedReturn(parseFloat(e.target.value) || 11.5)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.12)',
                        color: '#F8FAFC',
                        fontWeight: 700,
                        fontSize: '14px',
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748B' }}>e.g. 11.5% Nifty 50 long-term CAGR</span>
                  </div>
                </div>
              </div>

              {/* What-If Future Delta Cards */}
              {whatIfResults && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {whatIfResults.projections.map((p) => (
                    <motion.div
                      key={p.years}
                      whileHover={{ scale: 1.02 }}
                      className="glass-card"
                      style={{ padding: '20px' }}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                        {p.years} Year Outlook
                      </div>
                      <div
                        className={`font-display ${isPrivacyMaskActive ? 'privacy-masked' : ''}`}
                        style={{ fontSize: '22px', fontWeight: 800, color: '#00FF87', marginTop: '6px' }}
                      >
                        ₹{(p.scenarioNetWorth / 100000).toFixed(1)}L
                      </div>
                      <div style={{ fontSize: '12px', color: p.netGain >= 0 ? '#00FF87' : '#FF7D7D', marginTop: '4px', fontWeight: 700 }}>
                        {p.netGain >= 0 ? '+' : ''}₹{(p.netGain / 100000).toFixed(1)}L Net Delta
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                        Base: ₹{(p.baseNetWorth / 100000).toFixed(1)}L
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: 1,000-RUN MONTE CARLO SIMULATION */}
          {activeTab === 'montecarlo' && mcResults && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <h3 className="heading-md" style={{ color: '#F1F5F9', margin: 0 }}>
                      1,000 Stochastic Market Run Simulation
                    </h3>
                    <p style={{ fontSize: '13px', color: '#94A3B8', margin: '2px 0 0' }}>
                      Models market volatility ($\sigma = 15\%$) and inflation ($\pi = 6\%$) across 1,000 parallel futures
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>Monthly SIP:</span>
                      <input
                        type="number"
                        step="5000"
                        value={mcMonthlyContrib}
                        onChange={(e) => setMcMonthlyContrib(parseFloat(e.target.value) || 0)}
                        style={{
                          width: '100px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          background: '#0A0D14',
                          border: '1px solid rgba(0, 255, 135, 0.3)',
                          color: '#00FF87',
                          fontSize: '13px',
                          textAlign: 'right',
                        }}
                      />
                    </div>

                    <button
                      onClick={runCustomMonteCarlo}
                      disabled={runningMc}
                      className="btn-primary-mint"
                      style={{ padding: '8px 16px', fontSize: '12px' }}
                    >
                      {runningMc ? 'Simulating...' : 'Re-Run 1,000 Paths'}
                    </button>
                  </div>
                </div>

                {/* Monte Carlo Confidence Area Chart */}
                <div style={{ width: '100%', height: '360px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={mcResults.trajectory} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBullish" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00FF87" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#00FF87" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorMedian" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorBearish" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#FF7D7D" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#FF7D7D" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                      <XAxis dataKey="year" stroke="#64748B" tickFormatter={(v) => `Yr ${v}`} />
                      <YAxis stroke="#64748B" tickFormatter={(v) => `₹${(v / 10000000).toFixed(1)}Cr`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F1420',
                          border: '1px solid rgba(0, 255, 135, 0.3)',
                          borderRadius: '12px',
                        }}
                        formatter={(val) => `₹${(val / 10000000).toFixed(2)} Cr`}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="bullish_P90" name="Bullish (90th %ile)" stroke="#00FF87" fillOpacity={1} fill="url(#colorBullish)" />
                      <Area type="monotone" dataKey="median_P50" name="Median (50th %ile)" stroke="#00F0FF" fillOpacity={1} fill="url(#colorMedian)" />
                      <Area type="monotone" dataKey="bearish_P10" name="Bearish (10th %ile)" stroke="#FF7D7D" fillOpacity={1} fill="url(#colorBearish)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
