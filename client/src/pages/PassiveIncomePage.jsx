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
} from 'lucide-react';
import { apiFetch } from '../api/client';

export const PassiveIncomePage = () => {
  const [quotes, setQuotes] = useState([]);
  const [schemes, setSchemes] = useState(null);
  const [activeTab, setActiveTab] = useState('radar'); // 'radar', 'dcf', 'scam', 'arbitrage'
  const [loading, setLoading] = useState(true);

  // Scam Shield State
  const [scamInput, setScamInput] = useState({
    schemeName: '',
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
    // Run initial DCF and Arbitrage calculations
    runDcfCalculation();
    runArbitrageSolver();

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
    <div className="space-y-6 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            Stock Market & Passive Wealth Studio
            <span className="text-xs font-mono uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Quantitative AI
            </span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time market feeds, verified sovereign bond yields, DCF fair valuations, and algorithmic scam protection.
          </p>
        </div>

        {/* Studio Navigation Pills */}
        <div className="flex flex-wrap gap-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 backdrop-blur-xl">
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Live Market Watch Ticker */}
      <div className="overflow-x-auto no-scrollbar py-1">
        <div className="flex gap-3 min-w-max">
          {quotes.map((q) => {
            const isPositive = q.change >= 0;
            return (
              <div
                key={q.symbol}
                className="bg-slate-900/80 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl px-4 py-2.5 backdrop-blur-xl transition-all shadow-md flex items-center gap-3"
              >
                <div>
                  <div className="text-xs font-bold text-white">{q.symbol}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[110px]">{q.name}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold font-mono text-white">
                    {q.currency}{q.price.toLocaleString()}
                  </div>
                  <div className={`text-[10px] font-mono font-semibold flex items-center justify-end gap-0.5 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {isPositive ? '+' : ''}{q.changePercent}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Studio Main Views */}
      <AnimatePresence mode="wait">
        {/* TAB 1: SOVEREIGN SCHEME RADAR */}
        {activeTab === 'radar' && (
          <motion.div
            key="radar"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* T-Bills & SGBs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* RBI Treasury Bills */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-cyan-400" />
                    RBI Sovereign Treasury Bills (T-Bills)
                  </h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    Zero Credit Risk
                  </span>
                </div>

                <div className="space-y-3">
                  {schemes?.treasuryBills?.map((tb) => (
                    <div key={tb.tenor} className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                      <div>
                        <div className="text-xs font-bold text-white">{tb.tenor}</div>
                        <div className="text-[11px] text-slate-400">{tb.issuer} • Min ₹{tb.minimumAmount.toLocaleString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold font-mono text-cyan-400">{tb.yieldPercent}% p.a.</div>
                        <div className="text-[10px] text-slate-500">Maturity Discount Yield</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sovereign Gold Bonds (SGB) */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-400" />
                    Sovereign Gold Bonds (SGB)
                  </h3>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                    0% Capital Gains Tax
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Guaranteed Annual Coupon</div>
                      <div className="text-[11px] text-slate-400">Paid semi-annually directly to bank account</div>
                    </div>
                    <div className="text-sm font-bold font-mono text-amber-400">2.50% p.a.</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Gold Price Appreciation</div>
                      <div className="text-[11px] text-slate-400">Historical benchmark indexation</div>
                    </div>
                    <div className="text-sm font-bold font-mono text-emerald-400">~11.2% CAGR</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">Maturity & Liquidity</div>
                      <div className="text-[11px] text-slate-400">8 Years Tenor (Early exit available after 5 years)</div>
                    </div>
                    <div className="text-xs font-bold text-slate-300">RBI Regulated</div>
                  </div>
                </div>
              </div>
            </div>

            {/* High-Yield Bank Fixed Deposits */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-400" />
                  Top Verified Bank Fixed Deposits & Govt Schemes
                </h3>
                <span className="text-[10px] font-mono text-slate-400">DICGC Insured up to ₹5 Lakhs</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {schemes?.bankFixedDeposits?.map((fd) => (
                  <div key={fd.bank} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all">
                    <div className="text-xs font-bold text-white truncate">{fd.bank}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{fd.tenureMonths} Months Tenure</div>
                    <div className="mt-2 flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Regular / Sr. Citizen</span>
                      <span className="text-sm font-bold font-mono text-emerald-400">
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Input Parameters Panel */}
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Calculator className="w-4 h-4 text-emerald-400" />
                DCF Model Parameters
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Current Free Cash Flow (₹ Cr / M)</label>
                  <input
                    type="number"
                    value={dcfInput.currentFCF}
                    onChange={(e) => setDcfInput({ ...dcfInput, currentFCF: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Yr 1-5 Growth (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={dcfInput.growthRateStage1 * 100}
                      onChange={(e) => setDcfInput({ ...dcfInput, growthRateStage1: Number(e.target.value) / 100 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Yr 6-10 Growth (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={dcfInput.growthRateStage2 * 100}
                      onChange={(e) => setDcfInput({ ...dcfInput, growthRateStage2: Number(e.target.value) / 100 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">WACC Discount (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={dcfInput.discountRateWACC * 100}
                      onChange={(e) => setDcfInput({ ...dcfInput, discountRateWACC: Number(e.target.value) / 100 })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">Current Price (₹)</label>
                    <input
                      type="number"
                      value={dcfInput.currentPrice}
                      onChange={(e) => setDcfInput({ ...dcfInput, currentPrice: Number(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={runDcfCalculation}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  Calculate Intrinsic Fair Value
                </button>
              </div>
            </div>

            {/* DCF Output Scorecard */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              {dcfResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <div className="text-xs text-slate-400">Intrinsic Fair Value Per Share</div>
                      <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-0.5">
                        ₹{dcfResult.fairValuePerShare}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">Margin of Safety</div>
                      <div className={`text-lg font-bold font-mono ${dcfResult.isUndervalued ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {dcfResult.marginOfSafetyPercent > 0 ? '+' : ''}{dcfResult.marginOfSafetyPercent}%
                      </div>
                    </div>
                  </div>

                  {/* Valuation Verdict Banner */}
                  <div className={`p-3.5 rounded-xl border text-xs flex items-center gap-3 ${
                    dcfResult.isUndervalued
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                  }`}>
                    {dcfResult.isUndervalued ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                    <div>
                      <span className="font-bold block">
                        {dcfResult.isUndervalued ? 'Undervalued Discount' : 'Trading at Valuation Premium'}
                      </span>
                      <span className="text-[11px] opacity-90">
                        {dcfResult.isUndervalued
                          ? `Asset is trading at a ${Math.abs(dcfResult.marginOfSafetyPercent)}% discount to projected 10-year discounted cash flow fair value.`
                          : `Current market price (₹${dcfResult.currentPrice}) exceeds estimated discounted cash flow value (₹${dcfResult.fairValuePerShare}).`}
                      </span>
                    </div>
                  </div>

                  {/* Projection Table Preview */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-800">
                          <th className="pb-2">Year</th>
                          <th className="pb-2">Growth</th>
                          <th className="pb-2">Projected FCF</th>
                          <th className="pb-2 text-right">Discounted PV</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {dcfResult.fcfProjection?.slice(0, 5).map((row) => (
                          <tr key={row.year} className="text-slate-300">
                            <td className="py-1.5">Yr {row.year}</td>
                            <td className="py-1.5">{(row.growthRate * 100).toFixed(0)}%</td>
                            <td className="py-1.5">₹{row.projectedFCF}</td>
                            <td className="py-1.5 text-right text-emerald-400">₹{row.presentValue}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">Run DCF calculation to view breakdown.</div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: AUTOMATED SCAM & PONZI SHIELD */}
        {activeTab === 'scam' && (
          <motion.div
            key="scam"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Input Inspection Form */}
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-3.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                Scheme Scam Auditor
              </h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Scheme / App Name</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Forex Double Bot"
                  value={scamInput.schemeName}
                  onChange={(e) => setScamInput({ ...scamInput, schemeName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Promised Return (%)</label>
                  <input
                    type="number"
                    value={scamInput.promisedReturnPercent}
                    onChange={(e) => setScamInput({ ...scamInput, promisedReturnPercent: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Frequency</label>
                  <select
                    value={scamInput.returnFrequency}
                    onChange={(e) => setScamInput({ ...scamInput, returnFrequency: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="annual">Annual</option>
                    <option value="monthly">Monthly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scamInput.hasReferralCommission}
                    onChange={(e) => setScamInput({ ...scamInput, hasReferralCommission: e.target.checked })}
                    className="accent-rose-500 rounded"
                  />
                  Has Multi-Level Referral Commissions
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scamInput.isRegulatedBySebiOrRbi}
                    onChange={(e) => setScamInput({ ...scamInput, isRegulatedBySebiOrRbi: e.target.checked })}
                    className="accent-emerald-500 rounded"
                  />
                  Regulated by SEBI / RBI / SEC
                </label>
              </div>

              <button
                type="button"
                onClick={runScamAudit}
                disabled={evaluatingScam}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-rose-500/20 cursor-pointer"
              >
                {evaluatingScam ? 'Analyzing Fraud Vectors...' : 'Audit Scheme Fraud Risk'}
              </button>
            </div>

            {/* Scam Results Panel */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              {scamResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div>
                      <h4 className="text-base font-bold text-white">{scamResult.schemeName}</h4>
                      <div className="text-xs text-slate-400">
                        Annualized Promised Yield: <span className="font-mono text-white font-bold">{scamResult.annualizedPromisedYield}%</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-bold font-mono px-3 py-1 rounded-full border ${
                        scamResult.riskScore >= 70
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                          : scamResult.riskScore >= 40
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      }`}>
                        Fraud Risk: {scamResult.riskScore}/100
                      </span>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-200">
                    <span className="font-bold block text-white mb-1">Shield Verdict:</span>
                    {scamResult.recommendation}
                  </div>

                  {/* Red Flags List */}
                  <div className="space-y-2">
                    {scamResult.redFlags?.map((flag, idx) => (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                          flag.severity === 'CRITICAL'
                            ? 'bg-rose-950/30 border-rose-500/30 text-rose-200'
                            : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
                        }`}
                      >
                        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                        <div>
                          <span className="font-bold block">{flag.code.replace(/_/g, ' ')}</span>
                          <span className="text-[11px] opacity-90">{flag.message}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">Enter scheme details on the left and click Audit.</div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 4: DEBT VS INVEST ARBITRAGE SOLVER */}
        {activeTab === 'arbitrage' && (
          <motion.div
            key="arbitrage"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Input Controls */}
            <div className="lg:col-span-1 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-3.5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Scale className="w-4 h-4 text-cyan-400" />
                Arbitrage Variables
              </h3>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Surplus Monthly Cash (₹)</label>
                <input
                  type="number"
                  value={arbitrageInput.surplusMonthlyCash}
                  onChange={(e) => setArbitrageInput({ ...arbitrageInput, surplusMonthlyCash: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Debt Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step="0.1"
                  value={arbitrageInput.debtInterestRatePercent}
                  onChange={(e) => setArbitrageInput({ ...arbitrageInput, debtInterestRatePercent: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Expected Equity CAGR (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={arbitrageInput.expectedEquityReturnPercent}
                  onChange={(e) => setArbitrageInput({ ...arbitrageInput, expectedEquityReturnPercent: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <button
                type="button"
                onClick={runArbitrageSolver}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Solve Optimal Allocation
              </button>
            </div>

            {/* Arbitrage Solution Output */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl flex flex-col justify-between">
              {arbitrageResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 border-b border-slate-800 pb-3">
                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-xs text-slate-400">Monthly to Debt Payoff</div>
                      <div className="text-lg font-bold font-mono text-rose-400 mt-0.5">
                        ₹{arbitrageResult.monthlyToDebt?.toLocaleString()} ({arbitrageResult.debtPrepayAllocationPercent}%)
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                      <div className="text-xs text-slate-400">Monthly to Wealth Investments</div>
                      <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                        ₹{arbitrageResult.monthlyToInvest?.toLocaleString()} ({arbitrageResult.investmentAllocationPercent}%)
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30 text-xs text-cyan-200 leading-relaxed">
                    <span className="font-bold block text-white mb-1">Mathematical Rationale:</span>
                    {arbitrageResult.rationale}
                  </div>

                  <div className="text-xs text-slate-400">
                    Estimated Time to Zero Debt: <span className="font-bold text-white">{arbitrageResult.estimatedMonthsToDebtFree} Months</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500">Run solver to view optimal allocation.</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PassiveIncomePage;
