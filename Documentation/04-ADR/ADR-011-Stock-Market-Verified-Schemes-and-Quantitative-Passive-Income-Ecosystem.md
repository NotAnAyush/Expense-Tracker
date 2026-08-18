# ADR-011: Stock Market, Verified Government Schemes, Quantitative Valuations & Scam Shield Architecture

**Status:** Accepted  
**Date:** 2026-08-18  
**Context:** Richy Rich Sovereign Wealth Platform (Phase 8)  
**Deciders:** Core Engineering Team  

---

## 1. Context and Problem Statement

Users require real-time market data, deterministic valuation metrics (DCF, Piotroski, Altman), verified government bond/FD comparisons, and protection against fraudulent investment schemes. How should this multi-faceted investment and risk engine be structured without creating external API dependencies or security risks?

---

## 2. Decision Drivers

1. **Deterministic Accuracy**: Mathematical computations (DCF, F-Score, Z-Score, debt vs. investment arbitrage) must be implemented in pure, testable JavaScript.
2. **Scam Protection**: Algorithmic red flag detection against unverified MLM/Ponzi schemes.
3. **Sovereign Reliability**: Support mock market streaming and fallback data when live broker WebSockets are offline.
4. **Non-Breaking Extensibility**: Modular sub-services with zero regressions across existing financial models.

---

## 3. Considered Options

* **Option 1**: Rely exclusively on third-party broker widgets. (Rejected: Leaks user privacy, inflexible).
* **Option 2**: Pure cloud AI LLM estimates for stock valuation. (Rejected: Violates ADR-001 against arithmetic hallucinations).
* **Option 3 (Selected)**: Modular, deterministic Quantitative Valuation and Scheme Radar Engine with fallback broker connectors and algorithmic Scam Shield.

---

## 4. Decision Outcome

### Chosen Architecture:
1. **`BrokerClient`**: Multi-broker connector (Zerodha Kite, Dhan, Alpaca, Polygon.io) with mock generator fallback.
2. **`SchemeRadarService`**: Real-time comparator for RBI T-Bills (91D/182D/364D), Sovereign Gold Bonds (SGBs), and Bank FDs.
3. **`ScamShieldEngine`**: Algorithmic fraud scoring ($\mathcal{S}_{\text{risk}}$) evaluating guaranteed yield claims, downline referral structures, and regulatory licensing.
4. **`QuantitativeEngine`**: Deterministic implementations of Discounted Cash Flow (DCF), Piotroski 9-point F-Score, and Altman Z-Score.
5. **`ArbitrageSolver`**: Optimal allocation engine comparing debt prepayment interest against post-tax equity hurdle rates.

---

## 5. Consequences

### Positive:
- Institutional-grade quantitative valuation metrics available to users.
- Automated defense against financial scams and fraudulent investment traps.
- Complete offline testability with 100% deterministic coverage.

### Negative:
- Live broker WebSocket feeds require valid API tokens when connecting live accounts.
