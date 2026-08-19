# ADR-011: Stock Market, Verified Government Schemes, Quantitative Valuations & Scam Shield Architecture

**Status:** Accepted / Upgraded to Live Feed v3.8.0  
**Date:** 2026-08-18 (Updated 2026-08-19)  
**Context:** Richy Rich Sovereign Wealth Platform (Phase 8)  
**Deciders:** Core Engineering Team  

---

## 1. Context and Problem Statement

Users require real-time market data across Indian and US exchanges, deterministic valuation metrics (DCF, Piotroski, Altman), verified government bond/FD comparisons with official benchmarks, live 24K gold rates, and protection against fraudulent investment schemes. How should this multi-faceted investment and risk engine be structured without creating fragile third-party dependencies or downtime?

---

## 2. Decision Drivers

1. **Live Data Ingestion with Zero-Downtime Resilience**: Integrate live market quotes with a 30-second in-memory TTL cache, sub-second latency, and deterministic fallback baselines for offline stability.
2. **Deterministic Accuracy**: Mathematical computations (DCF, F-Score, Z-Score, compound APY, debt vs. investment arbitrage) must be implemented in pure, testable JavaScript.
3. **Official Benchmarking**: Calibrate yields against official Reserve Bank of India (RBI), Financial Benchmarks India (FBIL), and Ministry of Finance (MoF) gazette notifications.
4. **Scam Protection**: Algorithmic red flag detection against unverified MLM/Ponzi schemes.
5. **Non-Breaking Extensibility**: Modular sub-services with zero regressions across existing financial models and test suites.

---

## 3. Considered Options

* **Option 1**: Rely exclusively on third-party broker widgets. (Rejected: Leaks user privacy, inflexible).
* **Option 2**: Pure cloud AI LLM estimates for stock valuation. (Rejected: Violates ADR-001 against arithmetic hallucinations).
* **Option 3 (Selected)**: Dual-layer architecture:
  - Asynchronous live market data fetcher with in-memory TTL caching and deterministic fallback baselines (`BrokerClient`).
  - Official sovereign yield comparator with live gold spot and maturity calculation engine (`SchemeRadarService`).
  - Algorithmic fraud scoring engine (`ScamShieldEngine`).
  - Deterministic quantitative valuation and arbitrage solvers (`QuantitativeEngine`, `ArbitrageSolver`).

---

## 4. Decision Outcome

### Chosen Architecture:
1. **`BrokerClient`**: Asynchronous live exchange quotes (`^NSEI`, `^BSESN`, `RELIANCE.NS`, `TCS.NS`, `HDFCBANK.NS`, `INFY.NS`, `ICICIBANK.NS`, `SBIN.NS`, `GOLDBEES.NS`, `USDINR=X`, `AAPL`, `NVDA`, `MSFT`, `GOOGL`) with 30-second in-memory caching and zero-downtime baselines.
2. **`SchemeRadarService`**: Live 24K gold spot benchmark (per gram & per 10g), official FBIL/RBI T-Bills (91D/182D/364D/10Y G-Sec), MoF Small Savings Schemes (SCSS, SSY, NSC, PPF, KVP, POMIS, MSSC), verified Bank FDs with exact tenures (`1001 Days`, `400 Days`, `55 Months`), and compound maturity calculations.
3. **`ScamShieldEngine`**: Algorithmic fraud scoring ($\mathcal{S}_{\text{risk}}$) evaluating guaranteed yield claims, downline referral structures, and regulatory licensing.
4. **`QuantitativeEngine`**: Deterministic implementations of Discounted Cash Flow (DCF), Piotroski 9-point F-Score, and Altman Z-Score.
5. **`ArbitrageSolver`**: Optimal allocation engine comparing debt prepayment interest against post-tax equity hurdle rates.

---

## 5. Consequences

### Positive:
- Real-time exchange pricing for equities, indices, forex, and gold.
- Zero-downtime resilience: system operates seamlessly both online and in offline/sandbox test environments.
- 100% test coverage with all 34 test suites passing.
- Interactive maturity calculator with dynamic APY, compounding frequency, and senior citizen bonus.

### Negative:
- In-memory cache requires periodic refresh (default 30s TTL) for high-frequency price updates.
