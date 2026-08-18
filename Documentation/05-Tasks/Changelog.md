---
title: Project Changelog & Version History
tags:
  - tasks
  - changelog
  - history
version: 3.7.0
last_updated: 2026-08-18
---

# 📜 Expense Tracker V2 — Changelog & Version History

---

## `v3.7.0` — Institutional Monte Carlo Stochastic Engine, 6-Tier FIRE Planner & What-If Sandbox (2026-08-18)
- **Institutional Monte Carlo Stochastic Engine (`fireSimulatorEngine.js`)**:
  - Implemented Geometric Brownian Motion (GBM) with exact Ito calculus drift correction term ($-\frac{1}{2}\sigma^2$) to eliminate volatility drag bias.
  - Implemented Merton Jump Diffusion model superimposing Poisson market crash/rally jumps ($\lambda \approx 0.12, \mu_J \approx -18\%$).
  - Added Empirical Historical Bootstrap Resampling across 55 years of multi-asset historical cycles (1970–2024).
  - Added Multi-Asset Covariance Allocation (Equity, Debt, Gold, Cash) with Dynamic Age Glidepaths (-0.75% equity/yr into fixed income).
  - Scaled simulation capacity with typed arrays (`Float64Array`) supporting **1,000, 5,000, 10,000, 25,000, and 50,000 parallel paths**.
  - Computed institutional risk metrics: Portfolio Survival Rate (%), Ruin Probability (%), Value at Risk (VaR 95%), Conditional VaR (CVaR / Expected Shortfall), Sharpe Ratio, and Average Max Drawdown.
- **6-Tier Comprehensive FIRE Freedom Planner (`WealthSimulatorPage.jsx`)**:
  - Expanded milestones into 6 granular tiers: **Barista FIRE (15x)**, **Lean FIRE (20x)**, **Standard FIRE (25x)**, **Chubby FIRE (30x)**, **Fat FIRE (35x)**, and **Coast FIRE**.
  - Dynamic real-time parameter calibration sliders for income, living expenses, invested net worth, custom SWR (2.5% to 6.0%), expected return, inflation, and annual SIP step-up growth.
  - Freedom countdown clock with projected financial independence date and target age.
  - Fixed string interpolation display glitch for Coast FIRE status.
- **Multi-Variable What-If Scenario Sandbox**:
  - 1-Click presets for macro life milestones: Career Surge / Promotion, Frugal FIRE Optimization, Home Purchase Downpayment, Sabbatical Gap Year, and Startup ESOP Venture.
  - Timed capital shock events (injections or outflows triggered at specific future years) with dual-area comparative trajectory visualization over 1 to 30 years.
- **Executive Quantitative Summary & Interactive Tutorial Modal**:
  - Added Automated Portfolio Synthesis card breaking down trajectory, sequence-of-returns vulnerability, and top 3 alpha levers.
  - Added interactive in-app educational guide modal with 4 quantitative theory sub-tabs and institutional pro tips.
- **Architecture & Knowledge Base Synchronization**:
  - Documented complete mathematical formulations in `[[Monte-Carlo-and-FIRE-Simulator]]`.
  - Formalized and accepted `[[ADR-008-Stochastic-Monte-Carlo-and-FIRE-Engine]]`.
  - Updated API contracts and backend engine specifications.
  - Verified 100% test pass on `tests/fireSimulation.test.js` and confirmed in live browser.

---

## `v3.6.0` — State-of-the-Art Voice Engine, Web Audio Visualizer & Sovereign Local AI Model Hub (2026-08-18)
- **Continuous Resilient Voice Engine (`VoiceQuickLogModal.jsx`)**: Resolved 1-second auto-disconnect bug via `continuous: true`, auto-reconnect watchdog, silence debounce, and graceful session lifecycle management.
- **Live 24-Band Web Audio API Waveform Visualizer**: Integrated real-time `AudioContext` and `AnalyserNode` rendering dynamic glowing cyberpunk equalizer spectrum bars and decibel pulse rings.
- **Multilingual Accent Switcher**: Added regional accent switcher (`en-IN` Indian English, `en-US`, `en-GB`, `hi-IN` Hindi, `es-ES`, `fr-FR`, `de-DE`, `ja-JP`).
- **Multi-Entity Financial NLP Parser (`localVoiceAiService.js`)**: Robust natural language extraction for amounts (₹, $, words, decimals, k/lakh), 15+ financial categories, payment methods (UPI, GPay, PhonePe, Cards, Cash), counterparties, and relative dates ("yesterday", "today").
- **On-Demand Local AI Model Management Studio (`LocalAiModelStudio.jsx`)**: Dedicated 7th studio tab in `CustomizationPage.jsx` allowing users to inspect, benchmark, download on demand, switch active engines, and purge local model weights.

---

## `v3.5.0` — Family Multi-User Ledgers, Bank SMS Webhooks & Enterprise Exports (2026-08-18)
- **Family Multi-User Ledgers (`FamilyVault.js` & `familyService.js`)**: Multi-tenant household vaults with Role-Based Access Control (`OWNER`, `ADMIN`, `CONTRIBUTOR`, `VIEWER`), shared budget pools, and private ledger isolation.
- **Family Multi-User Studio (`FamilyVaultPage.jsx`)**: Comprehensive household manager with real-time member invite workflows, shared spend analytics, and pooled expense logging.
- **Indian Bank Transaction SMS Parser (`smsParserEngine.js`)**: Deterministic regex state machine parsing transaction notifications across HDFC, SBI, ICICI, Axis, Kotak, PayTM, PhonePe, and UPI.
- **Instant SMS Quick-Parse Modal Integration (`BankStatementModal.jsx`)**: Dual-mode statement importer supporting both multi-column CSV uploads and direct SMS alert text parsing.
- **Enterprise Vector PDF & CSV Financial Statement Generator (`reportExportEngine.js`)**: Multi-sheet formatted statement reports with executive summaries, category allocation percentages, and tax-ready schedules.

---

## `v3.4.0` — Quantitative Stock Market, Scheme Radar & Scam Shield (2026-08-18)
- **Stock Market & Passive Wealth Studio (`PassiveIncomePage.jsx`)**: Real-time market ticker (Nifty 50, Sensex, Reliance, TCS, Apple, Nvidia), interactive tabs, and visual financial analytics.
- **Verified Sovereign Scheme Radar (`schemeRadarService.js`)**: Real-time comparator for RBI Treasury Bills (91D, 182D, 364D), Sovereign Gold Bonds (SGBs), Post Office SCSS/SSY/PPF, and Bank Fixed Deposits.
- **Automated Scam & Ponzi Shield (`scamShieldEngine.js` red flag detector)**: Algorithmic red flag detection engine ($\mathcal{S}_{\text{risk}}$) evaluating guaranteed unrealistic yields ($>18\%$), MLM pyramid downlines, and regulatory compliance.
- **Institutional Quantitative Valuation Suite (`quantitativeEngine.js`)**: Two-stage Discounted Cash Flow (DCF) fair value calculation, 9-point Piotroski F-Score, and Altman Z-Score bankruptcy prediction.

---

## `v3.3.0` — Local Sovereign OCR & Multi-Tier AI Fallback Cascade (2026-08-18)
- **Local Baidu Unlimited-OCR Sidecar (`server/services/ocr-sidecar/`)**: Containerized Python FastAPI microservice with strict JSON schema parsing and PaddleOCR fallback.
- **Node.js Local OCR Adapter (`localOcrService.js`)**: Probes sidecar health on port 8001 and delegates receipt scans with automatic fallback.
- **Local Financial SLM Adapter (`localSlmClient.js`)**: Routes transactions and Copilot queries to local Ollama host models (`qwen2.5:1.5b`).

---

## `v3.2.0` — Sovereign Customization Hub, Habit Intelligence & Full PWA (2026-08-18)
- **Staged Modular Customization Machine**: Dual-state buffer (`CustomizationContext.jsx`) and floating confirmation bar with automated pre-sync Memento snapshots.
- **5-Studio Customization Hub (`CustomizationPage.jsx`)**: Feature Modules Suite, Visual Theme Studio, Dashboard Grid Studio, Currency & Regional Engine, and Snapshot Vault.

---

## `v3.0.0` — Sovereign Wealth & Global Readiness (2026-08-16)
- Added 1,000-Run Stochastic Monte Carlo Wealth Simulator ($P_{10}, P_{50}, P_{90}$).
- Added Rule-of-25 FIRE retirement milestone sandbox with SWR controls.
- Full Jest test suite expansion: **20 test suites, 127/127 tests passing**.
