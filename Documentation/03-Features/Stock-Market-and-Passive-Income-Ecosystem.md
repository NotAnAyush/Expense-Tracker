# 📈 Stock Market, Verified Schemes & Passive Income Ecosystem

**Feature ID:** `FEAT-011`  
**Phase:** Phase 8  
**Status:** Completed / Production-Ready (v3.8.0)  
**Tags:** `#stocks` `#bonds` `#passive-income` `#scam-shield` `#dcf` `#live-market` `#sovereign-yields`

---

## 1. Overview

The **Stock Market, Verified Schemes & Passive Income Ecosystem** provides institutional-level investment analytics, real-time live market quotes, official sovereign bond tracking, algorithmic scam protection, dynamic compound interest calculation, and debt vs. investment yield optimization.

---

## 2. Core Capabilities

### 1. Live Multi-Asset Exchange Connector (`brokerClient.js`)
- Interfaces with live exchange market data feeds for major Indian (`^NSEI`, `^BSESN`, `RELIANCE.NS`, `TCS.NS`, `HDFCBANK.NS`, `INFY.NS`, `ICICIBANK.NS`, `SBIN.NS`, `GOLDBEES.NS`, `USDINR=X`) and US Equities (`AAPL`, `NVDA`, `MSFT`, `GOOGL`).
- Implemented high-performance 30-second in-memory TTL caching with parallel resolution and sub-second retrieval.
- Zero-downtime deterministic fallback baselines ensuring 100% offline test reliability.

### 2. Live Sovereign Yield & Fixed Income Radar (`schemeRadarService.js`)
- **Live 24K Gold Spot (999 Purity)**: Real-time price per gram (₹7,548/g) and per 10g (₹75,480) derived from live exchange gold ETF feeds (`GOLDBEES.NS`) with 24h delta.
- **Official Reserve Bank of India (RBI) / FBIL Treasury Bills & G-Secs**:
  - 91-Day T-Bill (6.85% p.a.)
  - 182-Day T-Bill (6.98% p.a.)
  - 364-Day T-Bill (7.04% p.a.)
  - 10-Year GoI Benchmark Bond (7.12% p.a.)
- **Sovereign Gold Bonds (SGBs)**: 2.50% p.a. guaranteed semi-annual coupon + 100% capital gains tax exemption under Sec 47(viic).
- **Ministry of Finance (MoF) Small Savings Schemes**:
  - Senior Citizen Savings Scheme (SCSS: 8.20% p.a., 80C)
  - Sukanya Samriddhi Yojana (SSY: 8.20% p.a., 80C EEE)
  - National Savings Certificate (NSC: 7.70% p.a., 80C)
  - Public Provident Fund (PPF: 7.10% p.a., 80C EEE)
  - Kisan Vikas Patra (KVP: 7.50% p.a.)
  - Post Office Monthly Income Scheme (POMIS: 7.40% p.a.)
  - Mahila Samman Savings Certificate (MSSC: 7.50% p.a.)
- **Verified Bank Fixed Deposits (Accurate Tenures)**:
  - Unity Small Finance Bank: 9.00% / 9.50% (1001 Days Special High-Yield)
  - Suryoday Small Finance Bank: 8.65% / 9.15% (732 Days)
  - Utkarsh Small Finance Bank: 8.50% / 9.10% (1000 Days)
  - State Bank of India: 7.10% / 7.60% (400 Days "Amrit Kalash")
  - HDFC Bank: 7.25% / 7.75% (55 Months)
  - ICICI Bank: 7.20% / 7.70% (390 Days)
  - DICGC ₹5 Lakh depositor protection badge.

### 3. Interactive Yield & FD Maturity Calculator (`calculateMaturity`)
- Calculates exact compound interest, APY, quarterly/monthly cash flows, and visual progress breakdowns.
- Parametric support for Quarterly, Monthly, Annual, and Simple Discount compounding.
- One-click senior citizen rate booster (+0.50%).

### 4. Automated Scam & Ponzi Shield (`scamShieldEngine.js`)
- Evaluates investment opportunities on 5 core risk vectors:
  1. Unrealistic guaranteed returns ($>18\%$ p.a.).
  2. Multi-level referral/affiliate commission structures.
  3. Lack of SEBI/RBI/SEC regulatory registration.
  4. Opaque crypto/forex arbitrage claims.
  5. High exit penalties or capital lock-ins.

### 5. Quantitative Valuation Suite (`quantitativeEngine.js`)
- **Discounted Cash Flow (DCF)**: Calculates intrinsic fair value using multi-stage WACC discounting and terminal growth.
- **Piotroski F-Score**: 9-point fundamental financial health score (0–9).
- **Altman Z-Score**: Evaluates bankruptcy probability across Safe ($>2.99$), Grey ($1.81-2.99$), and Distress ($<1.81$) zones.

### 6. Debt vs. Investment Arbitrage Solver (`arbitrageSolver.js`)
- Compares guaranteed post-tax debt savings against probability-weighted equity market returns.
- Recommends mathematically optimal surplus cash allocation.

---

## 3. Navigation & API Endpoints

- Client Route: `/#market`, `/#passive-income`, or `/#investments`
- Server Endpoints:
  - `GET /api/market/quotes` — Live real-time and cached market prices across NSE/BSE/US exchanges.
  - `GET /api/market/schemes` — Verified sovereign yields, 24K gold spot, and bank FD radar.
  - `POST /api/market/calculate-maturity` — Compound interest and maturity calculator.
  - `POST /api/market/scam-check` — Scam & Ponzi risk score analysis.
  - `POST /api/market/dcf-valuation` — Intrinsic DCF calculation.
  - `POST /api/market/arbitrage-solve` — Debt avalanche vs. equity hurdle solver.
