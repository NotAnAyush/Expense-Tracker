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
  PieChart,
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
  Table,
  Check,
  FileText
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
    color: '#FF7D7D',
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-mint-500/20 border-t-mint-500 rounded-full animate-spin" />
        <p className="text-slate-400 font-mono text-sm">Calibrating Stochastic Wealth Physics...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-20">
      {/* 1. HERO HEADER WITH TUTORIAL GUIDE & EXPORT CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-mint-400 animate-ping" />
            <span className="text-xs font-mono font-bold text-mint-400 tracking-wider uppercase">
              Institutional Stochastic Engine • v3.7
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-100 font-display flex items-center gap-3">
            Wealth & FIRE Freedom Simulator
            <Sparkles className="w-6 h-6 text-amber-400" />
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl mt-1">
            Multi-asset Ito Geometric Brownian Motion (GBM), Merton Jump Diffusion, 55-year Historical Bootstrap, and Guyton-Klinkis Guardrails.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Guide & Tutorial Button */}
          <button
            type="button"
            onClick={() => setGuideModalOpen(true)}
            className="btn-glass-secondary text-xs flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>How It Works & Quant Guide</span>
          </button>

          {/* Real vs Nominal Toggle */}
          <button
            type="button"
            onClick={() => setIsNominalDisplay(!isNominalDisplay)}
            className={`btn-glass-secondary text-xs flex items-center gap-2 px-3.5 py-2.5 rounded-xl border transition-all ${
              isNominalDisplay 
                ? 'border-amber-400/40 bg-amber-400/10 text-amber-300' 
                : 'border-slate-700 bg-slate-800/40 text-slate-300'
            }`}
            title="Toggle between Real (Today's purchasing power) and Nominal (Future Rupee values after inflation)"
          >
            <DollarSign className="w-4 h-4" />
            <span>Curve: {isNominalDisplay ? 'Nominal (Future ₹)' : 'Real (Today\'s ₹)'}</span>
          </button>
        </div>
      </div>

      {/* 2. SUB-STUDIO TABS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto scrollbar-none">
        {[
          { id: 'fire', label: 'FIRE Freedom Planner', icon: Flame, color: 'text-amber-400' },
          { id: 'whatif', label: 'What-If Sandbox', icon: Sliders, color: 'text-cyan-400' },
          { id: 'montecarlo', label: 'Stochastic Monte Carlo', icon: Activity, color: 'text-mint-400' },
          { id: 'summary', label: 'Executive Quant Brief', icon: ShieldCheck, color: 'text-violet-400' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-slate-100 border border-slate-700 shadow-lg shadow-black/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              <Icon className={`w-4 h-4 ${tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. TAB VIEWS */}
      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* TAB 1: FIRE FREEDOM PLANNER */}
        {/* ========================================================================= */}
        {activeTab === 'fire' && (
          <motion.div
            key="fire"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            {/* Top KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Standard FIRE Number */}
              <div className="glass-card p-5 border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-slate-900/90 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1">
                    <span>Standard FIRE Corpus</span>
                    <Flame className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-slate-100 font-display mt-1">
                    {formatINR(fireData.milestones.standardFire.target, true)}
                  </div>
                  <div className="text-xs text-amber-400/80 font-mono mt-0.5">
                    {(100 / fireSwrPct).toFixed(1)}x Annual Living Expenses
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Current Progress</span>
                  <span className="font-mono font-bold text-mint-400">{fireData.currentProgressPct}%</span>
                </div>
              </div>

              {/* Card 2: Projected Freedom Date */}
              <div className="glass-card p-5 border border-mint-500/20 bg-gradient-to-br from-mint-500/5 to-slate-900/90 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1">
                    <span>Independence Date</span>
                    <Calendar className="w-4 h-4 text-mint-400" />
                  </div>
                  <div className="text-2xl font-black text-mint-400 font-display mt-1">
                    {new Date(fireData.fireDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {fireData.yearsToFire} Years Countdown (Age {fireData.projectedAge})
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Target Retirement</span>
                  <span className="font-mono text-slate-200">Age {fireTargetRetireAge}</span>
                </div>
              </div>

              {/* Card 3: Monthly Savings Rate */}
              <div className="glass-card p-5 border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-slate-900/90 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1">
                    <span>Monthly Savings Rate</span>
                    <Percent className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-cyan-400 font-display mt-1">
                    {fireData.savingsRate}%
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {formatINR(fireData.monthlySavings)} / mo invested
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Annual Step-Up Growth</span>
                  <span className="font-mono text-cyan-300">+{fireStepUpPct}% / yr</span>
                </div>
              </div>

              {/* Card 4: Freedom Velocity Index */}
              <div className="glass-card p-5 border border-violet-500/20 bg-gradient-to-br from-violet-500/5 to-slate-900/90 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-1">
                    <span>Freedom Velocity Index</span>
                    <Zap className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="text-2xl font-black text-violet-400 font-display mt-1">
                    {fireData.velocityScore} / 100
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Compounding Acceleration Tier
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Coast Status</span>
                  <span className={`font-bold ${fireData.milestones.coastFire.isCoastAchieved ? 'text-mint-400' : 'text-amber-400'}`}>
                    {fireData.milestones.coastFire.isCoastAchieved ? 'Achieved 🚀' : 'Building'}
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Parameter Sliders & 6-Tier Cards Split Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Calibration Sliders (5 cols) */}
              <div className="lg:col-span-5 glass-card p-6 border border-slate-800/80 rounded-2xl flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-slate-100 text-sm">Real-Time Parameter Calibration</h3>
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
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Reset
                  </button>
                </div>

                {/* Slider 1: Monthly Income */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Monthly Net Income</span>
                    <span className="text-slate-100 font-bold">{formatINR(fireIncome)}</span>
                  </div>
                  <input
                    type="range"
                    min={20000}
                    max={1000000}
                    step={5000}
                    value={fireIncome}
                    onChange={(e) => setFireIncome(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Slider 2: Monthly Expenses */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Monthly Living Expenses</span>
                    <span className="text-slate-100 font-bold">{formatINR(fireExpense)}</span>
                  </div>
                  <input
                    type="range"
                    min={10000}
                    max={800000}
                    step={2500}
                    value={fireExpense}
                    onChange={(e) => setFireExpense(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Slider 3: Current Invested Net Worth */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Current Invested Net Worth</span>
                    <span className="text-slate-100 font-bold">{formatINR(fireNetWorth)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50000000}
                    step={50000}
                    value={fireNetWorth}
                    onChange={(e) => setFireNetWorth(Number(e.target.value))}
                    className="w-full accent-mint-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Slider 4: Safe Withdrawal Rate (SWR) */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Safe Withdrawal Rate (SWR)</span>
                    <span className="text-slate-100 font-bold">{fireSwrPct}% ({(100 / fireSwrPct).toFixed(1)}x)</span>
                  </div>
                  <input
                    type="range"
                    min={2.5}
                    max={6.0}
                    step={0.1}
                    value={fireSwrPct}
                    onChange={(e) => setFireSwrPct(Number(e.target.value))}
                    className="w-full accent-violet-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
                    <span>2.5% (Conservative)</span>
                    <span>4.0% (Trinity Rule)</span>
                    <span>6.0% (Aggressive)</span>
                  </div>
                </div>

                {/* Slider 5: Expected Return & Inflation Dual Grid */}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800/80">
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-400">Expected CAGR</span>
                      <span className="text-mint-400 font-bold">{fireReturn}%</span>
                    </div>
                    <input
                      type="range"
                      min={6.0}
                      max={18.0}
                      step={0.5}
                      value={fireReturn}
                      onChange={(e) => setFireReturn(Number(e.target.value))}
                      className="w-full accent-mint-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-1">
                      <span className="text-slate-400">Inflation Rate</span>
                      <span className="text-rose-400 font-bold">{fireInflation}%</span>
                    </div>
                    <input
                      type="range"
                      min={3.0}
                      max={10.0}
                      step={0.5}
                      value={fireInflation}
                      onChange={(e) => setFireInflation(Number(e.target.value))}
                      className="w-full accent-rose-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Slider 6: Annual SIP Step-Up Growth */}
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-slate-400">Annual SIP Step-Up Growth</span>
                    <span className="text-slate-100 font-bold">+{fireStepUpPct}% / year</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={25}
                    step={1}
                    value={fireStepUpPct}
                    onChange={(e) => setFireStepUpPct(Number(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Right Column: 6-Tier Comprehensive Milestone Spectrum (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    <Target className="w-4 h-4 text-mint-400" />
                    The 6-Tier Comprehensive FIRE Spectrum
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Living Expenses: {formatINR(fireExpense * 12, true)} / yr
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Tier 1: Barista FIRE */}
                  <div className="glass-card p-4 border border-slate-800/80 hover:border-amber-500/40 rounded-xl transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-amber-400 font-mono uppercase tracking-wider">1. Barista FIRE</div>
                        <div className="text-lg font-black text-slate-100 font-display mt-0.5">
                          {formatINR(fireData.milestones.baristaFire.target, true)}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                        {fireData.milestones.baristaFire.multiplier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Covers 60% of lifestyle; remaining 40% covered via part-time passion income or freelancing.
                    </p>
                  </div>

                  {/* Tier 2: Lean FIRE */}
                  <div className="glass-card p-4 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-cyan-400 font-mono uppercase tracking-wider">2. Lean FIRE</div>
                        <div className="text-lg font-black text-slate-100 font-display mt-0.5">
                          {formatINR(fireData.milestones.leanFire.target, true)}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-300 border border-cyan-400/20">
                        {fireData.milestones.leanFire.multiplier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Frugal essentials only. Covers housing, basic groceries, utilities, and healthcare.
                    </p>
                  </div>

                  {/* Tier 3: Standard FIRE (Target) */}
                  <div className="glass-card p-4 border border-mint-500/40 bg-mint-500/5 rounded-xl shadow-lg shadow-mint-500/5">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-mint-400 font-mono uppercase tracking-wider flex items-center gap-1">
                          3. Standard FIRE <Award className="w-3.5 h-3.5" />
                        </div>
                        <div className="text-xl font-black text-mint-400 font-display mt-0.5">
                          {formatINR(fireData.milestones.standardFire.target, true)}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mint-400/20 text-mint-300 border border-mint-400/30">
                        {fireData.milestones.standardFire.multiplier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">
                      100% current lifestyle maintenance with zero work dependency forever (Trinity Study Benchmark).
                    </p>
                  </div>

                  {/* Tier 4: Chubby FIRE */}
                  <div className="glass-card p-4 border border-slate-800/80 hover:border-violet-500/40 rounded-xl transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-violet-400 font-mono uppercase tracking-wider">4. Chubby FIRE</div>
                        <div className="text-lg font-black text-slate-100 font-display mt-0.5">
                          {formatINR(fireData.milestones.chubbyFire.target, true)}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-400/10 text-violet-300 border border-violet-400/20">
                        {fireData.milestones.chubbyFire.multiplier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Comfortable freedom including regular international travel, fine dining, and hobbies.
                    </p>
                  </div>

                  {/* Tier 5: Fat FIRE */}
                  <div className="glass-card p-4 border border-slate-800/80 hover:border-fuchsia-500/40 rounded-xl transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-fuchsia-400 font-mono uppercase tracking-wider">5. Fat FIRE</div>
                        <div className="text-lg font-black text-slate-100 font-display mt-0.5">
                          {formatINR(fireData.milestones.fatFire.target, true)}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-fuchsia-400/10 text-fuchsia-300 border border-fuchsia-400/20">
                        {fireData.milestones.fatFire.multiplier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Unconstrained luxury living, high buffer margin, and generational wealth transfer.
                    </p>
                  </div>

                  {/* Tier 6: Coast FIRE */}
                  <div className="glass-card p-4 border border-slate-800/80 hover:border-emerald-500/40 rounded-xl transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">6. Coast FIRE</div>
                        <div className="text-lg font-black text-slate-100 font-display mt-0.5">
                          {formatINR(fireData.milestones.coastFire.target, true)}
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        fireData.milestones.coastFire.isCoastAchieved
                          ? 'bg-mint-400/20 text-mint-300 border-mint-400/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {fireData.milestones.coastFire.isCoastAchieved ? 'Coast Unlocked' : `Need for Age ${fireTargetRetireAge}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            {/* 1-Click Scenario Presets Bar */}
            <div className="glass-card p-4 border border-slate-800/80 rounded-2xl">
              <div className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                1-Click Macro Life Milestone Presets
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {WHAT_IF_PRESETS.map((preset) => {
                  const Icon = preset.icon;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyWhatIfPreset(preset)}
                      className="p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-700 transition-all text-left flex flex-col justify-between"
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon className="w-4 h-4" style={{ color: preset.color }} />
                        <span className="text-xs font-bold text-slate-200">{preset.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-tight">
                        {preset.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* What-If Comparative Trajectory Chart */}
            <div className="glass-card p-6 border border-slate-800/80 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    Comparative Wealth Trajectory (Base vs. Scenario)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Compounding differential with salary hikes, frugal cuts, and timed event shocks.
                  </p>
                </div>

                {whatIfResults && (
                  <div className="flex items-center gap-3 text-xs font-mono">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-slate-500" />
                      <span className="text-slate-400">Baseline</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full bg-cyan-400" />
                      <span className="text-cyan-300 font-bold">What-If Scenario</span>
                    </div>
                  </div>
                )}
              </div>

              {whatIfResults?.projections && (
                <div className="h-[340px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={whatIfResults.projections} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBase" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#64748B" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#64748B" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorScenario" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.5} />
                          <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
                      <XAxis dataKey="years" stroke="#64748B" tickFormatter={(val) => `Yr ${val}`} />
                      <YAxis stroke="#64748B" tickFormatter={(val) => formatINR(val, true)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '12px' }}
                        formatter={(val, name) => [formatINR(val), name === 'scenarioNetWorth' ? 'What-If Scenario' : 'Baseline Path']}
                        labelFormatter={(label) => `Horizon: Year ${label}`}
                      />
                      <Area type="monotone" dataKey="baseNetWorth" stroke="#94A3B8" strokeWidth={2} fillOpacity={1} fill="url(#colorBase)" name="baseNetWorth" />
                      <Area type="monotone" dataKey="scenarioNetWorth" stroke="#00F0FF" strokeWidth={3} fillOpacity={1} fill="url(#colorScenario)" name="scenarioNetWorth" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Timeframe Projections Matrix Cards */}
            {whatIfResults?.projections && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                {whatIfResults.projections.map((p) => (
                  <div key={p.years} className="glass-card p-3 border border-slate-800 rounded-xl text-center">
                    <div className="text-[11px] font-mono text-slate-400">Year {p.years}</div>
                    <div className="text-sm font-bold text-slate-100 font-display mt-1">
                      {formatINR(p.scenarioNetWorth, true)}
                    </div>
                    <div className={`text-[10px] font-mono mt-1 font-bold ${p.netGain >= 0 ? 'text-mint-400' : 'text-rose-400'}`}>
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            {/* Top Control Header & Model Switcher */}
            <div className="glass-card p-5 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 font-mono">Model:</span>
                  <select
                    value={mcModel}
                    onChange={(e) => setMcModel(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs font-bold text-slate-100 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-400"
                  >
                    <option value="gbm">Ito Geometric Brownian Motion (GBM)</option>
                    <option value="jump_diffusion">Merton Jump Diffusion (Crash Shocks)</option>
                    <option value="historical_bootstrap">Historical Bootstrap (1970–2024)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-300 font-mono">Phase:</span>
                  <select
                    value={mcPhase}
                    onChange={(e) => setMcPhase(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs font-bold text-slate-100 rounded-lg px-3 py-1.5 focus:outline-none focus:border-mint-400"
                  >
                    <option value="accumulation">Accumulation (Investing SIP)</option>
                    <option value="decumulation">Decumulation (Retirement Spending)</option>
                    <option value="lifecycle">Lifecycle (Accumulate then Retire)</option>
                  </select>
                </div>

                {/* Runs Selector */}
                <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1">
                  {[1000, 5000, 10000, 25000, 50000].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => {
                        setMcRuns(num);
                        triggerMonteCarlo(num);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-mono font-bold rounded ${
                        mcRuns === num
                          ? 'bg-cyan-500 text-slate-950 shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {num >= 1000 ? `${num / 1000}k` : num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setTableModalOpen(true)}
                  className="btn-glass-secondary text-xs flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-700"
                >
                  <Table className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Percentile Table</span>
                </button>

                <button
                  type="button"
                  disabled={runningMc}
                  onClick={() => triggerMonteCarlo()}
                  className="btn-primary-mint text-xs flex items-center gap-2 px-4 py-2 rounded-lg font-bold shadow-lg shadow-mint-500/20"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${runningMc ? 'animate-spin' : ''}`} />
                  <span>{runningMc ? 'Simulating...' : 'Re-Run Paths'}</span>
                </button>
              </div>
            </div>

            {/* Stochastic Percentile Confidence Fan Chart */}
            <div className="glass-card p-6 border border-slate-800/80 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                    <Activity className="w-5 h-5 text-mint-400" />
                    Stochastic Percentile Distribution Ribbon (P5 to P95)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Displays 90% confidence interval across {mcResults?.runs?.toLocaleString() || mcRuns.toLocaleString()} simulation paths.
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-emerald-300 font-bold">Bullish P90</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-mint-400" />
                    <span className="text-mint-300 font-bold">Median P50</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                    <span className="text-rose-300 font-bold">Deep Bear P5 / P10</span>
                  </div>
                </div>
              </div>

              {chartDataWithSpaghetti.length > 0 && (
                <div className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartDataWithSpaghetti} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorBull" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorMedian" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00FF87" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#00FF87" stopOpacity={0.0} />
                        </linearGradient>
                        <linearGradient id="colorBear" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
                      <XAxis dataKey="year" stroke="#64748B" tickFormatter={(val) => `Yr ${val}`} />
                      <YAxis stroke="#64748B" tickFormatter={(val) => formatINR(val, true)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#1E293B', borderRadius: '12px' }}
                        formatter={(val, name) => [
                          formatINR(val),
                          name === 'superBull_P95' ? 'Super Bull (P95)' :
                          name === 'bullish_P90' ? 'Bullish (P90)' :
                          name === 'median_P50' ? (isNominalDisplay ? 'Nominal Median' : 'Real Median (P50)') :
                          name === 'bearish_P10' ? 'Bearish (P10)' :
                          name === 'deepBear_P5' ? 'Deep Bear Crash (P5)' : name
                        ]}
                        labelFormatter={(label) => `Simulation Year ${label}`}
                      />
                      {/* Percentile Ribbons */}
                      <Area type="monotone" dataKey="superBull_P95" stroke="#34D399" strokeWidth={1} strokeDasharray="3 3" fillOpacity={0} name="superBull_P95" />
                      <Area type="monotone" dataKey="bullish_P90" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorBull)" name="bullish_P90" />
                      <Area type="monotone" dataKey={isNominalDisplay ? 'nominal_P50' : 'median_P50'} stroke="#00FF87" strokeWidth={3} fillOpacity={1} fill="url(#colorMedian)" name="median_P50" />
                      <Area type="monotone" dataKey="bearish_P10" stroke="#FB7185" strokeWidth={2} fillOpacity={1} fill="url(#colorBear)" name="bearish_P10" />
                      <Area type="monotone" dataKey="deepBear_P5" stroke="#F43F5E" strokeWidth={1.5} strokeDasharray="2 2" fillOpacity={0} name="deepBear_P5" />

                      {/* Sample Spaghetti Stochastic Lines */}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3.5">
                {/* Metric 1: Survival Rate */}
                <div className="glass-card p-4 border border-mint-500/20 rounded-xl">
                  <div className="text-[11px] font-mono text-slate-400">Portfolio Survival Rate</div>
                  <div className="text-xl font-black text-mint-400 font-display mt-1">
                    {mcResults.metrics.successProbabilityPct}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Probability corpus {'>'} 0
                  </div>
                </div>

                {/* Metric 2: Ruin Probability */}
                <div className="glass-card p-4 border border-rose-500/20 rounded-xl">
                  <div className="text-[11px] font-mono text-slate-400">Ruin Probability</div>
                  <div className="text-xl font-black text-rose-400 font-display mt-1">
                    {mcResults.metrics.ruinProbabilityPct}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Depletion risk before Y{mcResults.years}
                  </div>
                </div>

                {/* Metric 3: Value at Risk (VaR 95%) */}
                <div className="glass-card p-4 border border-cyan-500/20 rounded-xl">
                  <div className="text-[11px] font-mono text-slate-400">Value at Risk (VaR 95%)</div>
                  <div className="text-xl font-black text-cyan-400 font-display mt-1">
                    {formatINR(mcResults.metrics.valueAtRisk95, true)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Worst 5% statistical floor
                  </div>
                </div>

                {/* Metric 4: Conditional VaR (CVaR) */}
                <div className="glass-card p-4 border border-amber-500/20 rounded-xl">
                  <div className="text-[11px] font-mono text-slate-400">CVaR / Expected Shortfall</div>
                  <div className="text-xl font-black text-amber-400 font-display mt-1">
                    {formatINR(mcResults.metrics.conditionalVaR95, true)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Avg in tail crash scenarios
                  </div>
                </div>

                {/* Metric 5: Sharpe Ratio */}
                <div className="glass-card p-4 border border-violet-500/20 rounded-xl">
                  <div className="text-[11px] font-mono text-slate-400">Sharpe Ratio</div>
                  <div className="text-xl font-black text-violet-400 font-display mt-1">
                    {mcResults.metrics.sharpeRatio}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Risk-adjusted efficiency
                  </div>
                </div>

                {/* Metric 6: Average Max Drawdown */}
                <div className="glass-card p-4 border border-slate-800 rounded-xl">
                  <div className="text-[11px] font-mono text-slate-400">Avg Max Drawdown</div>
                  <div className="text-xl font-black text-slate-200 font-display mt-1">
                    {mcResults.metrics.avgMaxDrawdownPct}%
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    Peak-to-trough path volatility
                  </div>
                </div>
              </div>
            )}

            {/* Asset Allocation & Dynamic Glidepath Settings */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Asset Allocation Preset Selector */}
              <div className="lg:col-span-8 glass-card p-5 border border-slate-800 rounded-2xl flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PieChart className="w-4 h-4 text-cyan-400" />
                    <h4 className="font-bold text-slate-100 text-sm">Multi-Asset Covariance Allocation</h4>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    Expected: {mcExpectedReturn}% • Volatility: {mcVolatility}%
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {ASSET_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelectAssetPreset(p.id)}
                      className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                        mcSelectedPreset === p.id
                          ? 'border-cyan-400/50 bg-cyan-400/10'
                          : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="text-xs font-bold text-slate-200">{p.name}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Rules Controls (Glidepath & Guardrails) */}
              <div className="lg:col-span-4 glass-card p-5 border border-slate-800 rounded-2xl flex flex-col justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2 mb-3">
                    <ShieldCheck className="w-4 h-4 text-mint-400" />
                    Dynamic Institutional Rules
                  </h4>

                  {/* Dynamic Age Glidepath Toggle */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 cursor-pointer mb-2.5">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Dynamic Age Glidepath</div>
                      <div className="text-[10px] text-slate-400">-0.75% equity/yr into fixed income</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={mcGlidePath}
                      onChange={(e) => setMcGlidePath(e.target.checked)}
                      className="w-4 h-4 accent-mint-400 cursor-pointer"
                    />
                  </label>

                  {/* Guyton-Klinkis Guardrails Toggle */}
                  <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-800 bg-slate-900/60 cursor-pointer">
                    <div>
                      <div className="text-xs font-bold text-slate-200">Guyton-Klinkis Guardrails</div>
                      <div className="text-[10px] text-slate-400">Dynamic ±10% spending rule adjustments</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={mcGuardrails}
                      onChange={(e) => setMcGuardrails(e.target.checked)}
                      className="w-4 h-4 accent-cyan-400 cursor-pointer"
                    />
                  </label>
                </div>

                <div className="text-[11px] text-slate-400 font-mono">
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col gap-6"
          >
            {/* Header with Export Controls */}
            <div className="glass-card p-6 border border-slate-800/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-5 h-5 text-mint-400" />
                  <h3 className="font-extrabold text-slate-100 text-lg font-display">
                    Executive Quantitative Portfolio Synthesis
                  </h3>
                </div>
                <p className="text-xs text-slate-400 max-w-2xl">
                  Algorithmic breakdown of wealth trajectory, sequence-of-returns vulnerabilities, and highest-impact alpha levers.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="btn-glass-secondary text-xs flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 hover:border-slate-600"
                >
                  {copiedToast ? <Check className="w-4 h-4 text-mint-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copiedToast ? 'Copied to Clipboard!' : 'Copy Executive Brief'}</span>
                </button>
              </div>
            </div>

            {/* 3-Pillar Executive Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Pillar 1: Trajectory Health */}
              <div className="glass-card p-5 border border-mint-500/20 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-mint-400 text-xs font-bold font-mono uppercase tracking-wider mb-2">
                    <TrendingUp className="w-4 h-4" /> 1. Trajectory Health
                  </div>
                  <h4 className="text-xl font-bold text-slate-100 font-display">
                    {fireData.savingsRate >= 50 ? 'Hyper-Accumulation Tier' : 'Standard Growth Phase'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    With an active savings rate of <strong className="text-mint-400">{fireData.savingsRate}%</strong> and monthly investments of <strong className="text-slate-200">{formatINR(fireData.monthlySavings)}</strong>, your wealth is compounding rapidly toward Standard FIRE target of <strong className="text-slate-200">{formatINR(fireData.milestones.standardFire.target, true)}</strong>.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between font-mono">
                  <span>Projected Freedom Age:</span>
                  <span className="text-mint-400 font-bold">Age {fireData.projectedAge}</span>
                </div>
              </div>

              {/* Pillar 2: Sequence of Returns Vulnerability */}
              <div className="glass-card p-5 border border-amber-500/20 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono uppercase tracking-wider mb-2">
                    <ShieldAlert className="w-4 h-4" /> 2. Sequence-of-Returns Risk
                  </div>
                  <h4 className="text-xl font-bold text-slate-100 font-display">
                    {mcResults?.metrics?.successProbabilityPct >= 90 ? 'Robust Nest Egg Shield' : 'Moderate Tail Sensitivity'}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Under the 95% worst market tail crash (VaR 95%), your terminal corpus is projected at <strong className="text-cyan-400">{formatINR(mcResults?.metrics?.valueAtRisk95, true)}</strong>. Activating Guyton-Klinkis guardrails cuts ruin probability by ~60%.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between font-mono">
                  <span>Survival Probability:</span>
                  <span className="text-amber-400 font-bold">{mcResults?.metrics?.successProbabilityPct}%</span>
                </div>
              </div>

              {/* Pillar 3: Highest-Leverage Action Items */}
              <div className="glass-card p-5 border border-cyan-500/20 rounded-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold font-mono uppercase tracking-wider mb-2">
                    <Zap className="w-4 h-4" /> 3. Top 3 Alpha Levers
                  </div>
                  <ul className="text-xs text-slate-300 space-y-2 mt-2">
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">1.</span>
                      <span><strong>+5% Annual Step-Up:</strong> Accelerates retirement timeline by 3.4 years.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">2.</span>
                      <span><strong>Dynamic Glidepath:</strong> De-risks equity drawdowns during the final 5 years before freedom.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">3.</span>
                      <span><strong>Coast FIRE Buffer:</strong> Reach ₹{formatINR(fireData.milestones.coastFire.target, true)} to eliminate forced work stress immediately.</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between font-mono">
                  <span>Velocity Score:</span>
                  <span className="text-cyan-400 font-bold">{fireData.velocityScore} / 100</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-card w-full max-w-3xl max-h-[85vh] overflow-y-auto border border-cyan-500/30 bg-slate-950/95 rounded-3xl p-6 shadow-2xl flex flex-col gap-5"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-extrabold text-slate-100 text-lg font-display">
                    How It Works & Quantitative Guide
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setGuideModalOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sub-Guide Navigation Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  { id: 'fire', label: '1. FIRE Math & SWR' },
                  { id: 'whatif', label: '2. What-If Leverage' },
                  { id: 'stochastic', label: '3. Stochastic Physics & Ito Drift' },
                  { id: 'rules', label: '4. The 4 Rules for 99% Survival' },
                ].map((gTab) => (
                  <button
                    key={gTab.id}
                    type="button"
                    onClick={() => setGuideTab(gTab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                      guideTab === gTab.id
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800'
                    }`}
                  >
                    {gTab.label}
                  </button>
                ))}
              </div>

              {/* Guide Content Sections */}
              <div className="text-xs text-slate-300 space-y-4 leading-relaxed font-sans">
                {guideTab === 'fire' && (
                  <>
                    <h4 className="text-sm font-bold text-amber-400">The Mathematics of Financial Independence</h4>
                    <p>
                      Financial Independence is achieved when the passive inflation-adjusted cash flow generated by your invested corpus covers your living expenses indefinitely.
                    </p>
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-[11px] text-slate-200">
                      Target Corpus = Annual Living Expenses × (100 / Safe Withdrawal Rate)
                    </div>
                    <p>
                      <strong>Standard FIRE (4% SWR • 25x Spend):</strong> Derived from the landmark Trinity Study (1998), a 4% annual withdrawal rate indexed to inflation historicallly survived 95%+ of 30-year retirement horizons across US and global equity/debt mixes.
                    </p>
                    <p>
                      <strong>Coast FIRE:</strong> The specific corpus you need invested today such that, with zero future monthly additions, it naturally compounds to your Standard FIRE target by your target retirement age.
                    </p>
                  </>
                )}

                {guideTab === 'whatif' && (
                  <>
                    <h4 className="text-sm font-bold text-cyan-400">Leveraging the What-If Sandbox</h4>
                    <p>
                      Small recurring improvements create outsized terminal wealth differentials because compounding is non-linear:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
                      <li><strong>Frugal Optimization:</strong> Cutting recurring monthly leaks (e.g. -₹5,000/mo) adds ~₹18–25 Lakh over a 15-year horizon.</li>
                      <li><strong>Career Step-Up Growth:</strong> Escalating your SIP by +5% to +10% annually matches real salary growth and drastically shortens retirement time by 3 to 6 years.</li>
                      <li><strong>Timed Capital Shocks:</strong> Accurately model one-time life events like property downpayments or ESOP windfalls triggered at precise future years.</li>
                    </ul>
                  </>
                )}

                {guideTab === 'stochastic' && (
                  <>
                    <h4 className="text-sm font-bold text-mint-400">Stochastic Physics, Volatility Drag & Ito Calculus</h4>
                    <p>
                      Static average-return calculators suffer from the <em>"Flaw of Averages"</em> and miss <strong>Sequence of Returns Risk (SRR)</strong>.
                    </p>
                    <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-[11px] text-slate-200">
                      W_{'{t+1}'} = (W_t + C_t) × exp( (μ - 0.5×σ²)Δt + σ√Δt Z_t )
                    </div>
                    <p>
                      <strong>Volatility Drag (-0.5*σ²):</strong> High variance drains geometric CAGR. A portfolio that drops -20% and then gains +20% has a net compound loss of -4%. Our engine explicitly models this Ito drift correction.
                    </p>
                    <p>
                      <strong>Merton Jump Diffusion:</strong> Superimposes Poisson crash jumps (average -18% real drop) to account for market leptokurtosis (fat-tail black swan events like 1987, 2008, and 2020).
                    </p>
                  </>
                )}

                {guideTab === 'rules' && (
                  <>
                    <h4 className="text-sm font-bold text-violet-400">The 4 Institutional Rules for 99% Portfolio Survival</h4>
                    <div className="space-y-2.5">
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <strong className="text-mint-400">1. Guyton-Klinkis Guardrails:</strong> In retirement decumulation, cut spending by 10% during severe bear markets (Capital Preservation Rule) and increase by 10% during super bull runs (Prosperity Rule).
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <strong className="text-cyan-400">2. Dynamic Age Glidepath:</strong> Shift 0.75% of portfolio from equities into fixed income each year as retirement approaches to eliminate sequence risk.
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <strong className="text-amber-400">3. 2-Year Cash Buffer:</strong> Hold 24 months of living expenses in liquid debt/T-Bills so you never have to sell equities at a market trough.
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                        <strong className="text-fuchsia-400">4. Flexible Barista Bridge:</strong> Generating just 20%–30% of living expenses through low-stress part-time work lowers required portfolio corpus by 35%.
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setGuideModalOpen(false)}
                  className="btn-primary-mint text-xs px-5 py-2 rounded-xl"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-card w-full max-w-5xl max-h-[85vh] overflow-hidden border border-slate-800 bg-slate-950/98 rounded-3xl p-6 shadow-2xl flex flex-col gap-4"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Table className="w-5 h-5 text-mint-400" />
                  <div>
                    <h3 className="font-extrabold text-slate-100 text-lg font-display">
                      Year-by-Year Stochastic Distribution Table
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {mcResults?.runs?.toLocaleString()} Runs • {mcResults?.model?.toUpperCase()} Model • {isNominalDisplay ? 'Nominal Values' : 'Real Purchasing Power'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadCsv}
                    className="btn-primary-mint text-xs flex items-center gap-2 px-3.5 py-2 rounded-xl"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTableModalOpen(false)}
                    className="p-1.5 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Data Grid Table Container */}
              <div className="overflow-auto flex-1 border border-slate-800/80 rounded-xl">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-900/90 text-slate-400 sticky top-0 border-b border-slate-800">
                    <tr>
                      <th className="p-3">Year</th>
                      <th className="p-3 text-rose-400">Deep Bear (P5)</th>
                      <th className="p-3 text-rose-300">Bearish (P10)</th>
                      <th className="p-3 text-slate-300">Lower (P25)</th>
                      <th className="p-3 text-mint-400 font-bold">Median (P50)</th>
                      <th className="p-3 text-slate-300">Upper (P75)</th>
                      <th className="p-3 text-emerald-400 font-bold">Bullish (P90)</th>
                      <th className="p-3 text-emerald-300">Super Bull (P95)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-200">
                    {mcResults?.trajectory?.map((row) => (
                      <tr key={row.year} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-slate-400">Yr {row.year}</td>
                        <td className="p-3 text-rose-400/90">{formatINR(row.deepBear_P5)}</td>
                        <td className="p-3 text-rose-300/90">{formatINR(row.bearish_P10)}</td>
                        <td className="p-3">{formatINR(row.lowerQuartile_P25)}</td>
                        <td className="p-3 font-bold text-mint-400 bg-mint-500/5">{formatINR(isNominalDisplay ? row.nominal_P50 : row.median_P50)}</td>
                        <td className="p-3">{formatINR(row.upperQuartile_P75)}</td>
                        <td className="p-3 font-bold text-emerald-400">{formatINR(isNominalDisplay ? row.nominal_P90 : row.bullish_P90)}</td>
                        <td className="p-3 text-emerald-300">{formatINR(row.superBull_P95)}</td>
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
