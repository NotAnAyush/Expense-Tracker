import React, { useState, useEffect } from 'react';
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
  ChevronRight
} from 'lucide-react';
import { apiFetch } from '../api/client';

export const PassiveIncomePage = () => {
  const [quotes, setQuotes] = useState([]);
  const [schemes, setSchemes] = useState(null);
  const [activeTab, setActiveTab] = useState('radar'); // 'radar', 'dcf', 'scam', 'arbitrage'
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    let isMounted = true;
    const loadMarketData = async () => {
      try {
        const [quotesRes, schemesRes] = await Promise.all([
          apiFetch('/market/quotes').catch(() => ({ quotes: [] })),
          apiFetch('/market/schemes').catch(() => null),
        ]);

        if (isMounted) {
          setQuotes(quotesRes?.quotes || []);
          setSchemes(schemesRes);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    loadMarketData();
    runDcfCalculation();
    runArbitrageSolver();
    runScamAudit();

    return () => { isMounted = false; };
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', paddingBottom: '70px' }}>
      {/* 1. HERO HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
            <span className="animate-live-dot" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#00FF87', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              Institutional Terminal • Quantitative AI
            </span>
          </div>
          <h1 className="display-xl" style={{ margin: 0 }}>
            Stock Market & Passive Wealth Studio
          </h1>
          <p className="body-sm" style={{ margin: '4px 0 0 0', color: '#94A3B8' }}>
            Real-time market feeds, verified sovereign bond yields, DCF intrinsic valuations, and algorithmic scam protection.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'radar', label: 'Scheme Radar', icon: Award },
            { id: 'dcf', label: 'DCF Valuation', icon: Calculator },
            { id: 'scam', label: 'Scam Shield', icon: ShieldCheck },
            { id: 'arbitrage', label: 'Debt vs Invest', icon: Scale },
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
      </div>

      {/* 2. LIVE MARKET WATCH TICKER RIBBON */}
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
                  background: 'rgba(13, 17, 28, 0.8)',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#F8FAFC' }}>{q.symbol}</div>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {q.name}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="font-display tabular-nums" style={{ fontSize: '13px', fontWeight: 800, color: '#F8FAFC' }}>
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

      {/* 3. STUDIO VIEWS */}
      <AnimatePresence mode="wait">
        {/* TAB 1: SOVEREIGN SCHEME RADAR */}
        {activeTab === 'radar' && (
          <motion.div
            key="radar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
          >
            {/* T-Bills & SGBs 2-Column Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
              {/* RBI Treasury Bills */}
              <div className="glass-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building size={18} color="#00F0FF" />
                    <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                      RBI Sovereign Treasury Bills (T-Bills)
                    </h3>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '999px', background: 'rgba(0, 240, 255, 0.12)', color: '#00F0FF', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
                    Zero Credit Risk
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {schemes?.treasuryBills?.map((tb) => (
                    <div
                      key={tb.tenor}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>{tb.tenor}</div>
                        <div style={{ fontSize: '11px', color: '#94A3B8' }}>{tb.issuer} • Min ₹{tb.minimumAmount?.toLocaleString()}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="font-display tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: '#00F0FF' }}>
                          {tb.yieldPercent}% p.a.
                        </div>
                        <div style={{ fontSize: '10px', color: '#64748B' }}>Maturity Discount Yield</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sovereign Gold Bonds (SGB) */}
              <div className="glass-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Coins size={18} color="#FFD700" />
                    <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                      Sovereign Gold Bonds (SGB)
                    </h3>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 800, fontFamily: 'var(--font-mono)', padding: '2px 8px', borderRadius: '999px', background: 'rgba(255, 215, 0, 0.12)', color: '#FFD700', border: '1px solid rgba(255, 215, 0, 0.3)' }}>
                    0% Capital Gains Tax
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>Guaranteed Annual Coupon</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>Paid semi-annually directly to bank account</div>
                    </div>
                    <div className="font-display tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: '#FFD700' }}>
                      2.50% p.a.
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>Gold Price Appreciation</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>Historical benchmark indexation</div>
                    </div>
                    <div className="font-display tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: '#00FF87' }}>
                      ~11.2% CAGR
                    </div>
                  </div>

                  <div style={{ padding: '12px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>Maturity & Liquidity</div>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>8 Years Tenor (Early exit available after 5 years)</div>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#00F0FF' }}>
                      RBI Guaranteed
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* High-Yield Bank Fixed Deposits & Post Office Schemes */}
            <div className="glass-card" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Percent size={18} color="#00FF87" />
                  <h3 className="heading-md" style={{ margin: 0, color: '#F8FAFC' }}>
                    Top Verified Bank Fixed Deposits & Small Savings Schemes
                  </h3>
                </div>
                <span style={{ fontSize: '11px', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>DICGC Insured up to ₹5 Lakhs</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {schemes?.bankFixedDeposits?.map((fd) => (
                  <div
                    key={fd.bank}
                    className="glass-card-interactive"
                    style={{
                      padding: '16px',
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC', marginBottom: '3px' }}>{fd.bank}</div>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '10px' }}>{fd.tenureMonths} Months Lock-in</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>Regular / Senior</span>
                      <span className="font-display tabular-nums" style={{ fontSize: '15px', fontWeight: 800, color: '#00FF87' }}>
                        {fd.maxRatePercent}% / {fd.seniorCitizenRate}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: DCF QUANTITATIVE VALUATION */}
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

        {/* TAB 3: SCAM & PONZI SHIELD */}
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

        {/* TAB 4: DEBT VS INVEST ARBITRAGE */}
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
    </div>
  );
};

export default PassiveIncomePage;
