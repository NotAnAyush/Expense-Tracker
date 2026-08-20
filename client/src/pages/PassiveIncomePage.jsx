import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Calculator,
  Percent,
  Coins,
  Building,
  Award,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Lock,
  Scale,
  DollarSign,
  Activity,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Info,
  ChevronRight,
  RefreshCw,
  Clock,
  Layers,
  X,
  Sliders,
  HelpCircle,
  FileCheck,
  Landmark,
  Plus,
  Trash2
} from 'lucide-react';
import { apiFetch } from '../api/client';
import { CountUp } from '../components/UI/CountUp';
import { FlowingSparkline } from '../components/UI/FlowingSparkline';

export const PassiveIncomePage = () => {
  const [quotes, setQuotes] = useState([]);
  const [schemes, setSchemes] = useState(null);
  const [macroData, setMacroData] = useState(null);
  const [activeTab, setActiveTab] = useState('radar'); // 'radar', 'dcf', 'scam', 'arbitrage'
  const [radarFilter, setRadarFilter] = useState('all'); // 'all', 'tbills', 'sgb', 'small_savings', 'fds'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Auto-Update Engine
  const [autoRefreshActive, setAutoRefreshActive] = useState(true);
  const [countdown, setCountdown] = useState(30);

  // Dynamic Watchlist Management
  const [watchedSymbols, setWatchedSymbols] = useState(['NIFTY50', 'RELIANCE', 'TCS', 'HDFCBANK', 'AAPL', 'NVDA', 'GOLD', 'USDINR']);
  const [customTickerInput, setCustomTickerInput] = useState('');

  // Interactive Yield & FD Maturity Calculator Modal State
  const [calcModalOpen, setCalcModalOpen] = useState(false);
  const [calcInput, setCalcInput] = useState({
    schemeName: 'Unity Small Finance Bank FD',
    principal: 100000,
    annualRatePercent: 9.0,
    tenorYears: 3,
    compounding: 'quarterly',
    isSeniorCitizen: false,
    seniorRateBonus: 0.50,
  });

  // Scam Shield State
  const [scamInput, setScamInput] = useState({
    schemeName: 'Quantum AI High-Yield Bot',
    promisedReturnPercent: 24,
    returnFrequency: 'annual',
    hasReferralCommission: true,
    referralTiers: 3,
    isRegulatedBySebiOrRbi: false,
    investmentMechanism: 'AI Crypto Arbitrage Bot',
    lockInMonths: 24,
    exitPenaltyPercent: 15,
  });
  const [scamResult, setScamResult] = useState(null);
  const [evaluatingScam, setEvaluatingScam] = useState(false);

  // DCF Calculator State
  const [dcfInput, setDcfInput] = useState({
    currentFCF: 1200,
    growthRateStage1: 0.14,
    growthRateStage2: 0.08,
    discountRateWACC: 0.10,
    terminalGrowthRate: 0.04,
    sharesOutstanding: 100,
    netDebt: 250,
    currentPrice: 165,
  });
  const [dcfResult, setDcfResult] = useState(null);

  // Arbitrage Solver State
  const [arbitrageInput, setArbitrageInput] = useState({
    surplusMonthlyCash: 25000,
    debtBalance: 180000,
    debtInterestRatePercent: 15.0,
    expectedEquityReturnPercent: 12.0,
    capitalGainsTaxRatePercent: 12.5,
    emergencyFundCoveredMonths: 6,
  });
  const [arbitrageResult, setArbitrageResult] = useState(null);

  const loadMarketData = async (showRefreshSpinner = false, symbolsToFetch = watchedSymbols) => {
    if (showRefreshSpinner) setRefreshing(true);
    try {
      const symbolsQuery = symbolsToFetch.join(',');
      const [quotesRes, schemesRes, macroRes] = await Promise.all([
        apiFetch(`/market/quotes?symbols=${symbolsQuery}${showRefreshSpinner ? '&refresh=true' : ''}`).catch(() => ({ quotes: [] })),
        apiFetch(`/market/schemes${showRefreshSpinner ? '?refresh=true' : ''}`).catch(() => null),
        apiFetch(`/market/macro${showRefreshSpinner ? '?refresh=true' : ''}`).catch(() => null),
      ]);

      setQuotes(quotesRes?.quotes || []);
      setSchemes(schemesRes);
      setMacroData(macroRes);
      setLastRefreshed(new Date());
      setCountdown(30);
    } catch (err) {
      console.warn('Market data load warning:', err.message);
    } finally {
      setLoading(false);
      if (showRefreshSpinner) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMarketData(false, watchedSymbols);
    runDcfCalculation();
    runArbitrageSolver();
    runScamAudit();
  }, []);

  // 30-Second Live Polling Loop
  useEffect(() => {
    if (!autoRefreshActive) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadMarketData(false, watchedSymbols);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefreshActive, watchedSymbols]);

  const handleAddCustomTicker = (e) => {
    e.preventDefault();
    const formatted = customTickerInput.trim().toUpperCase();
    if (!formatted) return;

    if (!watchedSymbols.includes(formatted)) {
      const updated = [...watchedSymbols, formatted];
      setWatchedSymbols(updated);
      loadMarketData(true, updated);
    }
    setCustomTickerInput('');
  };

  const handleRemoveTicker = (symToRemove) => {
    const updated = watchedSymbols.filter((s) => s !== symToRemove);
    setWatchedSymbols(updated);
    setQuotes((prev) => prev.filter((q) => q.symbol !== symToRemove));
  };

  const runScamAudit = async () => {
    setEvaluatingScam(true);
    try {
      const res = await apiFetch('/market/scam-check', {
        method: 'POST',
        body: JSON.stringify(scamInput),
      });
      setScamResult(res);
    } catch (err) {
      console.warn('Scam check error:', err.message);
    } finally {
      setEvaluatingScam(false);
    }
  };

  const runDcfCalculation = async () => {
    try {
      const res = await apiFetch('/market/dcf-valuation', {
        method: 'POST',
        body: JSON.stringify(dcfInput),
      });
      setDcfResult(res);
    } catch (err) {
      console.warn('DCF calculation error:', err.message);
    }
  };

  const runArbitrageSolver = async () => {
    try {
      const res = await apiFetch('/market/arbitrage-solve', {
        method: 'POST',
        body: JSON.stringify(arbitrageInput),
      });
      setArbitrageResult(res);
    } catch (err) {
      console.warn('Arbitrage calculation error:', err.message);
    }
  };

  const openCalculator = (schemeName, ratePercent, tenor = 3, compounding = 'quarterly') => {
    setCalcInput({
      schemeName,
      principal: 100000,
      annualRatePercent: ratePercent,
      tenorYears: tenor,
      compounding,
      isSeniorCitizen: false,
      seniorRateBonus: 0.50,
    });
    setCalcModalOpen(true);
  };

  const calculatedMaturity = useMemo(() => {
    const p = Math.max(100, Number(calcInput.principal) || 100000);
    const bonus = calcInput.isSeniorCitizen ? Number(calcInput.seniorRateBonus || 0.50) : 0;
    const effectiveRate = (Number(calcInput.annualRatePercent) || 7.5) + bonus;
    const t = Math.max(0.1, Number(calcInput.tenorYears) || 1);
    const rDec = effectiveRate / 100;

    let maturityAmount = p;
    let totalInterest = 0;

    if (calcInput.compounding === 'simple') {
      totalInterest = p * rDec * t;
      maturityAmount = p + totalInterest;
    } else {
      let n = 4;
      if (calcInput.compounding === 'monthly') n = 12;
      if (calcInput.compounding === 'annual') n = 1;

      maturityAmount = p * Math.pow(1 + rDec / n, n * t);
      totalInterest = maturityAmount - p;
    }

    const effectiveApy = ((Math.pow(maturityAmount / p, 1 / t) - 1) * 100);

    return {
      principal: Math.round(p),
      effectiveRate: Number(effectiveRate.toFixed(2)),
      maturityAmount: Math.round(maturityAmount),
      totalInterest: Math.round(totalInterest),
      effectiveApy: Number(effectiveApy.toFixed(2)),
      quarterlyPayout: Math.round((p * rDec) / 4),
      monthlyPayout: Math.round((p * rDec) / 12),
    };
  }, [calcInput]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '70px' }}>
      {/* 1. HERO HEADER WITH LIVE STATUS & REFRESH */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span className="animate-live-dot" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#00FF87', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Live Dynamic Market & Sovereign Radar • v3.9
            </span>
          </div>
          <h1 className="display-xl" style={{ margin: 0 }}>
            Stock Market & Passive Wealth Studio
          </h1>
          <p className="body-sm" style={{ margin: '4px 0 0 0', color: '#94A3B8' }}>
            Multi-tier real-time market feeds (NSE/BSE/US/Crypto), official RBI sovereign bond yields, MoF small savings rates, and DCF intrinsic valuations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Auto-Refresh Toggle & Countdown */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: autoRefreshActive ? '#00FF87' : '#94A3B8' }} />
              <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                {autoRefreshActive ? `Auto: ${countdown}s` : 'Paused'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAutoRefreshActive(!autoRefreshActive)}
              style={{
                background: 'transparent',
                border: 'none',
                color: autoRefreshActive ? '#00FF87' : '#94A3B8',
                fontSize: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '2px 4px',
              }}
            >
              {autoRefreshActive ? 'PAUSE' : 'RESUME'}
            </button>
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={() => loadMarketData(true)}
            disabled={refreshing}
            className="btn-glass-secondary"
            style={{
              height: '38px',
              padding: '0 14px',
              fontSize: '12px',
              color: '#00FF87',
              borderColor: 'rgba(0, 255, 135, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Live Rates'}</span>
          </button>

          {/* Calculator Quick Modal Button */}
          <button
            type="button"
            onClick={() => {
              setCalcModalOpen(true);
            }}
            className="btn-primary-mint"
            style={{
              height: '38px',
              padding: '0 14px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Calculator size={14} />
            <span>Yield & FD Calculator</span>
          </button>
        </div>
      </div>      {/* 2. LIVE MACROECONOMIC BENCHMARK STRIP WITH FLOWING SPARKLINE METERS */}
      <motion.div
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="glass-card glass-card-hover-border"
        style={{
          padding: '16px 20px',
          background: 'linear-gradient(90deg, rgba(13, 17, 28, 0.95), rgba(20, 28, 45, 0.95))',
          border: '1px solid rgba(0, 240, 255, 0.2)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>RBI Repo Rate (MPC)</div>
          <div className="font-display tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: '#00F0FF' }}>
            <CountUp value={macroData?.monetaryPolicy?.india?.rbiRepoRatePercent || 6.50} suffix="% p.a." />
          </div>
          <div style={{ marginTop: '4px' }}>
            <FlowingSparkline data={[6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5, 6.5]} color="#00F0FF" height={18} />
          </div>
          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>Official Central Bank Benchmark</div>
        </div>

        <div>
          <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>India CPI Inflation</div>
          <div className="font-display tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: '#FFB800' }}>
            <CountUp value={macroData?.monetaryPolicy?.india?.cpiInflationPercent || 5.40} suffix="% p.a." />
          </div>
          <div style={{ marginTop: '4px' }}>
            <FlowingSparkline data={[5.7, 5.5, 5.1, 4.8, 5.2, 5.4, 5.3, 5.4]} color="#FFB800" height={18} />
          </div>
          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>MoSPI Headline Gazette</div>
        </div>

        <div>
          <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>10Y Benchmark G-Sec</div>
          <div className="font-display tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: '#00FF87' }}>
            <CountUp value={macroData?.sovereignYieldCurve?.tenor10y?.yieldPercent || 7.12} suffix="% p.a." />
          </div>
          <div style={{ marginTop: '4px' }}>
            <FlowingSparkline data={[7.25, 7.22, 7.18, 7.15, 7.14, 7.13, 7.12, 7.12]} color="#00FF87" height={18} />
          </div>
          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>Real Sovereign Spread: +{(7.12 - (macroData?.monetaryPolicy?.india?.cpiInflationPercent || 5.40)).toFixed(2)}%</div>
        </div>

        <div>
          <div style={{ fontSize: '10.5px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>24K Spot Gold (999)</div>
          <div className="font-display tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: '#FFD700' }}>
            <CountUp value={macroData?.preciousMetalsSpot?.gold24KPerGramInr || 7550} prefix="₹" suffix="/g" />
          </div>
          <div style={{ marginTop: '4px' }}>
            <FlowingSparkline data={[6800, 7050, 7150, 7300, 7420, 7490, 7520, 7550]} color="#FFD700" height={18} />
          </div>
          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>₹{(macroData?.preciousMetalsSpot?.gold24KPer10GramInr || 75500).toLocaleString()}/10g</div>
        </div>
      </motion.div>

      {/* 3. SUB-STUDIO NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { id: 'radar', label: 'Scheme Radar & Yields', icon: Award },
          { id: 'dcf', label: 'DCF Intrinsic Valuation', icon: Calculator },
          { id: 'scam', label: 'Scam & Ponzi Shield', icon: ShieldCheck },
          { id: 'arbitrage', label: 'Debt vs Invest Arbitrage', icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`filter-chip ${isActive ? 'filter-chip-active' : ''}`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. LIVE MARKET WATCH TICKER RIBBON & DYNAMIC SEARCH */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
            Live Market Watchlist ({quotes.length} Assets)
          </div>

          {/* Quick Custom Ticker Search Form */}
          <form onSubmit={handleAddCustomTicker} style={{ display: 'flex', gap: '6px' }}>
            <input
              type="text"
              placeholder="Search ticker (e.g. TSLA, TATAMOTORS, BTC-INR)..."
              value={customTickerInput}
              onChange={(e) => setCustomTickerInput(e.target.value)}
              className="input-luxury"
              style={{ width: '280px', height: '30px', fontSize: '11px', padding: '0 10px' }}
            />
            <button
              type="submit"
              className="btn-glass-secondary"
              style={{ height: '30px', padding: '0 10px', fontSize: '11px', color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.3)' }}
            >
              <Plus size={12} /> Add
            </button>
          </form>
        </div>

        <div style={{ overflowX: 'auto', paddingBottom: '4px' }}>
          <div style={{ display: 'flex', gap: '10px', minWidth: 'max-content' }}>
            {quotes.map((q) => {
              const isPositive = q.change >= 0;
              return (
                <div
                  key={q.symbol}
                  className="glass-card"
                  style={{
                    padding: '10px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    background: 'rgba(13, 17, 28, 0.85)',
                    minWidth: '185px',
                    position: 'relative',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#F8FAFC' }}>{q.symbol}</span>
                      <span style={{ fontSize: '9px', padding: '1px 4px', borderRadius: '4px', background: q.marketStatus === 'LIVE' ? 'rgba(0, 255, 135, 0.15)' : 'rgba(255, 255, 255, 0.08)', color: q.marketStatus === 'LIVE' ? '#00FF87' : '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                        {q.marketStatus === 'LIVE' ? 'LIVE' : 'BENCHMARK'}
                      </span>
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#94A3B8', maxWidth: '125px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.name}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
                    <div className="font-display tabular-nums" style={{ fontSize: '13.5px', fontWeight: 800, color: '#F8FAFC' }}>
                      {q.currency}{q.price?.toLocaleString()}
                    </div>
                    <div
                      className="font-mono tabular-nums"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: isPositive ? '#00FF87' : '#F43F5E',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: '2px',
                      }}
                    >
                      {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                      {isPositive ? '+' : ''}{q.changePercent}%
                    </div>
                  </div>

                  {/* Remove Button for custom tickers */}
                  {watchedSymbols.length > 3 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTicker(q.symbol)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: '2px',
                        marginLeft: '4px',
                        opacity: 0.6,
                      }}
                      title="Remove from watchlist"
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. STUDIO VIEWS */}
      <AnimatePresence mode="wait">
        {/* ========================================================================= */}
        {/* TAB 1: SOVEREIGN SCHEME RADAR & YIELDS */}
        {/* ========================================================================= */}
        {activeTab === 'radar' && (
          <motion.div
            key="radar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* Filter Category Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {[
                { id: 'all', label: 'All Verified Instruments' },
                { id: 'tbills', label: 'RBI T-Bills & G-Secs' },
                { id: 'sgb', label: 'Sovereign Gold Bonds' },
                { id: 'small_savings', label: 'Post Office & Govt Schemes' },
                { id: 'fds', label: 'Bank Fixed Deposits' },
              ].map((filt) => (
                <button
                  key={filt.id}
                  type="button"
                  onClick={() => setRadarFilter(filt.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    background: radarFilter === filt.id ? 'rgba(0, 255, 135, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: radarFilter === filt.id ? '1px solid rgba(0, 255, 135, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: radarFilter === filt.id ? '#00FF87' : '#94A3B8',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {filt.label}
                </button>
              ))}
            </div>

            {/* 1. T-Bills & SGBs 2-Column Grid */}
            {(radarFilter === 'all' || radarFilter === 'tbills' || radarFilter === 'sgb') && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
                {/* RBI Treasury Bills & G-Secs */}
                {(radarFilter === 'all' || radarFilter === 'tbills') && (
                  <div className="glass-card" style={{ padding: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Building size={18} color="#00F0FF" />
                        <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                          RBI Sovereign Treasury Bills & G-Secs
                        </h3>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '999px', background: 'rgba(0, 240, 255, 0.12)', color: '#00F0FF', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
                        Zero Sovereign Risk
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {schemes?.treasuryBills?.map((tb) => (
                        <div
                          key={tb.tenor}
                          className="glass-card-interactive"
                          style={{
                            padding: '12px 16px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                          onClick={() => openCalculator(tb.tenor, tb.yieldPercent, tb.tenor.includes('364') ? 1 : (tb.tenor.includes('10-Year') ? 10 : 0.5), 'simple')}
                        >
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{tb.tenor}</div>
                            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{tb.issuer} • Min ₹{tb.minimumAmount?.toLocaleString()}</div>
                            <div style={{ fontSize: '10px', color: '#64748B', marginTop: '2px' }}>{tb.source}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="font-display tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: '#00F0FF' }}>
                              {tb.yieldPercent}% p.a.
                            </div>
                            <div style={{ fontSize: '10px', color: '#00FF87', marginTop: '1px' }}>
                              Real Yield: +{tb.realYieldPercent || (tb.yieldPercent - 5.4).toFixed(2)}%
                            </div>
                            <button
                              type="button"
                              className="btn-glass-secondary"
                              style={{ height: '22px', padding: '0 8px', fontSize: '10px', color: '#00F0FF', borderColor: 'rgba(0, 240, 255, 0.3)', marginTop: '3px' }}
                            >
                              Calculate
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sovereign Gold Bonds & 24K Spot */}
                {(radarFilter === 'all' || radarFilter === 'sgb') && (
                  <div className="glass-card" style={{ padding: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Coins size={18} color="#FFD700" />
                        <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                          Sovereign Gold Bonds (SGB) & Live Spot
                        </h3>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '999px', background: 'rgba(255, 215, 0, 0.12)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                        0% Capital Gains Tax
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {/* Live 24K Gold Spot Card */}
                      <div
                        style={{
                          padding: '14px 16px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08), rgba(255, 215, 0, 0.02))',
                          border: '1px solid rgba(255, 215, 0, 0.25)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: '#FFD700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            24K Gold Spot (999 Purity)
                          </div>
                          <div className="font-display tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: '#F8FAFC', marginTop: '2px' }}>
                            ₹{schemes?.goldSpot24K?.pricePerGramInr?.toLocaleString()} <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>/ gram</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                            10 Grams: ₹{schemes?.goldSpot24K?.pricePer10GramInr?.toLocaleString()}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(0, 255, 135, 0.15)', color: '#00FF87' }}>
                            {schemes?.marketStatus || 'LIVE FEED'}
                          </span>
                        </div>
                      </div>

                      {/* SGB Terms */}
                      {schemes?.goldBonds?.map((sgb) => (
                        <div
                          key={sgb.name}
                          className="glass-card-interactive"
                          style={{
                            padding: '14px 16px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                          }}
                          onClick={() => openCalculator('Sovereign Gold Bonds (2.5% Coupon + Gold CAGR)', 13.7, 8, 'annual')}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#F8FAFC' }}>{sgb.name}</div>
                            <div className="font-display tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: '#FFD700' }}>
                              2.50% p.a. + Gold CAGR
                            </div>
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#00FF87', marginTop: '4px', fontWeight: 600 }}>
                            {sgb.capitalGainsTax}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                            Tenor: {sgb.tenorYears} Years (Premature exit at Year {sgb.prematureExitYears}) • {sgb.digitalDiscount}
                          </div>
                          <div style={{ fontSize: '10px', color: '#64748B', marginTop: '4px' }}>
                            {sgb.statutoryAuthority}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Official Government Savings Schemes (MoF Gazette) */}
            {(radarFilter === 'all' || radarFilter === 'small_savings') && (
              <div className="glass-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Landmark size={18} color="#00FF87" />
                    <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                      Official Government of India Small Savings Schemes (MoF Gazette)
                    </h3>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '999px', background: 'rgba(0, 255, 135, 0.12)', color: '#00FF87', border: '1px solid rgba(0, 255, 135, 0.3)' }}>
                    Sovereign Backed & Sec 80C
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  {schemes?.governmentSchemes?.map((sch) => (
                    <div
                      key={sch.id}
                      className="glass-card-interactive"
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                      onClick={() => openCalculator(sch.name, sch.ratePercent, sch.lockInYears, sch.frequency.includes('Quarterly') ? 'quarterly' : (sch.frequency.includes('Monthly') ? 'monthly' : 'annual'))}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{sch.name}</div>
                          <div className="font-display tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: '#00FF87', whiteSpace: 'nowrap' }}>
                            {sch.ratePercent}%
                          </div>
                        </div>
                        <div style={{ fontSize: '10px', color: '#00F0FF', marginTop: '2px' }}>
                          Real Yield: +{sch.realYieldPercent || (sch.ratePercent - 5.4).toFixed(2)}% over CPI
                        </div>
                        <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '4px' }}>
                          {sch.frequency} • Lock-in: {sch.lockInYears} Yrs
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          Eligibility: {sch.eligibility}
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <span style={{ fontSize: '10px', color: sch.taxDeduction80C ? '#00FF87' : '#94A3B8', fontWeight: 600 }}>
                          {sch.taxDeduction80C ? '✓ Sec 80C Eligible' : 'Standard Taxation'}
                        </span>
                        <button
                          type="button"
                          className="btn-glass-secondary"
                          style={{ height: '22px', padding: '0 8px', fontSize: '10px', color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.3)' }}
                        >
                          Calculate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Verified Bank Fixed Deposits (DICGC Insured) */}
            {(radarFilter === 'all' || radarFilter === 'fds') && (
              <div className="glass-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldCheck size={18} color="#00F0FF" />
                    <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                      Highest Verified Bank Fixed Deposits (DICGC Insured up to ₹5 Lakhs)
                    </h3>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '999px', background: 'rgba(0, 240, 255, 0.12)', color: '#00F0FF', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
                    RBI Regulated
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  {schemes?.bankFixedDeposits?.map((fd) => (
                    <div
                      key={fd.bank}
                      className="glass-card-interactive"
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '10px',
                      }}
                      onClick={() => openCalculator(`${fd.bank} FD (${fd.tenureFormatted})`, fd.maxRatePercent, fd.tenure.includes('1001') ? 2.74 : (fd.tenure.includes('732') ? 2.0 : 1.1), 'quarterly')}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#F8FAFC' }}>{fd.bank}</div>
                            <div style={{ fontSize: '11px', color: '#94A3B8' }}>{fd.category}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div className="font-display tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: '#00F0FF' }}>
                              {fd.maxRatePercent}%
                            </div>
                            <div style={{ fontSize: '10px', color: '#FFD700', fontWeight: 600 }}>
                              Senior: {fd.seniorCitizenRate}%
                            </div>
                            <div style={{ fontSize: '10px', color: '#00FF87' }}>
                              Real: +{fd.realYieldPercent || (fd.maxRatePercent - 5.4).toFixed(2)}%
                            </div>
                          </div>
                        </div>

                        <div style={{ fontSize: '11.5px', fontWeight: 600, color: '#F8FAFC', marginTop: '6px' }}>
                          Tenure: <span style={{ color: '#00F0FF' }}>{fd.tenureFormatted || fd.tenure}</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.04)' }}>
                        <span style={{ fontSize: '10px', color: '#00FF87', fontWeight: 600 }}>
                          ✓ DICGC ₹5L Insured
                        </span>
                        <button
                          type="button"
                          className="btn-glass-secondary"
                          style={{ height: '22px', padding: '0 8px', fontSize: '10px', color: '#00F0FF', borderColor: 'rgba(0, 240, 255, 0.3)' }}
                        >
                          Calculate
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: DCF INTRINSIC VALUATION */}
        {/* ========================================================================= */}
        {activeTab === 'dcf' && (
          <motion.div
            key="dcf"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}
          >
            {/* Input Controls */}
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Calculator size={18} color="#00FF87" />
                <h3 className="heading-md" style={{ margin: 0 }}>2-Stage Discounted Free Cash Flow (DCF)</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                    Current Free Cash Flow (TTM in ₹ Cr)
                  </label>
                  <input
                    type="number"
                    value={dcfInput.currentFCF}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setDcfInput({ ...dcfInput, currentFCF: val });
                    }}
                    className="input-luxury"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                      Stage 1 Growth (5 Yrs %)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={dcfInput.growthRateStage1}
                      onChange={(e) => setDcfInput({ ...dcfInput, growthRateStage1: parseFloat(e.target.value) || 0 })}
                      className="input-luxury"
                    />
                  </div>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                      Stage 2 Growth (Yrs 6–10 %)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={dcfInput.growthRateStage2}
                      onChange={(e) => setDcfInput({ ...dcfInput, growthRateStage2: parseFloat(e.target.value) || 0 })}
                      className="input-luxury"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                      Discount Rate (WACC %)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={dcfInput.discountRateWACC}
                      onChange={(e) => setDcfInput({ ...dcfInput, discountRateWACC: parseFloat(e.target.value) || 0 })}
                      className="input-luxury"
                    />
                  </div>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                      Terminal Growth Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={dcfInput.terminalGrowthRate}
                      onChange={(e) => setDcfInput({ ...dcfInput, terminalGrowthRate: parseFloat(e.target.value) || 0 })}
                      className="input-luxury"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                      Shares Outstanding (Cr)
                    </label>
                    <input
                      type="number"
                      value={dcfInput.sharesOutstanding}
                      onChange={(e) => setDcfInput({ ...dcfInput, sharesOutstanding: parseFloat(e.target.value) || 1 })}
                      className="input-luxury"
                    />
                  </div>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                      Current Market Price (₹)
                    </label>
                    <input
                      type="number"
                      value={dcfInput.currentPrice}
                      onChange={(e) => setDcfInput({ ...dcfInput, currentPrice: parseFloat(e.target.value) || 0 })}
                      className="input-luxury"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={runDcfCalculation}
                  className="btn-primary-mint"
                  style={{ marginTop: '10px', height: '40px' }}
                >
                  Recalculate Intrinsic Value
                </button>
              </div>
            </div>

            {/* DCF Output Synthesis */}
            {dcfResult && (
              <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Valuation Verdict & Margin of Safety
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                    <div className="font-display" style={{ fontSize: '32px', fontWeight: 900, color: '#00FF87' }}>
                      ₹{dcfResult.fairValuePerShare}
                    </div>
                    <div style={{ fontSize: '14px', color: '#94A3B8' }}>
                      Fair Intrinsic Value
                    </div>
                  </div>

                  <div style={{ marginTop: '12px', padding: '14px', borderRadius: '12px', background: dcfResult.upsidePercent >= 0 ? 'rgba(0, 255, 135, 0.08)' : 'rgba(244, 63, 94, 0.08)', border: `1px solid ${dcfResult.upsidePercent >= 0 ? 'rgba(0, 255, 135, 0.3)' : 'rgba(244, 63, 94, 0.3)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>Recommendation:</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: dcfResult.upsidePercent >= 0 ? '#00FF87' : '#F43F5E' }}>
                        {dcfResult.verdict}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '4px' }}>
                      Margin of Safety: <strong style={{ color: dcfResult.upsidePercent >= 0 ? '#00FF87' : '#F43F5E' }}>{dcfResult.upsidePercent}%</strong> relative to current price (₹{dcfInput.currentPrice})
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }}>
                    <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)' }}>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>10-Yr PV of Cashflows</div>
                      <div className="font-display tabular-nums" style={{ fontSize: '14px', fontWeight: 800, color: '#F8FAFC' }}>
                        ₹{dcfResult.presentValueOfCashflows?.toLocaleString()} Cr
                      </div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)' }}>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>PV of Terminal Value</div>
                      <div className="font-display tabular-nums" style={{ fontSize: '14px', fontWeight: 800, color: '#F8FAFC' }}>
                        ₹{dcfResult.presentValueOfTerminalValue?.toLocaleString()} Cr
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '18px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  Formula: Gordon Growth Terminal Value + 10-Yr Discounted Free Cash Flow PV.
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SCAM & PONZI SHIELD */}
        {/* ========================================================================= */}
        {activeTab === 'scam' && (
          <motion.div
            key="scam"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}
          >
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <ShieldCheck size={18} color="#F43F5E" />
                <h3 className="heading-md" style={{ margin: 0 }}>Forensic Fraud & Scam Detection Audit</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Scheme / Platform Name</label>
                  <input
                    type="text"
                    value={scamInput.schemeName}
                    onChange={(e) => setScamInput({ ...scamInput, schemeName: e.target.value })}
                    className="input-luxury"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Promised Return (% p.a.)</label>
                    <input
                      type="number"
                      value={scamInput.promisedReturnPercent}
                      onChange={(e) => setScamInput({ ...scamInput, promisedReturnPercent: parseFloat(e.target.value) || 0 })}
                      className="input-luxury"
                    />
                  </div>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Payout Frequency</label>
                    <select
                      value={scamInput.returnFrequency}
                      onChange={(e) => setScamInput({ ...scamInput, returnFrequency: e.target.value })}
                      className="input-luxury"
                    >
                      <option value="daily">Daily (High Risk)</option>
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#F8FAFC', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={scamInput.hasReferralCommission}
                      onChange={(e) => setScamInput({ ...scamInput, hasReferralCommission: e.target.checked })}
                    />
                    Has Multi-Tier Referral / MLM Commission
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: '#F8FAFC', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={scamInput.isRegulatedBySebiOrRbi}
                      onChange={(e) => setScamInput({ ...scamInput, isRegulatedBySebiOrRbi: e.target.checked })}
                    />
                    Registered & Regulated by SEBI, RBI, or SEC
                  </label>
                </div>

                <button
                  type="button"
                  onClick={runScamAudit}
                  disabled={evaluatingScam}
                  className="btn-primary-mint"
                  style={{ marginTop: '10px', height: '40px' }}
                >
                  {evaluatingScam ? 'Auditing Regulatory Databases...' : 'Run Forensic Scam Audit'}
                </button>
              </div>
            </div>

            {scamResult && (
              <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Scam Risk Scorecard
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <div
                      className="font-display"
                      style={{
                        fontSize: '34px',
                        fontWeight: 900,
                        color: scamResult.riskScore >= 60 ? '#F43F5E' : (scamResult.riskScore >= 30 ? '#FFB800' : '#00FF87'),
                      }}
                    >
                      {scamResult.riskScore} / 100
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#94A3B8' }}>
                      Risk Category: <strong style={{ color: scamResult.riskScore >= 60 ? '#F43F5E' : '#00FF87' }}>{scamResult.verdict}</strong>
                    </span>
                  </div>

                  <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {scamResult.redFlags?.map((flag, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'rgba(244, 63, 94, 0.08)',
                          border: '1px solid rgba(244, 63, 94, 0.2)',
                          fontSize: '12px',
                          color: '#F87171',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        <AlertTriangle size={14} />
                        <span>{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  Algorithmic Fraud Red-Flag Shield (ADR-011). Validates risk-free yield spreads vs. RBI Repo Rate (6.50%).
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DEBT VS INVEST ARBITRAGE */}
        {/* ========================================================================= */}
        {activeTab === 'arbitrage' && (
          <motion.div
            key="arbitrage"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '18px' }}
          >
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <Scale size={18} color="#00F0FF" />
                <h3 className="heading-md" style={{ margin: 0 }}>Debt Payoff vs. Equity Investment Solver</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Surplus Monthly Cash Available (₹)</label>
                  <input
                    type="number"
                    value={arbitrageInput.surplusMonthlyCash}
                    onChange={(e) => setArbitrageInput({ ...arbitrageInput, surplusMonthlyCash: parseFloat(e.target.value) || 0 })}
                    className="input-luxury"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Debt Interest Rate (% APR)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={arbitrageInput.debtInterestRatePercent}
                      onChange={(e) => setArbitrageInput({ ...arbitrageInput, debtInterestRatePercent: parseFloat(e.target.value) || 0 })}
                      className="input-luxury"
                    />
                  </div>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Expected Equity Return (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={arbitrageInput.expectedEquityReturnPercent}
                      onChange={(e) => setArbitrageInput({ ...arbitrageInput, expectedEquityReturnPercent: parseFloat(e.target.value) || 0 })}
                      className="input-luxury"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={runArbitrageSolver}
                  className="btn-primary-mint"
                  style={{ marginTop: '10px', height: '40px' }}
                >
                  Optimize Monthly Cash Allocation
                </button>
              </div>
            </div>

            {arbitrageResult && (
              <div className="glass-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                    Optimal Arbitrage Strategy
                  </div>

                  <div className="font-display" style={{ fontSize: '24px', fontWeight: 800, color: '#00F0FF', marginTop: '10px' }}>
                    {arbitrageResult.allocationStrategy?.replace(/_/g, ' ')}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                    <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>Monthly to Debt Payoff</div>
                      <div className="font-display tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: '#F43F5E', marginTop: '2px' }}>
                        ₹{arbitrageResult.monthlyToDebt?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94A3B8' }}>{arbitrageResult.debtPrepayAllocationPercent}% Allocation</div>
                    </div>

                    <div style={{ padding: '14px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>Monthly to Equity SIP</div>
                      <div className="font-display tabular-nums" style={{ fontSize: '20px', fontWeight: 800, color: '#00FF87', marginTop: '2px' }}>
                        ₹{arbitrageResult.monthlyToInvestment?.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94A3B8' }}>{arbitrageResult.investmentAllocationPercent}% Allocation</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '14px', fontSize: '12.5px', color: '#94A3B8', lineHeight: 1.5 }}>
                    Net Post-Tax Spread: <strong style={{ color: '#00FF87' }}>{arbitrageResult.netArbitrageSpreadPercent}%</strong>
                  </div>
                </div>

                <div style={{ fontSize: '11px', color: '#64748B', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  Mathematical proof: Guaranteed Debt Payoff APR yields risk-free returns equivalent to paying interest drag.
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL: INTERACTIVE YIELD & FD MATURITY CALCULATOR */}
      {/* ========================================================================= */}
      {calcModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(5, 8, 16, 0.85)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setCalcModalOpen(false)}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '26px',
              border: '1px solid rgba(0, 255, 135, 0.3)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.7)',
              background: '#0B0F19',
              borderRadius: '20px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator size={18} color="#00FF87" />
                <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                  Yield & Maturity Calculator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCalcModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                  Instrument / Bank Scheme
                </label>
                <input
                  type="text"
                  value={calcInput.schemeName}
                  onChange={(e) => setCalcInput({ ...calcInput, schemeName: e.target.value })}
                  className="input-luxury"
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>
                  <span>Principal Investment: ₹{Number(calcInput.principal).toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="2000000"
                  step="10000"
                  value={calcInput.principal}
                  onChange={(e) => setCalcInput({ ...calcInput, principal: parseFloat(e.target.value) || 10000 })}
                  className="slider-luxury slider-mint"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>
                    <span>Interest Rate: {calcInput.annualRatePercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="14.0"
                    step="0.05"
                    value={calcInput.annualRatePercent}
                    onChange={(e) => setCalcInput({ ...calcInput, annualRatePercent: parseFloat(e.target.value) || 7.0 })}
                    className="slider-luxury slider-cyan"
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94A3B8', marginBottom: '4px' }}>
                    <span>Tenor: {calcInput.tenorYears} Yrs</span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="15.0"
                    step="0.25"
                    value={calcInput.tenorYears}
                    onChange={(e) => setCalcInput({ ...calcInput, tenorYears: parseFloat(e.target.value) || 1.0 })}
                    className="slider-luxury slider-amber"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#F8FAFC', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={calcInput.isSeniorCitizen}
                    onChange={(e) => setCalcInput({ ...calcInput, isSeniorCitizen: e.target.checked })}
                  />
                  Senior Citizen (+0.50% Extra Yield)
                </label>

                <select
                  value={calcInput.compounding}
                  onChange={(e) => setCalcInput({ ...calcInput, compounding: e.target.value })}
                  className="input-luxury"
                  style={{ width: '130px', height: '28px', fontSize: '11px', padding: '0 8px' }}
                >
                  <option value="quarterly">Quarterly Comp</option>
                  <option value="monthly">Monthly Comp</option>
                  <option value="annual">Annual Comp</option>
                  <option value="simple">Simple Interest</option>
                </select>
              </div>

              {/* Calculator Output Grid */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(0, 255, 135, 0.06), rgba(0, 240, 255, 0.03))',
                  border: '1px solid rgba(0, 255, 135, 0.25)',
                  marginTop: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Maturity Corpus</div>
                    <div className="font-display tabular-nums" style={{ fontSize: '26px', fontWeight: 900, color: '#00FF87' }}>
                      ₹{calculatedMaturity.maturityAmount?.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#94A3B8', textTransform: 'uppercase' }}>Total Interest</div>
                    <div className="font-display tabular-nums" style={{ fontSize: '18px', fontWeight: 800, color: '#FFD700' }}>
                      +₹{calculatedMaturity.totalInterest?.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>Effective APY</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#00F0FF' }}>{calculatedMaturity.effectiveApy}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#94A3B8' }}>Monthly Regular Payout</div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#F8FAFC' }}>₹{calculatedMaturity.monthlyPayout?.toLocaleString()}/mo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
