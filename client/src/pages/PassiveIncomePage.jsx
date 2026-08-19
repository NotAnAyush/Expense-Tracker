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
  Landmark
} from 'lucide-react';
import { apiFetch } from '../api/client';

export const PassiveIncomePage = () => {
  const [quotes, setQuotes] = useState([]);
  const [schemes, setSchemes] = useState(null);
  const [activeTab, setActiveTab] = useState('radar'); // 'radar', 'dcf', 'scam', 'arbitrage'
  const [radarFilter, setRadarFilter] = useState('all'); // 'all', 'tbills', 'sgb', 'small_savings', 'fds'
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

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

  const loadMarketData = async (showRefreshSpinner = false) => {
    if (showRefreshSpinner) setRefreshing(true);
    try {
      const [quotesRes, schemesRes] = await Promise.all([
        apiFetch('/market/quotes').catch(() => ({ quotes: [] })),
        apiFetch('/market/schemes').catch(() => null),
      ]);

      setQuotes(quotesRes?.quotes || []);
      setSchemes(schemesRes);
      setLastRefreshed(new Date());
    } catch (err) {
      console.warn('Market data load warning:', err.message);
    } finally {
      setLoading(false);
      if (showRefreshSpinner) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMarketData();
    runDcfCalculation();
    runArbitrageSolver();
    runScamAudit();
  }, []);

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
      console.warn('Arbitrage solver error:', err.message);
    }
  };

  // Open Maturity Calculator pre-filled with scheme details
  const openCalculator = (schemeName, ratePercent, tenorYears = 3, compounding = 'quarterly') => {
    setCalcInput({
      schemeName,
      principal: 100000,
      annualRatePercent: Number(ratePercent) || 7.5,
      tenorYears: Number(tenorYears) || 3,
      compounding,
      isSeniorCitizen: false,
      seniorRateBonus: 0.50,
    });
    setCalcModalOpen(true);
  };

  // Compute live client-side maturity calculation
  const computedMaturity = useMemo(() => {
    const p = Math.max(100, Number(calcInput.principal) || 100000);
    const effectiveRate = Number(calcInput.annualRatePercent || 7.5) + (calcInput.isSeniorCitizen ? Number(calcInput.seniorRateBonus || 0.5) : 0);
    const t = Math.max(0.1, Number(calcInput.tenorYears) || 1);
    const rDec = effectiveRate / 100;

    let maturityAmount = p;
    let totalInterest = 0;

    if (calcInput.compounding === 'simple') {
      totalInterest = p * rDec * t;
      maturityAmount = p + totalInterest;
    } else {
      let n = 4; // quarterly
      if (calcInput.compounding === 'monthly') n = 12;
      if (calcInput.compounding === 'annual') n = 1;

      maturityAmount = p * Math.pow(1 + rDec / n, n * t);
      totalInterest = maturityAmount - p;
    }

    const effectiveApy = (Math.pow(maturityAmount / p, 1 / t) - 1) * 100;

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
              Live Market & Sovereign Yield Radar • v3.8
            </span>
          </div>
          <h1 className="display-xl" style={{ margin: 0 }}>
            Stock Market & Passive Wealth Studio
          </h1>
          <p className="body-sm" style={{ margin: '4px 0 0 0', color: '#94A3B8' }}>
            Real-time market feeds (NSE/BSE/US), official RBI sovereign bond yields, MoF small savings rates, and DCF intrinsic valuations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
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
      </div>

      {/* 2. SUB-STUDIO NAVIGATION TABS */}
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

      {/* 3. LIVE MARKET WATCH TICKER RIBBON */}
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
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. STUDIO VIEWS */}
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

                {/* Sovereign Gold Bonds (SGB) & Live 24K Gold Spot */}
                {(radarFilter === 'all' || radarFilter === 'sgb') && (
                  <div className="glass-card" style={{ padding: '22px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Coins size={18} color="#FFD700" />
                        <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                          Sovereign Gold Bonds & Live 24K Gold
                        </h3>
                      </div>
                      <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '999px', background: 'rgba(255, 215, 0, 0.12)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                        0% Capital Gains Tax
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {/* Live 24K Gold Spot Benchmark */}
                      <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)', border: '1px solid rgba(255, 215, 0, 0.25)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>Live 24K Gold Spot (999 Purity)</span>
                            <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255, 215, 0, 0.2)', color: '#FFD700', fontFamily: 'var(--font-mono)' }}>LIVE SPOT</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>₹{schemes?.goldSpot24K?.pricePer10GramInr?.toLocaleString()} per 10 Grams • Source: MCX / IBJA</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className="font-display tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: '#FFD700' }}>
                            ₹{schemes?.goldSpot24K?.pricePerGramInr?.toLocaleString()} / gm
                          </div>
                          <div style={{ fontSize: '10.5px', color: schemes?.goldSpot24K?.changePercent >= 0 ? '#00FF87' : '#F43F5E', fontFamily: 'var(--font-mono)' }}>
                            {schemes?.goldSpot24K?.changePercent >= 0 ? '+' : ''}{schemes?.goldSpot24K?.changePercent}% 24h
                          </div>
                        </div>
                      </div>

                      {/* Guaranteed Coupon */}
                      <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>Guaranteed Annual Coupon</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>2.50% paid semi-annually directly to bank account</div>
                        </div>
                        <div className="font-display tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: '#FFD700' }}>
                          2.50% p.a.
                        </div>
                      </div>

                      {/* Maturity & Tax Exemption */}
                      <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>Tenor & Tax Exemption</div>
                          <div style={{ fontSize: '11px', color: '#94A3B8' }}>8 Years (Exit available at Y5, Y6, Y7) • 100% Tax Exempt (Sec 47(viic))</div>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#00FF87' }}>
                          RBI Guaranteed
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. Top Verified Bank Fixed Deposits */}
            {(radarFilter === 'all' || radarFilter === 'fds') && (
              <div className="glass-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Percent size={18} color="#00FF87" />
                    <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                      Top Verified Bank Fixed Deposits (Accurate Tenures)
                    </h3>
                  </div>
                  <span style={{ fontSize: '11px', color: '#00FF87', fontFamily: 'var(--font-mono)', background: 'rgba(0, 255, 135, 0.1)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(0, 255, 135, 0.25)' }}>
                    DICGC Insured up to ₹5 Lakhs per Depositor
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                  {schemes?.bankFixedDeposits?.map((fd) => (
                    <div
                      key={fd.bank}
                      className="glass-card-interactive"
                      style={{
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => openCalculator(fd.bank, fd.maxRatePercent, 3, 'quarterly')}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                          <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#F8FAFC' }}>{fd.bank}</div>
                          <span style={{ fontSize: '9.5px', color: '#94A3B8', fontFamily: 'var(--font-mono)', padding: '1px 5px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.06)' }}>
                            {fd.category?.split(' ')[0]}
                          </span>
                        </div>

                        {/* ACCURATE TENURE DISPLAY (FIXED GLITCH) */}
                        <div style={{ fontSize: '11.5px', color: '#00F0FF', fontWeight: 700, marginBottom: '10px' }}>
                          {fd.tenureFormatted || fd.tenure}
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>Regular / Senior Citizen</span>
                          <span className="font-display tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: '#00FF87' }}>
                            {fd.maxRatePercent}% / {fd.seniorCitizenRate}%
                          </span>
                        </div>

                        <button
                          type="button"
                          className="btn-glass-secondary"
                          style={{ width: '100%', height: '28px', fontSize: '11px', color: '#00FF87', borderColor: 'rgba(0, 255, 135, 0.3)' }}
                        >
                          Calculate FD Returns
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Government Small Savings Schemes (MoF Notified) */}
            {(radarFilter === 'all' || radarFilter === 'small_savings') && (
              <div className="glass-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Landmark size={18} color="#FFD700" />
                    <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                      Ministry of Finance (MoF) Small Savings Schemes
                    </h3>
                  </div>
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>Quarterly Gazette Notified Rates</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
                  {schemes?.governmentSchemes?.map((sch) => (
                    <div
                      key={sch.name}
                      className="glass-card-interactive"
                      style={{
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                      onClick={() => openCalculator(sch.name, sch.ratePercent, sch.lockInYears || 5, sch.frequency?.toLowerCase().includes('annual') ? 'annual' : 'quarterly')}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                          <div style={{ fontSize: '13px', fontWeight: 800, color: '#F8FAFC' }}>{sch.name}</div>
                          {sch.taxDeduction80C && (
                            <span style={{ fontSize: '9px', fontWeight: 800, padding: '1px 5px', borderRadius: '4px', background: 'rgba(0, 255, 135, 0.15)', color: '#00FF87', border: '1px solid rgba(0, 255, 135, 0.3)', fontFamily: 'var(--font-mono)' }}>
                              80C TAX SAVER
                            </span>
                          )}
                        </div>

                        <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '8px' }}>
                          {sch.frequency} • {sch.lockInYears} Years Lock-in
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#94A3B8' }}>Interest Rate</span>
                          <span className="font-display tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: '#FFD700' }}>
                            {sch.ratePercent}% p.a.
                          </span>
                        </div>

                        <button
                          type="button"
                          className="btn-glass-secondary"
                          style={{ width: '100%', height: '28px', fontSize: '11px', color: '#FFD700', borderColor: 'rgba(255, 215, 0, 0.3)' }}
                        >
                          Calculate Scheme Growth
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
        {/* TAB 2: DCF QUANTITATIVE VALUATION */}
        {/* ========================================================================= */}
        {activeTab === 'dcf' && (
          <motion.div
            key="dcf"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}
          >
            {/* Input Parameter Form Panel */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 className="heading-md" style={{ margin: '0 0 16px 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator size={18} color="#00FF87" />
                2-Stage DCF Valuation Inputs
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label className="body-sm" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                    Current Free Cash Flow (₹ Cr / Millions)
                  </label>
                  <input
                    type="number"
                    value={dcfInput.currentFCF}
                    onChange={(e) => setDcfInput({ ...dcfInput, currentFCF: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Stage 1 Growth (Yr 1-5 %)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={Math.round(dcfInput.growthRateStage1 * 100)}
                      onChange={(e) => setDcfInput({ ...dcfInput, growthRateStage1: Number(e.target.value) / 100 })}
                      style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Stage 2 Growth (Yr 6-10 %)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={Math.round(dcfInput.growthRateStage2 * 100)}
                      onChange={(e) => setDcfInput({ ...dcfInput, growthRateStage2: Number(e.target.value) / 100 })}
                      style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>WACC Discount Rate (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={Math.round(dcfInput.discountRateWACC * 100)}
                      onChange={(e) => setDcfInput({ ...dcfInput, discountRateWACC: Number(e.target.value) / 100 })}
                      style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Current Market Price (₹)</label>
                    <input
                      type="number"
                      value={dcfInput.currentPrice}
                      onChange={(e) => setDcfInput({ ...dcfInput, currentPrice: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={runDcfCalculation}
                  className="btn-primary-mint"
                  style={{ width: '100%', marginTop: '8px' }}
                >
                  Calculate Intrinsic Fair Value
                </button>
              </div>
            </div>

            {/* DCF Output Scorecard */}
            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {dcfResult ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div>
                      <span className="body-sm" style={{ color: '#94A3B8' }}>Intrinsic Fair Value Per Share</span>
                      <div className="display-xl font-display tabular-nums" style={{ color: '#00FF87', margin: '2px 0 0 0' }}>
                        ₹{dcfResult.fairValuePerShare}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span className="body-sm" style={{ color: '#94A3B8' }}>Margin of Safety</span>
                      <div className="heading-xl font-mono tabular-nums" style={{ color: dcfResult.isUndervalued ? '#00FF87' : '#F43F5E', margin: '2px 0 0 0' }}>
                        {dcfResult.marginOfSafetyPercent > 0 ? '+' : ''}{dcfResult.marginOfSafetyPercent}%
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      background: dcfResult.isUndervalued ? 'rgba(0, 255, 135, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                      border: dcfResult.isUndervalued ? '1px solid rgba(0, 255, 135, 0.3)' : '1px solid rgba(244, 63, 94, 0.3)',
                      color: dcfResult.isUndervalued ? '#00FF87' : '#F43F5E',
                      fontSize: '12.5px',
                      marginBottom: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    {dcfResult.isUndervalued ? <CheckCircle2 size={20} color="#00FF87" /> : <XCircle size={20} color="#F43F5E" />}
                    <div>
                      <strong style={{ display: 'block' }}>{dcfResult.isUndervalued ? 'Undervalued Discount' : 'Trading at Premium'}</strong>
                      <span style={{ fontSize: '11.5px', color: '#E2E8F0' }}>
                        {dcfResult.isUndervalued
                          ? `Asset is trading at a ${Math.abs(dcfResult.marginOfSafetyPercent)}% discount to projected discounted cash flow value.`
                          : `Current market price (₹${dcfResult.currentPrice}) exceeds estimated DCF value (₹${dcfResult.fairValuePerShare}).`}
                      </span>
                    </div>
                  </div>

                  <h4 className="heading-md" style={{ margin: '0 0 10px 0', color: '#F8FAFC' }}>Projected 5-Year Cash Flows</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {dcfResult.fcfProjection?.slice(0, 5).map((row) => (
                      <div
                        key={row.year}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          fontSize: '12px',
                        }}
                      >
                        <span style={{ color: '#94A3B8' }}>Year {row.year} (Growth: {(row.growthRate * 100).toFixed(0)}%)</span>
                        <span className="font-mono tabular-nums" style={{ color: '#00FF87', fontWeight: 700 }}>₹{row.presentValue} PV</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>Run DCF calculation to view intrinsic valuation scorecard.</div>
              )}
            </div>
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
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}
          >
            {/* Scam Input Form */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 className="heading-md" style={{ margin: '0 0 16px 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} color="#F43F5E" />
                Algorithmic Scam & Ponzi Shield
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Scheme / App Name</label>
                  <input
                    type="text"
                    value={scamInput.schemeName}
                    onChange={(e) => setScamInput({ ...scamInput, schemeName: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Promised Return (%)</label>
                    <input
                      type="number"
                      value={scamInput.promisedReturnPercent}
                      onChange={(e) => setScamInput({ ...scamInput, promisedReturnPercent: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Payout Frequency</label>
                    <select
                      value={scamInput.returnFrequency}
                      onChange={(e) => setScamInput({ ...scamInput, returnFrequency: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', background: 'rgba(10, 14, 24, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                    >
                      <option value="daily">Daily (High Risk)</option>
                      <option value="monthly">Monthly</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ fontSize: '12.5px', color: '#E2E8F0' }}>Multi-Tier MLM Referral Bonus?</span>
                  <input
                    type="checkbox"
                    checked={scamInput.hasReferralCommission}
                    onChange={(e) => setScamInput({ ...scamInput, hasReferralCommission: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#F43F5E' }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <span style={{ fontSize: '12.5px', color: '#E2E8F0' }}>SEBI / RBI Registered Entity?</span>
                  <input
                    type="checkbox"
                    checked={scamInput.isRegulatedBySebiOrRbi}
                    onChange={(e) => setScamInput({ ...scamInput, isRegulatedBySebiOrRbi: e.target.checked })}
                    style={{ width: '16px', height: '16px', accentColor: '#00FF87' }}
                  />
                </div>

                <button
                  type="button"
                  onClick={runScamAudit}
                  disabled={evaluatingScam}
                  className="btn-primary-mint"
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  {evaluatingScam ? 'Auditing Mechanism...' : 'Run Fraud Audit'}
                </button>
              </div>
            </div>

            {/* Scam Result Scorecard */}
            <div className="glass-card" style={{ padding: '24px' }}>
              {scamResult ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div>
                      <span className="body-sm" style={{ color: '#94A3B8' }}>Ponzi Risk Score</span>
                      <div className="display-xl font-display tabular-nums" style={{ color: scamResult.riskScore > 50 ? '#F43F5E' : '#00FF87', margin: '2px 0 0 0' }}>
                        {scamResult.riskScore} / 100
                      </div>
                    </div>

                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 800,
                        fontFamily: 'var(--font-mono)',
                        background: scamResult.riskScore > 50 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(0, 255, 135, 0.15)',
                        color: scamResult.riskScore > 50 ? '#F43F5E' : '#00FF87',
                        border: `1px solid ${scamResult.riskScore > 50 ? 'rgba(244, 63, 94, 0.3)' : 'rgba(0, 255, 135, 0.3)'}`,
                      }}
                    >
                      {scamResult.riskLevel}
                    </span>
                  </div>

                  <h4 className="heading-md" style={{ margin: '0 0 10px 0', color: '#F8FAFC' }}>Red Flag Analysis</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {scamResult.flags?.map((flag, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '10px',
                          background: 'rgba(244, 63, 94, 0.06)',
                          border: '1px solid rgba(244, 63, 94, 0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '12px',
                          color: '#FECDD3',
                        }}
                      >
                        <AlertTriangle size={15} color="#F43F5E" />
                        <span>{flag}</span>
                      </div>
                    ))}
                    {scamResult.flags?.length === 0 && (
                      <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0, 255, 135, 0.06)', border: '1px solid rgba(0, 255, 135, 0.2)', color: '#00FF87', fontSize: '12px' }}>
                        No acute Ponzi anomalies detected. Verify official SEBI registry before deposit.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>Audit in progress...</div>
              )}
            </div>
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
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '18px' }}
          >
            {/* Input Arbitrage Parameters */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 className="heading-md" style={{ margin: '0 0 16px 0', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Scale size={18} color="#00F0FF" />
                Arbitrage Solver Parameters
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Surplus Monthly Cash (₹)</label>
                  <input
                    type="number"
                    value={arbitrageInput.surplusMonthlyCash}
                    onChange={(e) => setArbitrageInput({ ...arbitrageInput, surplusMonthlyCash: Number(e.target.value) })}
                    style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Debt Balance (₹)</label>
                    <input
                      type="number"
                      value={arbitrageInput.debtBalance}
                      onChange={(e) => setArbitrageInput({ ...arbitrageInput, debtBalance: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Debt Interest Rate (%)</label>
                    <input
                      type="number"
                      value={arbitrageInput.debtInterestRatePercent}
                      onChange={(e) => setArbitrageInput({ ...arbitrageInput, debtInterestRatePercent: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Expected Equity Return (%)</label>
                    <input
                      type="number"
                      value={arbitrageInput.expectedEquityReturnPercent}
                      onChange={(e) => setArbitrageInput({ ...arbitrageInput, expectedEquityReturnPercent: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                    />
                  </div>
                  <div>
                    <label className="body-xs" style={{ color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Capital Gains Tax (%)</label>
                    <input
                      type="number"
                      value={arbitrageInput.capitalGainsTaxRatePercent}
                      onChange={(e) => setArbitrageInput({ ...arbitrageInput, capitalGainsTaxRatePercent: Number(e.target.value) })}
                      style={{ width: '100%', padding: '8px 12px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '10px', color: '#FFFFFF', fontSize: '13px' }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={runArbitrageSolver}
                  className="btn-primary-mint"
                  style={{ width: '100%', marginTop: '6px' }}
                >
                  Solve Cash Flow Allocation
                </button>
              </div>
            </div>

            {/* Arbitrage Recommendation Output */}
            <div className="glass-card" style={{ padding: '24px' }}>
              {arbitrageResult ? (
                <div>
                  <div style={{ marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <span className="body-sm" style={{ color: '#94A3B8' }}>Optimal Mathematical Strategy</span>
                    <div className="heading-xl font-display" style={{ color: '#00FF87', margin: '4px 0 0 0' }}>
                      {arbitrageResult.recommendation}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>Debt Guaranteed Cost</span>
                      <div className="font-display tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: '#F43F5E' }}>
                        {arbitrageInput.debtInterestRatePercent}% p.a.
                      </div>
                    </div>

                    <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>Post-Tax Equity Hurdle</span>
                      <div className="font-display tabular-nums" style={{ fontSize: '16px', fontWeight: 800, color: '#00FF87' }}>
                        {(arbitrageInput.expectedEquityReturnPercent * (1 - arbitrageInput.capitalGainsTaxRatePercent / 100)).toFixed(2)}% p.a.
                      </div>
                    </div>
                  </div>

                  <p className="body-sm" style={{ color: '#94A3B8', lineHeight: 1.5, margin: 0 }}>
                    {arbitrageResult.rationale}
                  </p>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748B' }}>Solving arbitrage equation...</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* 5. INTERACTIVE YIELD & FD MATURITY CALCULATOR MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {calcModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)', padding: '16px' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="glass-card"
              style={{
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                border: '1px solid rgba(0, 255, 135, 0.3)',
                background: '#0B0F19',
                borderRadius: '24px',
                padding: '24px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
              }}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calculator size={20} color="#00FF87" />
                  <div>
                    <h3 className="heading-lg" style={{ margin: 0, color: '#F8FAFC' }}>
                      Yield & Fixed Deposit Maturity Calculator
                    </h3>
                    <div style={{ fontSize: '11px', color: '#00FF87', fontFamily: 'var(--font-mono)' }}>
                      {calcInput.schemeName}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCalcModalOpen(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Grid of Inputs & Results */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                {/* Inputs Left Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Deposit Amount Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#94A3B8' }}>Deposit Principal (₹)</span>
                      <span className="font-mono" style={{ color: '#F8FAFC', fontWeight: 700 }}>₹{calcInput.principal?.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={10000}
                      max={5000000}
                      step={10000}
                      value={calcInput.principal}
                      onChange={(e) => setCalcInput({ ...calcInput, principal: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: '#00FF87' }}
                    />
                  </div>

                  {/* Annual Interest Rate Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#94A3B8' }}>Annual Interest Rate (%)</span>
                      <span className="font-mono" style={{ color: '#00FF87', fontWeight: 800 }}>{calcInput.annualRatePercent}% p.a.</span>
                    </div>
                    <input
                      type="range"
                      min={4.0}
                      max={12.0}
                      step={0.05}
                      value={calcInput.annualRatePercent}
                      onChange={(e) => setCalcInput({ ...calcInput, annualRatePercent: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: '#00FF87' }}
                    />
                  </div>

                  {/* Tenor Years Slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                      <span style={{ color: '#94A3B8' }}>Investment Tenor (Years)</span>
                      <span className="font-mono" style={{ color: '#F8FAFC', fontWeight: 700 }}>{calcInput.tenorYears} Years</span>
                    </div>
                    <input
                      type="range"
                      min={0.25}
                      max={10.0}
                      step={0.25}
                      value={calcInput.tenorYears}
                      onChange={(e) => setCalcInput({ ...calcInput, tenorYears: Number(e.target.value) })}
                      style={{ width: '100%', accentColor: '#00F0FF' }}
                    />
                  </div>

                  {/* Compounding Frequency Selector */}
                  <div>
                    <label style={{ fontSize: '11px', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>Compounding Frequency</label>
                    <select
                      value={calcInput.compounding}
                      onChange={(e) => setCalcInput({ ...calcInput, compounding: e.target.value })}
                      style={{ width: '100%', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '8px', color: '#FFFFFF', fontSize: '12px' }}
                    >
                      <option value="quarterly">Quarterly Compounded (Standard Bank FD)</option>
                      <option value="annual">Annual Compounded (PPF / NSC)</option>
                      <option value="monthly">Monthly Payout (POMIS / Senior Citizen)</option>
                      <option value="simple">Simple Discount Yield (RBI T-Bills)</option>
                    </select>
                  </div>

                  {/* Senior Citizen Bonus Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#F8FAFC', fontWeight: 700 }}>Senior Citizen Rate (+0.50%)</div>
                      <div style={{ fontSize: '10px', color: '#94A3B8' }}>Applies extra 50 bps bonus for depositors age 60+</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={calcInput.isSeniorCitizen}
                      onChange={(e) => setCalcInput({ ...calcInput, isSeniorCitizen: e.target.checked })}
                      style={{ width: '16px', height: '16px', accentColor: '#00FF87', cursor: 'pointer' }}
                    />
                  </div>
                </div>

                {/* Scorecard Results Right Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '18px', borderRadius: '16px', background: 'rgba(0, 255, 135, 0.03)', border: '1px solid rgba(0, 255, 135, 0.2)' }}>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Maturity Corpus</span>
                    <div className="font-display tabular-nums" style={{ fontSize: '28px', fontWeight: 900, color: '#00FF87', margin: '2px 0 10px 0' }}>
                      ₹{computedMaturity.maturityAmount?.toLocaleString()}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingBottom: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <span style={{ color: '#94A3B8' }}>Total Interest Earned</span>
                        <span className="font-mono tabular-nums" style={{ color: '#00FF87', fontWeight: 700 }}>+₹{computedMaturity.totalInterest?.toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingBottom: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <span style={{ color: '#94A3B8' }}>Effective Annual Yield (APY)</span>
                        <span className="font-mono tabular-nums" style={{ color: '#FFD700', fontWeight: 700 }}>{computedMaturity.effectiveApy}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', paddingBottom: '6px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        <span style={{ color: '#94A3B8' }}>Quarterly Passive Income</span>
                        <span className="font-mono tabular-nums" style={{ color: '#00F0FF', fontWeight: 700 }}>₹{computedMaturity.quarterlyPayout?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ paddingTop: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#94A3B8', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Principal ({Math.round((computedMaturity.principal / (computedMaturity.maturityAmount || 1)) * 100)}%)</span>
                      <span style={{ color: '#00FF87' }}>Interest ({Math.round((computedMaturity.totalInterest / (computedMaturity.maturityAmount || 1)) * 100)}%)</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.1)', overflow: 'hidden', display: 'flex' }}>
                      <div style={{ width: `${(computedMaturity.principal / (computedMaturity.maturityAmount || 1)) * 100}%`, background: '#64748B' }} />
                      <div style={{ width: `${(computedMaturity.totalInterest / (computedMaturity.maturityAmount || 1)) * 100}%`, background: 'linear-gradient(90deg, #00FF87, #00F0FF)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <button
                  type="button"
                  onClick={() => setCalcModalOpen(false)}
                  className="btn-primary-mint"
                  style={{ height: '36px', padding: '0 20px', fontSize: '12px' }}
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PassiveIncomePage;
