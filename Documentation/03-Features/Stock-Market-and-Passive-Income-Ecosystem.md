# 📈 Stock Market, Verified Schemes & Passive Income Ecosystem

**Feature ID:** `FEAT-011`  
**Phase:** Phase 8  
**Status:** In Progress / Architecture  
**Tags:** `#stocks` `#bonds` `#passive-income` `#scam-shield` `#dcf`

---

## 1. Overview

The **Stock Market, Verified Schemes & Passive Income Ecosystem** provides institutional-level investment analytics, sovereign bond tracking, algorithmic scam protection, and debt vs. investment yield optimization.

---

## 2. Core Capabilities

### 1. Unified Broker Connector (`BrokerClient.js`)
- Interfaces with Zerodha Kite, Dhan, Alpaca, and Polygon.io.
- Provides fallback mock tick streams for testability and offline simulation.

### 2. Verified Sovereign Scheme Radar (`SchemeRadarService.js`)
- **RBI Treasury Bills**: 91-Day (6.85%), 182-Day (6.98%), 364-Day (7.04%).
- **Sovereign Gold Bonds (SGBs)**: 2.50% annual coupon + capital appreciation indexation.
- **Top Bank Fixed Deposits**: HDFC, ICICI, SBI, Kotak yield tables (6.75% – 7.40%).
- **Senior Citizen Savings Scheme (SCSS)**: 8.20% p.a.

### 3. Automated Scam & Ponzi Shield (`ScamShieldEngine.js`)
- Evaluates investment opportunities on 5 core risk vectors:
  1. Unrealistic guaranteed returns ($>18\%$ p.a.).
  2. Multi-level referral/affiliate commission structures.
  3. Lack of SEBI/RBI/SEC regulatory registration.
  4. Opaque crypto/forex arbitrage claims.
  5. High exit penalties or capital lock-ins.

### 4. Quantitative Valuation Suite (`QuantitativeEngine.js`)
- **Discounted Cash Flow (DCF)**: Calculates intrinsic fair value using multi-stage WACC discounting and terminal growth.
- **Piotroski F-Score**: 9-point fundamental financial health score (0–9).
- **Altman Z-Score**: Evaluates bankruptcy probability across Safe ($>2.99$), Grey ($1.81-2.99$), and Distress ($<1.81$) zones.

### 5. Debt vs. Investment Arbitrage Solver (`ArbitrageSolver.js`)
- Compares guaranteed post-tax debt savings against probability-weighted equity market returns.
- Recommends mathematically optimal surplus cash allocation.

---

## 3. Navigation & API Endpoints

- Client Route: `/#passive-income` or `/#investments`
- Server Endpoints:
  - `GET /api/market/quotes` — Live/simulated market prices.
  - `GET /api/market/schemes` — Sovereign T-Bills, SGBs, and Bank FD comparison.
  - `POST /api/market/scam-check` — Scam & Ponzi risk score analysis.
  - `POST /api/market/dcf-valuation` — Intrinsic DCF calculation.
  - `POST /api/market/arbitrage-solve` — Debt avalanche vs. equity hurdle solver.
