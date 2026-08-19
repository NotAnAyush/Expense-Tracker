import React, { useState, useEffect, useMemo } from 'react';
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
  Activity, 
  HelpCircle, 
  X, 
  BookOpen, 
  Info, 
  Layers, 
  BarChart3, 
  PieChart as PieIcon, 
  ShieldAlert, 
  Clock, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  Award, 
  ChevronRight, 
  Play, 
  Briefcase, 
  Home, 
  Coffee, 
  PiggyBank, 
  Rocket, 
  GraduationCap, 
  Download, 
  Copy, 
  Table as TableIcon, 
  Check, 
  FileText,
  Lock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  LineChart, 
  Line, 
  ReferenceLine 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { apiFetch } from '../api/client';
import { usePrivacy } from '../context/PrivacyContext';

// Preset Asset Allocations
const ASSET_PRESETS = [
  { id: 'aggressive', name: 'Aggressive Alpha (80/15/5)', equity: 80, debt: 15, gold: 5, cash: 0, desc: 'Maximum compounding for long horizons' },
  { id: 'balanced', name: 'Balanced Classic 60/40', equity: 60, debt: 35, gold: 5, cash: 0, desc: 'Standard endowment portfolio' },
  { id: 'allweather', name: 'Ray Dalio All-Weather', equity: 30, debt: 55, gold: 15, cash: 0, desc: 'Extreme macro crisis resilience' },
  { id: 'conservative', name: 'Capital Preservation', equity: 25, debt: 65, gold: 5, cash: 5, desc: 'Near retirement or low risk tolerance' },
];

// Preset What-If Scenarios
const WHAT_IF_PRESETS = [
  {
    id: 'promotion',
    title: 'Career Surge / Promotion',
    icon: Rocket,
    color: '#00FF87',
    deltaIncome: 35000,
    deltaExpense: 5000,
    stepUpPct: 10,
    oneTime: 100000,
    desc: '+₹35k/mo salary hike, +10% annual career step-up & ₹1L signing bonus.',
  },
  {
    id: 'frugal',
    title: 'Frugal FIRE Optimization',
    icon: PiggyBank,
    color: '#00F0FF',
    deltaIncome: 0,
    deltaExpense: -12000,
    stepUpPct: 5,
    oneTime: 0,
    desc: 'Cut subscriptions, optimize rent & bills to save +₹12,000/month.',
  },
  {
    id: 'home',
    title: 'Home Purchase Downpayment',
    icon: Home,
    color: '#FFD700',
    deltaIncome: 0,
    deltaExpense: 15000,
    stepUpPct: 0,
    oneTime: -2500000,
    timedYear: 3,
    desc: '₹25 Lakh downpayment at Year 3 + ₹15k/mo home EMI increase.',
  },
  {
    id: 'sabbatical',
    title: 'Sabbatical / Gap Year',
    icon: Coffee,
    color: '#F43F5E',
    deltaIncome: -50000,
    deltaExpense: 0,
    stepUpPct: 0,
    oneTime: -200000,
    desc: '1-year self-funded break/travel with zero salary & ₹2L trip expense.',
  },
  {
    id: 'startup',
    title: 'Startup / High-Beta Venture',
    icon: Briefcase,
    color: '#D946EF',
    deltaIncome: -30000,
    deltaExpense: 0,
    stepUpPct: 15,
    oneTime: 1500000,
    timedYear: 5,
    desc: 'Take pay cut now, followed by ₹15L ESOP windfall at Year 5.',
  },
];

export const WealthSimulatorPage = () => {
  const { isPrivacyMaskActive } = usePrivacy();
  const [loading, setLoading] = useState(true);
  const [contextData, setContextData] = useState(null);
  const [activeTab, setActiveTab] = useState('fire'); // 'fire' | 'whatif' | 'montecarlo' | 'summary'

  // Guide & Table Modals State
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [guideTab, setGuideTab] = useState('fire');
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Interactive FIRE Planner State
  const [fireIncome, setFireIncome] = useState(100000);
  const [fireExpense, setFireExpense] = useState(45000);
  const [fireNetWorth, setFireNetWorth] = useState(500000);
  const [fireReturn, setFireReturn] = useState(11.5);
  const [fireInflation, setFireInflation] = useState(6.0);
  const [fireSwrPct, setFireSwrPct] = useState(4.0);
  const [fireStepUpPct, setFireStepUpPct] = useState(5.0);
  const [fireTargetRetireAge, setFireTargetRetireAge] = useState(55);
  const [fireCurrentAge, setFireCurrentAge] = useState(28);

  // What-If Sandbox Inputs
  const [deltaIncome, setDeltaIncome] = useState(25000);
  const [deltaExpense, setDeltaExpense] = useState(-5000);
  const [deltaOneTime, setDeltaOneTime] = useState(100000);
  const [whatIfReturn, setWhatIfReturn] = useState(11.5);
  const [whatIfStepUp, setWhatIfStepUp] = useState(5.0);
  const [timedEvents, setTimedEvents] = useState([
    { year: 5, amount: 500000, description: 'ESOP / Bonus Vesting' }
  ]);
  const [whatIfResults, setWhatIfResults] = useState(null);
  const [calculatingWhatIf, setCalculatingWhatIf] = useState(false);

  // Monte Carlo Custom Inputs
  const [mcRuns, setMcRuns] = useState(10000); // 1000, 5000, 10000, 25000, 50000
  const [mcYears, setMcYears] = useState(25);
  const [mcMonthlyContrib, setMcMonthlyContrib] = useState(40000);
  const [mcAnnualWithdrawal, setMcAnnualWithdrawal] = useState(0);
  const [mcExpectedReturn, setMcExpectedReturn] = useState(11.5);
  const [mcVolatility, setMcVolatility] = useState(15.0);
  const [mcInflation, setMcInflation] = useState(6.0);
  const [mcModel, setMcModel] = useState('gbm'); // 'gbm' | 'jump_diffusion' | 'historical_bootstrap'
  const [mcPhase, setMcPhase] = useState('accumulation'); // 'accumulation' | 'decumulation' | 'lifecycle'
  const [mcSelectedPreset, setMcSelectedPreset] = useState('aggressive');
  const [mcAssetAllocation, setMcAssetAllocation] = useState({ equity: 80, debt: 15, gold: 5, cash: 0 });
  const [mcStepUpPct, setMcStepUpPct] = useState(5.0);
  const [mcGlidePath, setMcGlidePath] = useState(false);
  const [mcGuardrails, setMcGuardrails] = useState(false);
  const [isNominalDisplay, setIsNominalDisplay] = useState(false);
  const [showSpaghettiPaths, setShowSpaghettiPaths] = useState(true);
  const [mcResults, setMcResults] = useState(null);
  const [runningMc, setRunningMc] = useState(false);

  // Fetch initial context from backend
  const fetchContext = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/simulations/context');
      setContextData(res);

      if (res?.context) {
        setFireIncome(res.context.currentMonthlyIncome || 100000);
        setFireExpense(res.context.currentMonthlyExpense || 45000);
        setFireNetWorth(res.context.currentNetWorth || 500000);
        setFireTargetRetireAge(res.context.targetRetirementAge || 55);
        setFireCurrentAge(res.context.currentAge || 28);
        setMcMonthlyContrib(Math.max(0, (res.context.currentMonthlyIncome || 100000) - (res.context.currentMonthlyExpense || 45000)));
      }

      if (res?.monteCarlo) {
        setMcResults(res.monteCarlo);
      }
    } catch (err) {
      console.error('[WealthSimulatorPage:fetchContext]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContext();
  }, []);

  // Run What-If Calculation
  const runWhatIfCalculation = async () => {
    try {
      setCalculatingWhatIf(true);
      const payload = {
        currentMonthlyIncome: Number(fireIncome),
        currentMonthlyExpense: Number(fireExpense),
        currentNetWorth: Number(fireNetWorth),
        deltaIncome: Number(deltaIncome),
        deltaExpense: Number(deltaExpense),
        deltaOneTime: Number(deltaOneTime),
        annualReturnPct: Number(whatIfReturn),
        annualStepUpPct: Number(whatIfStepUp),
        timedEvents,
      };
      const res = await apiFetch('/simulations/what-if', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setWhatIfResults(res);
    } catch (err) {
      console.error('[WealthSimulatorPage:runWhatIfCalculation]', err);
    } finally {
      setCalculatingWhatIf(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'whatif') {
      runWhatIfCalculation();
    }
  }, [activeTab, fireIncome, fireExpense, fireNetWorth, deltaIncome, deltaExpense, deltaOneTime, whatIfReturn, whatIfStepUp, timedEvents]);

  // Run Monte Carlo Simulation
  const triggerMonteCarlo = async (overrideRuns) => {
    try {
      setRunningMc(true);
      const payload = {
        currentNetWorth: Number(fireNetWorth),
        monthlyContribution: Number(mcMonthlyContrib),
        annualExpenseWithdrawal: Number(mcAnnualWithdrawal),
        years: Number(mcYears),
        expectedReturn: Number(mcExpectedReturn),
        volatility: Number(mcVolatility),
        inflation: Number(mcInflation),
        runs: Number(overrideRuns || mcRuns),
        model: mcModel,
        phase: mcPhase,
        assetAllocation: mcAssetAllocation,
        stepUpPct: Number(mcStepUpPct),
        glidePathEnabled: mcGlidePath,
        guardrailsEnabled: mcGuardrails,
      };
      const res = await apiFetch('/simulations/monte-carlo', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setMcResults(res);
    } catch (err) {
      console.error('[WealthSimulatorPage:triggerMonteCarlo]', err);
    } finally {
      setRunningMc(false);
    }
  };

  // Switch Asset Preset
  const handleSelectAssetPreset = (presetId) => {
    setMcSelectedPreset(presetId);
    const preset = ASSET_PRESETS.find((p) => p.id === presetId);
    if (preset) {
      setMcAssetAllocation({
        equity: preset.equity,
        debt: preset.debt,
        gold: preset.gold,
        cash: preset.cash,
      });
    }
  };

  // Apply What-If Preset
  const handleApplyWhatIfPreset = (preset) => {
    setDeltaIncome(preset.deltaIncome);
    setDeltaExpense(preset.deltaExpense);
    setWhatIfStepUp(preset.stepUpPct);
    setDeltaOneTime(preset.oneTime);
    if (preset.timedYear) {
      setTimedEvents([{ year: preset.timedYear, amount: preset.oneTime, description: preset.title }]);
    } else {
      setTimedEvents([]);
    }
  };

  // Format INR Helper with Privacy Mask
  const formatINR = (val, compact = false) => {
    if (isPrivacyMaskActive) return '••••••';
    const num = Number(val) || 0;
    if (compact) {
      if (Math.abs(num) >= 10000000) return `₹${(num / 10000000).toFixed(2)} Cr`;
      if (Math.abs(num) >= 100000) return `₹${(num / 100000).toFixed(2)} L`;
      if (Math.abs(num) >= 1000) return `₹${(num / 1000).toFixed(1)}k`;
      return `₹${num.toLocaleString('en-IN')}`;
    }
    return `₹${Math.round(num).toLocaleString('en-IN')}`;
  };

  // Download Year-by-Year CSV
  const handleDownloadCsv = () => {
    if (!mcResults?.trajectory) return;
    const headers = ['Year', 'Deep Bear (P5)', 'Bearish (P10)', 'Lower Quartile (P25)', 'Median (P50)', 'Upper Quartile (P75)', 'Bullish (P90)', 'Super Bull (P95)', 'Nominal P50'];
    const rows = mcResults.trajectory.map((row) => [
      row.year,
      row.deepBear_P5,
      row.bearish_P10,
      row.lowerQuartile_P25,
      row.median_P50,
      row.upperQuartile_P75,
      row.bullish_P90,
      row.superBull_P95,
      row.nominal_P50 || row.median_P50
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `monte_carlo_quant_distribution_${mcRuns}_runs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy Executive Quant Summary to Clipboard
  const handleCopySummary = () => {
    if (!mcResults || !fireData) return;
    const text = `
=== RICHY RICH QUANTITATIVE WEALTH AUDIT ===
Simulated Runs: ${mcResults.runs.toLocaleString()} paths (${mcResults.model.toUpperCase()})
Portfolio Survival Probability: ${mcResults.metrics.successProbabilityPct}%
Ruin Probability: ${mcResults.metrics.ruinProbabilityPct}%
Value at Risk (VaR 95%): ${formatINR(mcResults.metrics.valueAtRisk95, true)}
Expected Shortfall (CVaR): ${formatINR(mcResults.metrics.conditionalVaR95, true)}
Sharpe Ratio: ${mcResults.metrics.sharpeRatio}
Median Year ${mcResults.years} Corpus (P50): ${formatINR(mcResults.finalYearMetrics.median_P50, true)}
Standard FIRE Target Corpus: ${formatINR(fireData.milestones.standardFire.target, true)}
Projected FIRE Countdown: ${fireData.yearsToFire} Years (${new Date(fireData.fireDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })})
===========================================
    `.trim();
    navigator.clipboard.writeText(text);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  // Compute Live Interactive FIRE Milestones
  const fireData = useMemo(() => {
    const annualExpenses = fireExpense * 12;
    const monthlySavings = Math.max(0, fireIncome - fireExpense);
    const savingsRate = fireIncome > 0 ? Math.round((monthlySavings / fireIncome) * 10000) / 100 : 0;

    const realReturnRate = ((1 + fireReturn / 100) / (1 + fireInflation / 100)) - 1;
    const realMonthlyRate = realReturnRate / 12;

    const leanFireNumber = Math.round(annualExpenses * 20);
    const baristaFireNumber = Math.round(annualExpenses * 15);
    const standardFireNumber = Math.round(annualExpenses * (100 / (fireSwrPct || 4.0)));
    const chubbyFireNumber = Math.round(annualExpenses * 30);
    const fatFireNumber = Math.round(annualExpenses * 35);

    const yearsToRetire = Math.max(1, fireTargetRetireAge - fireCurrentAge);
    const coastFireNumber = Math.round(standardFireNumber / Math.pow(1 + Math.max(0.001, realReturnRate), yearsToRetire));
    const isCoastAchieved = fireNetWorth >= coastFireNumber;

    let monthsToFire = 0;
    let accumulated = fireNetWorth;
    const maxMonths = 720;

    while (accumulated < standardFireNumber && monthsToFire < maxMonths) {
      monthsToFire++;
      const currentYear = Math.floor(monthsToFire / 12);
      const currentMonthlySavings = monthlySavings * Math.pow(1 + (fireStepUpPct / 100), currentYear);
      accumulated = accumulated * (1 + realMonthlyRate) + currentMonthlySavings;
    }

    const yearsToFire = Math.round((monthsToFire / 12) * 10) / 10;
    const now = new Date();
    const fireDate = new Date(now.getFullYear(), now.getMonth() + monthsToFire, 1);

    const velocityScore = Math.min(
      100,
      Math.round(savingsRate * 0.6 + Math.min(40, (fireNetWorth / (standardFireNumber || 1)) * 100 * 0.4))
    );

    return {
      annualExpenses,
      monthlySavings,
      savingsRate,
      customSwrPct: fireSwrPct,
      velocityScore,
      milestones: {
        leanFire: { multiplier: '20x (5.0% SWR)', target: leanFireNumber, description: 'Essentials & survival only' },
        baristaFire: { multiplier: '15x (6.7% SWR + side gig)', target: baristaFireNumber, description: 'Part-time passion income' },
        standardFire: { multiplier: `${(100 / fireSwrPct).toFixed(1)}x (${fireSwrPct}% SWR)`, target: standardFireNumber, description: 'Full lifestyle freedom' },
        chubbyFire: { multiplier: '30x (3.33% SWR)', target: chubbyFireNumber, description: 'Comfortable + regular travel' },
        fatFire: { multiplier: '35x (2.85% SWR)', target: fatFireNumber, description: 'Unconstrained luxury living' },
        coastFire: {
          target: coastFireNumber,
          isCoastAchieved,
          yearsToTargetAge: yearsToRetire,
          targetAge: fireTargetRetireAge,
        },
      },
      currentProgressPct: standardFireNumber > 0 ? Math.min(100, Math.round((fireNetWorth / standardFireNumber) * 1000) / 10) : 0,
      yearsToFire,
      monthsToFire,
      fireDate: fireDate.toISOString(),
      projectedAge: fireCurrentAge + Math.round(yearsToFire),
    };
  }, [fireIncome, fireExpense, fireNetWorth, fireReturn, fireInflation, fireSwrPct, fireStepUpPct, fireTargetRetireAge, fireCurrentAge]);

  // Combine percentile chart data with sample stochastic trajectories (spaghetti)
  const chartDataWithSpaghetti = useMemo(() => {
    if (!mcResults?.trajectory) return [];
    return mcResults.trajectory.map((row, idx) => {
      const point = { ...row };
      if (mcResults.sampleTrajectories && mcResults.sampleTrajectories.length > 0) {
        mcResults.sampleTrajectories.slice(0, 8).forEach((samplePath, pIdx) => {
          if (samplePath[idx]) {
            point[`sample_${pIdx}`] = isNominalDisplay && row.nominal_P50
              ? Math.round(samplePath[idx].value * (row.nominal_P50 / (row.median_P50 || 1)))
              : samplePath[idx].value;
          }
        });
      }
      return point;
    });
  }, [mcResults, isNominalDisplay]);

  // Custom Dark Glassmorphic Chart Tooltip
  const CustomWhatIfTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const baseVal = payload.find((p) => p.dataKey === 'baseNetWorth')?.value || 0;
      const scenarioVal = payload.find((p) => p.dataKey === 'scenarioNetWorth')?.value || 0;
      const diff = scenarioVal - baseVal;
      return (
        <div
          style={{
            background: 'rgba(10, 14, 24, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(0, 240, 255, 0.2)',
            minWidth: '220px'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Horizon: Year {label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94A3B8' }}>Scenario Corpus:</span>
              <span className="font-display tabular-nums" style={{ fontWeight: 800, color: '#00F0FF' }}>
                {formatINR(scenarioVal)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748B' }}>Baseline Corpus:</span>
              <span className="font-display tabular-nums" style={{ fontWeight: 600, color: '#CBD5E1' }}>
                {formatINR(baseVal)}
              </span>
            </div>
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '6px', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#94A3B8', fontSize: '11.5px' }}>Net Alpha Gain:</span>
              <span className="font-display tabular-nums" style={{ fontWeight: 800, color: diff >= 0 ? '#00FF87' : '#F43F5E' }}>
                {diff >= 0 ? `+${formatINR(diff)}` : formatINR(diff)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomMonteCarloTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const p90 = payload.find((p) => p.dataKey === 'bullish_P90')?.value;
      const p50 = payload.find((p) => p.dataKey === (isNominalDisplay ? 'nominal_P50' : 'median_P50'))?.value;
      const p10 = payload.find((p) => p.dataKey === 'bearish_P10')?.value;
      const p5 = payload.find((p) => p.dataKey === 'deepBear_P5')?.value;
      return (
        <div
          style={{
            background: 'rgba(10, 14, 24, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0, 255, 135, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(0, 255, 135, 0.2)',
            minWidth: '230px'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>
            Simulation Year {label} ({isNominalDisplay ? 'Nominal Values' : "Real Today's ₹"})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px' }}>
            {p90 !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#10B981' }}>Bullish (P90):</span>
                <span className="font-display tabular-nums" style={{ fontWeight: 800, color: '#10B981' }}>{formatINR(p90)}</span>
              </div>
            )}
            {p50 !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#00FF87' }}>Median (P50):</span>
                <span className="font-display tabular-nums" style={{ fontWeight: 800, color: '#00FF87' }}>{formatINR(p50)}</span>
              </div>
            )}
            {p10 !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#FB7185' }}>Bearish (P10):</span>
                <span className="font-display tabular-nums" style={{ fontWeight: 700, color: '#FB7185' }}>{formatINR(p10)}</span>
              </div>
            )}
            {p5 !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#F43F5E' }}>Crash Floor (P5):</span>
                <span className="font-display tabular-nums" style={{ fontWeight: 700, color: '#F43F5E' }}>{formatINR(p5)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
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
            Calibrating Stochastic Wealth Physics...
          </h2>
          <span style={{ fontSize: '13px', color: '#64748B' }}>
            Synthesizing Ito Drift, Jump Diffusion & Historical Bootstraps
          </span>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '70px' }}>
      
      {/* 1. HERO HEADER WITH LIVE BADGE & CONTROLS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span className="animate-live-dot" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#00FF87', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Institutional Stochastic Engine • v3.8
            </span>
          </div>
          <h1 className="display-xl" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            Wealth & FIRE Freedom Simulator
            <Sparkles size={24} color="#FFD700" />
          </h1>
          <p className="body-sm" style={{ margin: '4px 0 0 0', color: '#94A3B8' }}>
            Multi-asset Ito Geometric Brownian Motion (GBM), Merton Jump Diffusion, 55-year Historical Bootstrap, and Guyton-Klinkis Guardrails.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Guide & Tutorial Button */}
          <button
            type="button"
            onClick={() => setGuideModalOpen(true)}
            className="btn-glass-secondary"
            style={{
              height: '38px',
              padding: '0 16px',
              fontSize: '12.5px',
              color: '#00F0FF',
              borderColor: 'rgba(0, 240, 255, 0.3)'
            }}
          >
            <BookOpen size={15} />
            <span>How It Works & Quant Guide</span>
          </button>

          {/* Real vs Nominal Toggle */}
          <button
            type="button"
            onClick={() => setIsNominalDisplay(!isNominalDisplay)}
            className="btn-glass-secondary"
            style={{
              height: '38px',
              padding: '0 16px',
              fontSize: '12.5px',
              borderColor: isNominalDisplay ? 'rgba(255, 215, 0, 0.4)' : 'rgba(255, 255, 255, 0.1)',
              background: isNominalDisplay ? 'rgba(255, 215, 0, 0.1)' : 'rgba(255, 255, 255, 0.04)',
              color: isNominalDisplay ? '#FFD700' : '#E2E8F0'
            }}
            title="Toggle between Real (Today's purchasing power) and Nominal (Future Rupee values after inflation)"
          >
            <DollarSign size={15} />
            <span>Curve: {isNominalDisplay ? 'Nominal (Future ₹)' : "Real (Today's ₹)"}</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-STUDIO NAVIGATION TABS RIBBON */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'fire', label: 'FIRE Freedom Planner', icon: Flame, color: '#FFD700' },
          { id: 'whatif', label: 'What-If Sandbox', icon: Sliders, color: '#00F0FF' },
          { id: 'montecarlo', label: 'Stochastic Monte Carlo', icon: Activity, color: '#00FF87' },
          { id: 'summary', label: 'Executive Quant Brief', icon: ShieldCheck, color: '#A78BFA' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`filter-chip ${isActive ? 'filter-chip-active' : ''}`}
              style={{ height: '38px', padding: '0 18px', gap: '8px' }}
            >
              <Icon size={16} color={isActive ? '#050810' : tab.color} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB VIEWS WITH FRAMER MOTION ANIMATION */}
      <AnimatePresence mode="wait">
        
        {/* ========================================================================= */}
        {/* TAB 1: FIRE FREEDOM PLANNER */}
        {/* ========================================================================= */}
        {activeTab === 'fire' && (
          <motion.div
            key="fire"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Top 4 Bento KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              
              {/* Card 1: Standard FIRE Corpus */}
              <div className="glass-card glass-card-glow-amber" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Standard FIRE Corpus
                    </span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(255, 215, 0, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Flame size={16} color="#FFD700" />
                    </div>
                  </div>
                  <div className="display-lg tabular-nums" style={{ color: '#F8FAFC' }}>
                    {formatINR(fireData.milestones.standardFire.target, true)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#FFD700', fontWeight: 600, marginTop: '2px' }}>
                    {(100 / fireSwrPct).toFixed(1)}x Annual Living Expenses
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginBottom: '6px' }}>
                    <span>Current Corpus Progress</span>
                    <span className="tabular-nums font-mono" style={{ color: '#00FF87', fontWeight: 800 }}>
                      {fireData.currentProgressPct}%
                    </span>
                  </div>
                  <div className="progress-bar-luxury">
                    <div className="progress-bar-fill-gold" style={{ width: `${Math.min(100, fireData.currentProgressPct)}%` }} />
                  </div>
                </div>
              </div>

              {/* Card 2: Independence Date */}
              <div className="glass-card glass-card-glow-mint" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Independence Date
                    </span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(0, 255, 135, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Calendar size={16} color="#00FF87" />
                    </div>
                  </div>
                  <div className="display-lg tabular-nums" style={{ color: '#00FF87' }}>
                    {new Date(fireData.fireDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, marginTop: '2px' }}>
                    {fireData.yearsToFire} Years Countdown (Age {fireData.projectedAge})
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '12px', color: '#94A3B8' }}>
                  <span>Target Retirement</span>
                  <span style={{ fontWeight: 700, color: '#F1F5F9' }}>Age {fireTargetRetireAge}</span>
                </div>
              </div>

              {/* Card 3: Monthly Savings Rate */}
              <div className="glass-card glass-card-glow-cyan" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Monthly Savings Rate
                    </span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(0, 240, 255, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Percent size={16} color="#00F0FF" />
                    </div>
                  </div>
                  <div className="display-lg tabular-nums" style={{ color: '#00F0FF' }}>
                    {fireData.savingsRate}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, marginTop: '2px' }}>
                    {formatINR(fireData.monthlySavings)} / mo invested
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '12px', color: '#94A3B8' }}>
                  <span>Annual Step-Up Growth</span>
                  <span style={{ fontWeight: 700, color: '#00F0FF' }}>+{fireStepUpPct}% / yr</span>
                </div>
              </div>

              {/* Card 4: Freedom Velocity Index */}
              <div className="glass-card glass-card-glow-violet" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Freedom Velocity Index
                    </span>
                    <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={16} color="#A78BFA" />
                    </div>
                  </div>
                  <div className="display-lg tabular-nums" style={{ color: '#A78BFA' }}>
                    {fireData.velocityScore} <span style={{ fontSize: '14px', color: '#94A3B8' }}>/ 100</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500, marginTop: '2px' }}>
                    Compounding Acceleration Tier
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '12px', color: '#94A3B8' }}>
                  <span>Coast Status</span>
                  <span style={{ fontWeight: 800, color: fireData.milestones.coastFire.isCoastAchieved ? '#00FF87' : '#FFD700' }}>
                    {fireData.milestones.coastFire.isCoastAchieved ? 'Achieved 🚀' : 'Building'}
                  </span>
                </div>
              </div>
            </div>

            {/* Split Studio: Calibration Controls (Left) & 6-Tier Spectrum (Right) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
              
              {/* LEFT COLUMN: Calibration Studio */}
              <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sliders size={18} color="#00F0FF" />
                    <h3 className="heading-md" style={{ margin: 0 }}>Real-Time Parameter Calibration</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFireIncome(100000);
                      setFireExpense(45000);
                      setFireNetWorth(500000);
                      setFireReturn(11.5);
                      setFireInflation(6.0);
                      setFireSwrPct(4.0);
                      setFireStepUpPct(5.0);
                    }}
                    className="btn-icon-soft"
                    style={{ width: 'auto', padding: '4px 10px', height: '28px', fontSize: '11.5px', gap: '4px' }}
                  >
                    <RefreshCw size={12} />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Slider 1: Monthly Income */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '2px' }}>
                    <span style={{ color: '#94A3B8' }}>Monthly Net Income</span>
                    <span className="font-display tabular-nums" style={{ fontWeight: 800, color: '#F8FAFC' }}>
                      {formatINR(fireIncome)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20000}
                    max={1000000}
                    step={5000}
                    value={fireIncome}
                    onChange={(e) => setFireIncome(Number(e.target.value))}
                    className="slider-luxury slider-cyan"
                  />
                </div>

                {/* Slider 2: Monthly Living Expenses */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '2px' }}>
                    <span style={{ color: '#94A3B8' }}>Monthly Living Expenses</span>
                    <span className="font-display tabular-nums" style={{ fontWeight: 800, color: '#FFD700' }}>
                      {formatINR(fireExpense)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={800000}
                    step={2500}
                    value={fireExpense}
                    onChange={(e) => setFireExpense(Number(e.target.value))}
                    className="slider-luxury slider-amber"
                  />
                </div>

                {/* Slider 3: Current Invested Net Worth */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '2px' }}>
                    <span style={{ color: '#94A3B8' }}>Current Invested Net Worth</span>
                    <span className="font-display tabular-nums" style={{ fontWeight: 800, color: '#00FF87' }}>
                      {formatINR(fireNetWorth)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50000000}
                    step={50000}
                    value={fireNetWorth}
                    onChange={(e) => setFireNetWorth(Number(e.target.value))}
                    className="slider-luxury slider-mint"
                  />
                </div>

                {/* Slider 4: Safe Withdrawal Rate (SWR) */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '2px' }}>
                    <span style={{ color: '#94A3B8' }}>Safe Withdrawal Rate (SWR)</span>
                    <span className="font-display tabular-nums" style={{ fontWeight: 800, color: '#A78BFA' }}>
                      {fireSwrPct}% <span style={{ fontSize: '11px', color: '#94A3B8' }}>({(100 / fireSwrPct).toFixed(1)}x)</span>
                    </span>
                  </div>
                  <input
                    type="range"
                    min={2.5}
                    max={6.0}
                    step={0.1}
                    value={fireSwrPct}
                    onChange={(e) => setFireSwrPct(Number(e.target.value))}
                    className="slider-luxury slider-violet"
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#64748B', marginTop: '2px' }}>
                    <span>2.5% (Ultra Conservative)</span>
                    <span>4.0% (Trinity Standard)</span>
                    <span>6.0% (Aggressive)</span>
                  </div>
                </div>

                {/* Dual Grid: Expected Return & Inflation */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                      <span style={{ color: '#94A3B8' }}>Expected CAGR</span>
                      <span className="font-display tabular-nums" style={{ fontWeight: 800, color: '#00FF87' }}>
                        {fireReturn}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={6.0}
                      max={18.0}
                      step={0.5}
                      value={fireReturn}
                      onChange={(e) => setFireReturn(Number(e.target.value))}
                      className="slider-luxury slider-mint"
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '2px' }}>
                      <span style={{ color: '#94A3B8' }}>Inflation Rate</span>
                      <span className="font-display tabular-nums" style={{ fontWeight: 800, color: '#F43F5E' }}>
                        {fireInflation}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={3.0}
                      max={10.0}
                      step={0.5}
                      value={fireInflation}
                      onChange={(e) => setFireInflation(Number(e.target.value))}
                      className="slider-luxury slider-rose"
                    />
                  </div>
                </div>

                {/* Slider 6: Annual SIP Step-Up Growth */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '2px' }}>
                    <span style={{ color: '#94A3B8' }}>Annual SIP Step-Up Growth</span>
                    <span className="font-display tabular-nums" style={{ fontWeight: 800, color: '#00F0FF' }}>
                      +{fireStepUpPct}% / yr
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    step={1}
                    value={fireStepUpPct}
                    onChange={(e) => setFireStepUpPct(Number(e.target.value))}
                    className="slider-luxury slider-cyan"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN: 6-Tier Comprehensive FIRE Spectrum */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 className="heading-md" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={18} color="#00FF87" />
                    The 6-Tier Comprehensive FIRE Spectrum
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#94A3B8' }}>
                    Expenses: {formatINR(fireExpense * 12, true)} / yr
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  
                  {/* Tier 1: Barista FIRE */}
                  <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#FFD700', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                          1. Barista FIRE
                        </div>
                        <div className="heading-lg tabular-nums" style={{ color: '#F8FAFC', marginTop: '2px' }}>
                          {formatINR(fireData.milestones.baristaFire.target, true)}
                        </div>
                      </div>
                      <span className="glass-pill" style={{ borderColor: 'rgba(255, 215, 0, 0.3)', color: '#FFD700', fontSize: '11px' }}>
                        {fireData.milestones.baristaFire.multiplier}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                      Covers 60% of lifestyle; remaining 40% covered via part-time passion income or freelancing.
                    </p>
                  </div>

                  {/* Tier 2: Lean FIRE */}
                  <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#00F0FF', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                          2. Lean FIRE
                        </div>
                        <div className="heading-lg tabular-nums" style={{ color: '#F8FAFC', marginTop: '2px' }}>
                          {formatINR(fireData.milestones.leanFire.target, true)}
                        </div>
                      </div>
                      <span className="glass-pill" style={{ borderColor: 'rgba(0, 240, 255, 0.3)', color: '#00F0FF', fontSize: '11px' }}>
                        {fireData.milestones.leanFire.multiplier}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                      Frugal essentials only. Covers housing, basic groceries, utilities, and healthcare.
                    </p>
                  </div>

                  {/* Tier 3: Standard FIRE (Target Benchmark) */}
                  <div className="glass-card glass-card-glow-mint" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: 'linear-gradient(145deg, rgba(0, 255, 135, 0.08) 0%, rgba(10, 14, 24, 0.9) 100%)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#00FF87', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          3. Standard FIRE <Award size={14} color="#00FF87" />
                        </div>
                        <div className="heading-xl tabular-nums" style={{ color: '#00FF87', marginTop: '2px' }}>
                          {formatINR(fireData.milestones.standardFire.target, true)}
                        </div>
                      </div>
                      <span className="glass-pill" style={{ borderColor: 'rgba(0, 255, 135, 0.4)', color: '#00FF87', background: 'rgba(0, 255, 135, 0.12)', fontSize: '11px', fontWeight: 800 }}>
                        {fireData.milestones.standardFire.multiplier}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#E2E8F0', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                      100% current lifestyle maintenance with zero work dependency forever (Trinity Study Benchmark).
                    </p>
                  </div>

                  {/* Tier 4: Chubby FIRE */}
                  <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                          4. Chubby FIRE
                        </div>
                        <div className="heading-lg tabular-nums" style={{ color: '#F8FAFC', marginTop: '2px' }}>
                          {formatINR(fireData.milestones.chubbyFire.target, true)}
                        </div>
                      </div>
                      <span className="glass-pill" style={{ borderColor: 'rgba(167, 139, 250, 0.3)', color: '#A78BFA', fontSize: '11px' }}>
                        {fireData.milestones.chubbyFire.multiplier}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                      Comfortable freedom including regular international travel, fine dining, and hobbies.
                    </p>
                  </div>

                  {/* Tier 5: Fat FIRE */}
                  <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#EC4899', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                          5. Fat FIRE
                        </div>
                        <div className="heading-lg tabular-nums" style={{ color: '#F8FAFC', marginTop: '2px' }}>
                          {formatINR(fireData.milestones.fatFire.target, true)}
                        </div>
                      </div>
                      <span className="glass-pill" style={{ borderColor: 'rgba(236, 72, 153, 0.3)', color: '#EC4899', fontSize: '11px' }}>
                        {fireData.milestones.fatFire.multiplier}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                      Unconstrained luxury living, high buffer margin, and generational wealth transfer.
                    </p>
                  </div>

                  {/* Tier 6: Coast FIRE */}
                  <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                          6. Coast FIRE
                        </div>
                        <div className="heading-lg tabular-nums" style={{ color: '#F8FAFC', marginTop: '2px' }}>
                          {formatINR(fireData.milestones.coastFire.target, true)}
                        </div>
                      </div>
                      <span
                        className="glass-pill"
                        style={{
                          borderColor: fireData.milestones.coastFire.isCoastAchieved ? 'rgba(0, 255, 135, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                          color: fireData.milestones.coastFire.isCoastAchieved ? '#00FF87' : '#94A3B8',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        {fireData.milestones.coastFire.isCoastAchieved ? 'Coast Unlocked' : `Need for Age ${fireTargetRetireAge}`}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#94A3B8', margin: '8px 0 0 0', lineHeight: 1.4 }}>
                      Current net worth compounding alone hits Standard FIRE by age {fireTargetRetireAge} without adding another rupee.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: WHAT-IF SANDBOX */}
        {/* ========================================================================= */}
        {activeTab === 'whatif' && (
          <motion.div
            key="whatif"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* 1-Click Milestone Presets Bar */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={15} color="#00F0FF" />
                1-Click Macro Life Milestone Presets
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                {WHAT_IF_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyWhatIfPreset(preset)}
                      className="preset-card-luxury"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: `${preset.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Icon size={16} color={preset.color} />
                        </div>
                        <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#F1F5F9' }}>{preset.title}</span>
                      </div>
                      <p style={{ fontSize: '11.5px', color: '#94A3B8', margin: 0, lineHeight: 1.4 }}>
                        {preset.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comparative Wealth Trajectory Chart */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <h3 className="heading-md" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <TrendingUp size={18} color="#00F0FF" />
                    Comparative Wealth Trajectory (Base vs. What-If Scenario)
                  </h3>
                  <p className="body-sm" style={{ margin: '4px 0 0 0', color: '#94A3B8' }}>
                    Compounding differential with salary hikes, frugal cuts, and timed event capital shocks.
                  </p>
                </div>

                {whatIfResults && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12.5px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#64748B' }} />
                      <span style={{ color: '#94A3B8' }}>Baseline Path</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00F0FF', boxShadow: '0 0 8px #00F0FF' }} />
                      <span style={{ color: '#00F0FF', fontWeight: 700 }}>What-If Scenario</span>
                    </div>
                  </div>
                )}
              </div>

              {whatIfResults?.projections && (
                <div style={{ height: '360px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={whatIfResults.projections} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#64748B" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#64748B" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorScenario" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                      <XAxis dataKey="years" stroke="#64748B" tickFormatter={(val) => `Yr ${val}`} style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)' }} />
                      <YAxis stroke="#64748B" tickFormatter={(val) => formatINR(val, true)} style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)' }} />
                      <Tooltip content={<CustomWhatIfTooltip />} />
                      <Area type="monotone" dataKey="baseNetWorth" stroke="#94A3B8" strokeWidth={2} fillOpacity={1} fill="url(#colorBase)" name="baseNetWorth" />
                      <Area type="monotone" dataKey="scenarioNetWorth" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorScenario)" name="scenarioNetWorth" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Timeframe Projections Matrix Cards */}
            {whatIfResults?.projections && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                {whatIfResults.projections.map((p) => (
                  <div key={p.years} className="glass-card" style={{ padding: '14px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Year {p.years}</div>
                    <div className="heading-md tabular-nums" style={{ color: '#F8FAFC', margin: '4px 0 2px 0' }}>
                      {formatINR(p.scenarioNetWorth, true)}
                    </div>
                    <div className="tabular-nums" style={{ fontSize: '11.5px', fontWeight: 800, color: p.netGain >= 0 ? '#00FF87' : '#F43F5E' }}>
                      {p.netGain >= 0 ? `+${formatINR(p.netGain, true)}` : formatINR(p.netGain, true)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: STOCHASTIC MONTE CARLO SIMULATOR */}
        {/* ========================================================================= */}
        {activeTab === 'montecarlo' && (
          <motion.div
            key="montecarlo"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Top Control Ribbon */}
            <div className="glass-card" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                
                {/* Model Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>Model:</span>
                  <select
                    value={mcModel}
                    onChange={(e) => setMcModel(e.target.value)}
                    className="glass-input"
                    style={{ height: '34px', padding: '0 12px', width: 'auto', minWidth: '220px', fontSize: '12.5px', fontWeight: 600 }}
                  >
                    <option value="gbm">Ito Geometric Brownian Motion (GBM)</option>
                    <option value="jump_diffusion">Merton Jump Diffusion (Crash Shocks)</option>
                    <option value="historical_bootstrap">Historical Bootstrap (1970–2024)</option>
                  </select>
                </div>

                {/* Phase Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8' }}>Phase:</span>
                  <select
                    value={mcPhase}
                    onChange={(e) => setMcPhase(e.target.value)}
                    className="glass-input"
                    style={{ height: '34px', padding: '0 12px', width: 'auto', minWidth: '190px', fontSize: '12.5px', fontWeight: 600 }}
                  >
                    <option value="accumulation">Accumulation (Investing SIP)</option>
                    <option value="decumulation">Decumulation (Retirement Spend)</option>
                    <option value="lifecycle">Lifecycle (Accumulate then Retire)</option>
                  </select>
                </div>

                {/* Runs Selector Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.07)' }}>
                  {[1000, 5000, 10000, 25000, 50000].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setMcRuns(num);
                        triggerMonteCarlo(num);
                      }}
                      style={{
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        borderRadius: '6px',
                        border: 'none',
                        cursor: 'pointer',
                        background: mcRuns === num ? '#00FF87' : 'transparent',
                        color: mcRuns === num ? '#050810' : '#94A3B8',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {num >= 1000 ? `${num / 1000}k` : num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setTableModalOpen(true)}
                  className="btn-glass-secondary"
                  style={{ height: '36px', padding: '0 14px', fontSize: '12px' }}
                >
                  <TableIcon size={14} color="#00F0FF" />
                  <span>Percentile Table</span>
                </button>

                <button
                  type="button"
                  disabled={runningMc}
                  onClick={() => triggerMonteCarlo()}
                  className="btn-primary-mint"
                  style={{ height: '36px', padding: '0 16px', fontSize: '12px' }}
                >
                  <RefreshCw size={14} className={runningMc ? 'animate-spin' : ''} />
                  <span>{runningMc ? 'Simulating...' : 'Re-Run Paths'}</span>
                </button>
              </div>
            </div>

            {/* Stochastic Percentile Confidence Fan Chart */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <h3 className="heading-md" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={18} color="#00FF87" />
                    Stochastic Percentile Distribution Ribbon (P5 to P95)
                  </h3>
                  <p className="body-sm" style={{ margin: '4px 0 0 0', color: '#94A3B8' }}>
                    Displays 90% confidence interval across {mcResults?.runs?.toLocaleString() || mcRuns.toLocaleString()} simulation paths.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                    <span style={{ color: '#10B981', fontWeight: 700 }}>Bullish P90</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#00FF87', boxShadow: '0 0 8px #00FF87' }} />
                    <span style={{ color: '#00FF87', fontWeight: 700 }}>Median P50</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#F43F5E' }} />
                    <span style={{ color: '#F43F5E', fontWeight: 700 }}>Crash Floor P5/P10</span>
                  </div>
                </div>
              </div>

              {chartDataWithSpaghetti.length > 0 && (
                <div style={{ height: '380px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartDataWithSpaghetti} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBull" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorMedian" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00FF87" stopOpacity={0.45} />
                          <stop offset="95%" stopColor="#00FF87" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorBear" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                          <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
                      <XAxis dataKey="year" stroke="#64748B" tickFormatter={(val) => `Yr ${val}`} style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)' }} />
                      <YAxis stroke="#64748B" tickFormatter={(val) => formatINR(val, true)} style={{ fontSize: '11.5px', fontFamily: 'var(--font-mono)' }} />
                      <Tooltip content={<CustomMonteCarloTooltip />} />
                      
                      {/* Percentile Ribbons */}
                      <Area type="monotone" dataKey="superBull_P95" stroke="#34D399" strokeWidth={1} strokeDasharray="3 3" fillOpacity={0} name="superBull_P95" />
                      <Area type="monotone" dataKey="bullish_P90" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorBull)" name="bullish_P90" />
                      <Area type="monotone" dataKey={isNominalDisplay ? 'nominal_P50' : 'median_P50'} stroke="#00FF87" strokeWidth={3} fillOpacity={1} fill="url(#colorMedian)" name="median_P50" />
                      <Area type="monotone" dataKey="bearish_P10" stroke="#FB7185" strokeWidth={2} fillOpacity={1} fill="url(#colorBear)" name="bearish_P10" />
                      <Area type="monotone" dataKey="deepBear_P5" stroke="#F43F5E" strokeWidth={1.5} strokeDasharray="2 2" fillOpacity={0} name="deepBear_P5" />

                      {/* Stochastic Sample Spaghetti Lines */}
                      {showSpaghettiPaths && [0, 1, 2, 3, 4, 5, 6, 7].map((pIdx) => (
                        <Line
                          key={pIdx}
                          type="monotone"
                          dataKey={`sample_${pIdx}`}
                          stroke="#94A3B8"
                          strokeWidth={0.8}
                          opacity={0.25}
                          dot={false}
                          legendType="none"
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Institutional Risk KPI Analytics Grid */}
            {mcResults?.metrics && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
                
                {/* Metric 1: Survival Rate */}
                <div className="glass-card glass-card-glow-mint" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Portfolio Survival Rate</div>
                  <div className="heading-xl tabular-nums" style={{ color: '#00FF87', margin: '4px 0 2px 0' }}>
                    {mcResults.metrics.successProbabilityPct}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Probability corpus {'>'} 0</div>
                </div>

                {/* Metric 2: Ruin Probability */}
                <div className="glass-card glass-card-glow-rose" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Ruin Probability</div>
                  <div className="heading-xl tabular-nums" style={{ color: '#F43F5E', margin: '4px 0 2px 0' }}>
                    {mcResults.metrics.ruinProbabilityPct}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Depletion risk before Y{mcResults.years}</div>
                </div>

                {/* Metric 3: Value at Risk (VaR 95%) */}
                <div className="glass-card glass-card-glow-cyan" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Value at Risk (VaR 95%)</div>
                  <div className="heading-xl tabular-nums" style={{ color: '#00F0FF', margin: '4px 0 2px 0' }}>
                    {formatINR(mcResults.metrics.valueAtRisk95, true)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Worst 5% statistical floor</div>
                </div>

                {/* Metric 4: Expected Shortfall (CVaR) */}
                <div className="glass-card glass-card-glow-amber" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>CVaR / Expected Shortfall</div>
                  <div className="heading-xl tabular-nums" style={{ color: '#FFD700', margin: '4px 0 2px 0' }}>
                    {formatINR(mcResults.metrics.conditionalVaR95, true)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Avg in tail crash scenarios</div>
                </div>

                {/* Metric 5: Sharpe Ratio */}
                <div className="glass-card glass-card-glow-violet" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Sharpe Ratio</div>
                  <div className="heading-xl tabular-nums" style={{ color: '#A78BFA', margin: '4px 0 2px 0' }}>
                    {mcResults.metrics.sharpeRatio}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Risk-adjusted efficiency</div>
                </div>

                {/* Metric 6: Average Max Drawdown */}
                <div className="glass-card" style={{ padding: '16px' }}>
                  <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 700, textTransform: 'uppercase' }}>Avg Max Drawdown</div>
                  <div className="heading-xl tabular-nums" style={{ color: '#E2E8F0', margin: '4px 0 2px 0' }}>
                    {mcResults.metrics.avgMaxDrawdownPct}%
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>Peak-to-trough path volatility</div>
                </div>
              </div>
            )}

            {/* Asset Allocation & Dynamic Rules */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* Asset Allocation Presets */}
              <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <PieIcon size={18} color="#00F0FF" />
                    <h4 className="heading-md" style={{ margin: 0 }}>Multi-Asset Covariance Allocation</h4>
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                    CAGR: {mcExpectedReturn}% • Vol: {mcVolatility}%
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  {ASSET_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectAssetPreset(p.id)}
                      className={`preset-card-luxury ${mcSelectedPreset === p.id ? 'preset-card-luxury-active' : ''}`}
                    >
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#F1F5F9' }}>{p.name}</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px', lineHeight: 1.3 }}>{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Institutional Rules (Glidepath & Guardrails) */}
              <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '14px' }}>
                <div>
                  <h4 className="heading-md" style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#00FF87" />
                    Dynamic Institutional Rules
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    
                    {/* Dynamic Age Glidepath Toggle */}
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', cursor: 'pointer' }}>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#F1F5F9' }}>Dynamic Age Glidepath</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>-0.75% equity/yr into fixed income</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={mcGlidePath}
                        onChange={(e) => setMcGlidePath(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: '#00FF87', cursor: 'pointer' }}
                      />
                    </label>

                    {/* Guyton-Klinkis Guardrails Toggle */}
                    <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.07)', cursor: 'pointer' }}>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#F1F5F9' }}>Guyton-Klinkis Guardrails</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>Dynamic ±10% spending rule adjustments</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={mcGuardrails}
                        onChange={(e) => setMcGuardrails(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: '#00F0FF', cursor: 'pointer' }}
                      />
                    </label>
                  </div>
                </div>

                <div style={{ fontSize: '11.5px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                  Ito Volatility Drag Correction active (-0.5*sigma^2)
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: EXECUTIVE QUANT BRIEF */}
        {/* ========================================================================= */}
        {activeTab === 'summary' && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Header with Export Controls */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <ShieldCheck size={20} color="#00FF87" />
                  <h3 className="heading-xl" style={{ margin: 0 }}>
                    Executive Quantitative Portfolio Synthesis
                  </h3>
                </div>
                <p className="body-sm" style={{ margin: 0, color: '#94A3B8' }}>
                  Algorithmic breakdown of wealth trajectory, sequence-of-returns vulnerabilities, and highest-impact alpha levers.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopySummary}
                className="btn-glass-secondary"
                style={{ height: '38px', padding: '0 16px', fontSize: '12.5px' }}
              >
                {copiedToast ? <Check size={16} color="#00FF87" /> : <Copy size={16} color="#94A3B8" />}
                <span>{copiedToast ? 'Copied to Clipboard!' : 'Copy Executive Brief'}</span>
              </button>
            </div>

            {/* 3-Pillar Executive Breakdown Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              {/* Pillar 1: Trajectory Health */}
              <div className="glass-card glass-card-glow-mint" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00FF87', fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                    <TrendingUp size={16} /> 1. Trajectory Health
                  </div>
                  <h4 className="heading-lg" style={{ color: '#F8FAFC', margin: 0 }}>
                    {fireData.savingsRate >= 50 ? 'Hyper-Accumulation Tier' : 'Standard Growth Phase'}
                  </h4>
                  <p style={{ fontSize: '12.5px', color: '#94A3B8', marginTop: '8px', lineHeight: 1.5 }}>
                    With an active savings rate of <strong style={{ color: '#00FF87' }}>{fireData.savingsRate}%</strong> and monthly investments of <strong style={{ color: '#F1F5F9' }}>{formatINR(fireData.monthlySavings)}</strong>, your wealth is compounding rapidly toward Standard FIRE target of <strong style={{ color: '#F1F5F9' }}>{formatINR(fireData.milestones.standardFire.target, true)}</strong>.
                  </p>
                </div>
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#94A3B8' }}>Projected Freedom Age:</span>
                  <span style={{ color: '#00FF87', fontWeight: 800 }}>Age {fireData.projectedAge}</span>
                </div>
              </div>

              {/* Pillar 2: Sequence-of-Returns Risk */}
              <div className="glass-card glass-card-glow-amber" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FFD700', fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                    <ShieldAlert size={16} /> 2. Sequence-of-Returns Risk
                  </div>
                  <h4 className="heading-lg" style={{ color: '#F8FAFC', margin: 0 }}>
                    {mcResults?.metrics?.successProbabilityPct >= 90 ? 'Robust Nest Egg Shield' : 'Moderate Tail Sensitivity'}
                  </h4>
                  <p style={{ fontSize: '12.5px', color: '#94A3B8', marginTop: '8px', lineHeight: 1.5 }}>
                    Under the 95% worst market tail crash (VaR 95%), your terminal corpus is projected at <strong style={{ color: '#00F0FF' }}>{formatINR(mcResults?.metrics?.valueAtRisk95, true)}</strong>. Activating Guyton-Klinkis guardrails cuts ruin probability by ~60%.
                  </p>
                </div>
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#94A3B8' }}>Survival Probability:</span>
                  <span style={{ color: '#FFD700', fontWeight: 800 }}>{mcResults?.metrics?.successProbabilityPct}%</span>
                </div>
              </div>

              {/* Pillar 3: Top 3 Alpha Levers */}
              <div className="glass-card glass-card-glow-cyan" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00F0FF', fontSize: '11.5px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
                    <Zap size={16} /> 3. Top 3 Alpha Levers
                  </div>
                  <ul style={{ paddingLeft: '16px', margin: '8px 0 0 0', fontSize: '12px', color: '#CBD5E1', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.4 }}>
                    <li><strong style={{ color: '#00F0FF' }}>+5% Annual Step-Up:</strong> Accelerates retirement timeline by 3.4 years.</li>
                    <li><strong style={{ color: '#00FF87' }}>Dynamic Glidepath:</strong> De-risks equity drawdowns during final 5 years.</li>
                    <li><strong style={{ color: '#FFD700' }}>Coast FIRE Buffer:</strong> Reach {formatINR(fireData.milestones.coastFire.target, true)} to eliminate forced work stress.</li>
                  </ul>
                </div>
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#94A3B8' }}>Freedom Velocity Score:</span>
                  <span style={{ color: '#00F0FF', fontWeight: 800 }}>{fireData.velocityScore} / 100</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS & QUANT GUIDE TUTORIAL MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {guideModalOpen && (
          <div className="modal-overlay" onClick={() => setGuideModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 14 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-card"
              style={{ maxWidth: '680px' }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={20} color="#00F0FF" />
                  <h3 className="heading-lg" style={{ margin: 0 }}>How It Works & Quantitative Guide</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setGuideModalOpen(false)}
                  className="btn-icon-soft"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Sub-Guide Navigation Chips */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px' }}>
                {[
                  { id: 'fire', label: '1. FIRE Math & SWR' },
                  { id: 'whatif', label: '2. What-If Leverage' },
                  { id: 'stochastic', label: '3. Stochastic Physics & Ito' },
                  { id: 'rules', label: '4. 4 Rules for 99% Survival' },
                ].map((gTab) => (
                  <button
                    key={gTab.id}
                    type="button"
                    onClick={() => setGuideTab(gTab.id)}
                    className={`filter-chip ${guideTab === gTab.id ? 'filter-chip-active' : ''}`}
                    style={{ height: '32px', fontSize: '11.5px', padding: '0 12px' }}
                  >
                    {gTab.label}
                  </button>
                ))}
              </div>

              {/* Guide Content Sections */}
              <div style={{ fontSize: '13px', color: '#CBD5E1', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {guideTab === 'fire' && (
                  <>
                    <h4 className="heading-md" style={{ color: '#FFD700', margin: 0 }}>The Mathematics of Financial Independence</h4>
                    <p>
                      Financial Independence is achieved when the passive inflation-adjusted cash flow generated by your invested corpus covers your living expenses indefinitely.
                    </p>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#00FF87' }}>
                      Target Corpus = Annual Living Expenses × (100 / Safe Withdrawal Rate)
                    </div>
                    <p>
                      <strong>Standard FIRE (4% SWR • 25x Spend):</strong> Derived from the landmark Trinity Study (1998), a 4% annual withdrawal rate indexed to inflation historically survived 95%+ of 30-year retirement horizons.
                    </p>
                    <p>
                      <strong>Coast FIRE:</strong> The specific corpus you need invested today such that, with zero future monthly additions, it naturally compounds to your Standard FIRE target by your target retirement age.
                    </p>
                  </>
                )}

                {guideTab === 'whatif' && (
                  <>
                    <h4 className="heading-md" style={{ color: '#00F0FF', margin: 0 }}>Leveraging the What-If Sandbox</h4>
                    <p>
                      Small recurring improvements create outsized terminal wealth differentials because compounding is non-linear:
                    </p>
                    <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <li><strong>Frugal Optimization:</strong> Cutting recurring monthly leaks (e.g. -₹5,000/mo) adds ~₹18–25 Lakh over a 15-year horizon.</li>
                      <li><strong>Career Step-Up Growth:</strong> Escalating your SIP by +5% to +10% annually matches real salary growth and drastically shortens retirement time by 3 to 6 years.</li>
                      <li><strong>Timed Capital Shocks:</strong> Accurately model one-time life events like property downpayments or ESOP windfalls triggered at precise future years.</li>
                    </ul>
                  </>
                )}

                {guideTab === 'stochastic' && (
                  <>
                    <h4 className="heading-md" style={{ color: '#00FF87', margin: 0 }}>Stochastic Physics, Volatility Drag & Ito Calculus</h4>
                    <p>
                      Static average-return calculators suffer from the <em>"Flaw of Averages"</em> and miss <strong>Sequence of Returns Risk (SRR)</strong>.
                    </p>
                    <div style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px', padding: '12px 14px', fontFamily: 'var(--font-mono)', fontSize: '12px', color: '#00F0FF' }}>
                      W_{'{t+1}'} = (W_t + C_t) × exp( (μ - 0.5×σ²)Δt + σ√Δt Z_t )
                    </div>
                    <p>
                      <strong>Volatility Drag (-0.5*σ²):</strong> High variance drains geometric CAGR. A portfolio that drops -20% and then gains +20% has a net compound loss of -4%. Our engine explicitly models this Ito drift correction.
                    </p>
                    <p>
                      <strong>Merton Jump Diffusion:</strong> Superimposes Poisson crash jumps (average -18% real drop) to account for market leptokurtosis (fat-tail black swan events).
                    </p>
                  </>
                )}

                {guideTab === 'rules' && (
                  <>
                    <h4 className="heading-md" style={{ color: '#A78BFA', margin: 0 }}>The 4 Institutional Rules for 99% Portfolio Survival</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '10px 12px' }}>
                        <strong style={{ color: '#00FF87' }}>1. Guyton-Klinkis Guardrails:</strong> In retirement decumulation, cut spending by 10% during severe bear markets (Capital Preservation Rule) and increase by 10% during super bull runs (Prosperity Rule).
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '10px 12px' }}>
                        <strong style={{ color: '#00F0FF' }}>2. Dynamic Age Glidepath:</strong> Shift 0.75% of portfolio from equities into fixed income each year as retirement approaches to eliminate sequence risk.
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '10px 12px' }}>
                        <strong style={{ color: '#FFD700' }}>3. 2-Year Cash Buffer:</strong> Hold 24 months of living expenses in liquid debt/T-Bills so you never have to sell equities at a market trough.
                      </div>
                      <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', borderRadius: '8px', padding: '10px 12px' }}>
                        <strong style={{ color: '#EC4899' }}>4. Flexible Barista Bridge:</strong> Generating just 20%–30% of living expenses through low-stress part-time work lowers required portfolio corpus by 35%.
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setGuideModalOpen(false)}
                  className="btn-primary-mint"
                  style={{ height: '36px', padding: '0 18px', fontSize: '12.5px' }}
                >
                  Got It, Let's Simulate
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. YEAR-BY-YEAR PERCENTILE DISTRIBUTION MODAL WITH CSV EXPORT */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {tableModalOpen && (
          <div className="modal-overlay" onClick={() => setTableModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 14 }}
              onClick={(e) => e.stopPropagation()}
              className="modal-card"
              style={{ maxWidth: '920px' }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <TableIcon size={20} color="#00FF87" />
                  <div>
                    <h3 className="heading-lg" style={{ margin: 0 }}>Year-by-Year Stochastic Distribution Table</h3>
                    <div style={{ fontSize: '11.5px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                      {mcResults?.runs?.toLocaleString()} Runs • {mcResults?.model?.toUpperCase()} • {isNominalDisplay ? 'Nominal Values' : "Real Today's ₹"}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="btn-primary-mint"
                    style={{ height: '34px', padding: '0 14px', fontSize: '12px', gap: '5px' }}
                  >
                    <Download size={14} />
                    <span>Download CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableModalOpen(false)}
                    className="btn-icon-soft"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Data Table */}
              <div style={{ overflowX: 'auto', maxHeight: '55vh', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <table className="table-luxury" style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#0D111C', zIndex: 2 }}>
                    <tr>
                      <th style={{ padding: '10px 14px' }}>Year</th>
                      <th style={{ padding: '10px 14px', color: '#F43F5E' }}>Deep Bear (P5)</th>
                      <th style={{ padding: '10px 14px', color: '#FB7185' }}>Bearish (P10)</th>
                      <th style={{ padding: '10px 14px' }}>Lower (P25)</th>
                      <th style={{ padding: '10px 14px', color: '#00FF87', fontWeight: 800 }}>Median (P50)</th>
                      <th style={{ padding: '10px 14px' }}>Upper (P75)</th>
                      <th style={{ padding: '10px 14px', color: '#10B981', fontWeight: 800 }}>Bullish (P90)</th>
                      <th style={{ padding: '10px 14px', color: '#34D399' }}>Super Bull (P95)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mcResults?.trajectory?.map((row) => (
                      <tr key={row.year}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#94A3B8' }}>Yr {row.year}</td>
                        <td style={{ padding: '10px 14px', color: '#F43F5E' }}>{formatINR(row.deepBear_P5)}</td>
                        <td style={{ padding: '10px 14px', color: '#FB7185' }}>{formatINR(row.bearish_P10)}</td>
                        <td style={{ padding: '10px 14px', color: '#CBD5E1' }}>{formatINR(row.lowerQuartile_P25)}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 800, color: '#00FF87', background: 'rgba(0, 255, 135, 0.04)' }}>
                          {formatINR(isNominalDisplay ? row.nominal_P50 : row.median_P50)}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#CBD5E1' }}>{formatINR(row.upperQuartile_P75)}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: '#10B981' }}>
                          {formatINR(isNominalDisplay ? row.nominal_P90 : row.bullish_P90)}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#34D399' }}>{formatINR(row.superBull_P95)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WealthSimulatorPage;
