---
title: Project Changelog & Version History
tags:
  - tasks
  - changelog
  - history
version: 3.9.0
last_updated: 2026-08-19
---

# 📜 Expense Tracker V2 — Changelog & Version History

---

## `v3.9.0` — Live Dynamic Data Pipelines, Multi-Tier FX Engine, Central Bank Calibration & Auto-Update Radar (2026-08-19)
- **Multi-Tier Live FX Engine (`server/src/services/fx/fxService.js`, `server/src/controllers/tripVaultController.js`)**:
  - Replaced static rates table with asynchronous 4-tier live currency pipeline:
    - Tier 1: Open Exchange Rates API (`open.er-api.com`) supporting 160+ currency pairs.
    - Tier 2: Frankfurter API (`api.frankfurter.app`).
    - Tier 3: Yahoo Finance Forex chart rates.
    - Tier 4: Institutional deterministic baselines.
  - Implemented 15-minute TTL cache, `forceRefresh` support, `POST /api/fx/convert` endpoint, and instant synchronous + async conversion methods.
- **Universal Dynamic Market Feed (`server/src/services/market/brokerClient.js`)**:
  - Expanded symbol registry covering Indian Equities (NSE), US Equities (NYSE/NASDAQ), Global Indices, Commodities (Gold/Silver Spot), and Crypto (BTC-INR, ETH-INR, SOL).
  - Built universal dynamic ticker detection allowing users to search and add any stock/crypto ticker symbol on the fly.
  - Added in-memory caching with 30-second TTL and `forceRefresh` bypass.
- **Macroeconomic & Sovereign Intelligence Service (`server/src/services/market/macroService.js`)**:
  - Dedicated service synthesizing real-time monetary policy benchmarks: RBI Repo Rate (6.50%), US Fed Funds (5.25%), India CPI Inflation (5.40%), 10-Year Benchmark G-Sec Yield (7.12%), and live 24K Spot Gold per gram.
  - Created `GET /api/market/macro` endpoint for live macroeconomic calibration.
- **Dynamic Real Yield Sovereign Radar (`server/src/services/market/schemeRadarService.js`)**:
  - Integrated `MacroService` to dynamically calculate real inflation-adjusted yields ($R_{\text{real}} = R_{\text{nominal}} - \text{CPI}_{\text{live}}$) across all T-Bills, Government Savings Schemes (SCSS, SSY, NSC, PPF, KVP, POMIS), and High-Yield Bank FDs.
- **Frontend Auto-Updating Radar & Dynamic UI (`PassiveIncomePage.jsx`, `WealthSimulatorPage.jsx`, `TripVaultPage.jsx`, `DashboardPage.jsx`)**:
  - **Passive Income Radar**: Real-time Macroeconomic Benchmark Strip, 30-second countdown auto-update loop with toggle, animated pulse radar badge, manual refresh button, and dynamic symbol search & watchlist.
  - **Wealth Simulator**: 1-Click "Sync Live Macro" button calibrating expected returns and inflation directly against RBI/CPI ground truth.
  - **Trip Vault & Dashboard**: Added live FX feed indicators and on-demand refresh triggers.
- **Testing & Documentation**:
  - Expanded test suites (34 test suites, 232/232 tests passing with 0 regressions).
  - Logged Architecture Decision Record `[[ADR-015-Live-Dynamic-Data-Pipelines-and-Resilient-Market-Sync]]`.
  - Updated all Obsidian Knowledge Vault architecture documents, feature specs, and task matrices.

---

## `v3.8.1` — Wealth & FIRE Simulator Luxury FinTech UI/UX Design System Alignment (2026-08-19)
- **Design System & Styling Architecture Alignment (`WealthSimulatorPage.jsx`, `index.css`)**:
  - Completely refactored `WealthSimulatorPage.jsx` from generic Tailwind classes to native bespoke Vanilla CSS design tokens (`RICHY RICH — DESIGN SYSTEM & LUXURY FINTECH CSS v3.0`).
  - Added hardware-accelerated FinTech range slider styles (`.slider-luxury`, `.slider-mint`, `.slider-cyan`, `.slider-amber`, `.slider-violet`, `.slider-rose`) with custom glowing thumbs and glass tracks.
  - Added glowing progress bar utilities (`.progress-bar-luxury`, `.progress-bar-fill-gold`, `.progress-bar-fill-mint`) and card glow accent variants (`.glass-card-glow-mint`, `.glass-card-glow-amber`, `.glass-card-glow-cyan`, `.glass-card-glow-violet`, `.glass-card-glow-rose`).
- **State-of-the-Art Micro-Animations & Custom Tooltips**:
  - Implemented Framer Motion tab transitions with interactive `.filter-chip` and `.filter-chip-active` navigation.
  - Built custom dark glassmorphic Recharts tooltips with glowing neon borders for What-If comparative trajectories and Monte Carlo stochastic confidence ribbons.
  - Added responsive Bento KPI cards, luxury calibration slider controls, 6-Tier FIRE spectrum cards, and interactive modal dialogs.
- **Obsidian Knowledge Vault & Documentation**:
  - Logged Architecture Decision Record `[[ADR-014-Wealth-Simulator-Fintech-UIUX-Alignment]]`.
  - Updated `[[Page-Directory]]`, `[[Project-Kanban]]`, and `[[Changelog]]`.

---

## `v3.8.0` — Real-Time Multi-Asset Live Market Feeds, Official Sovereign Yields, & Dynamic Maturity Calculator (2026-08-19)
- **Live Multi-Asset Exchange Ingestion Engine (`brokerClient.js`)**:
  - Connected live real-time price feeds for major Indian equities and indices (`^NSEI`, `^BSESN`, `RELIANCE.NS`, `TCS.NS`, `HDFCBANK.NS`, `INFY.NS`, `ICICIBANK.NS`, `SBIN.NS`, `GOLDBEES.NS`, `USDINR=X`) and US equities (`AAPL`, `NVDA`, `MSFT`, `GOOGL`).
  - Implemented 30-second in-memory TTL caching with parallel ticker resolution and timeout protection (3.5s).
  - Built zero-downtime deterministic fallback baselines ensuring 100% offline test suite reliability.
- **Official Sovereign Yield & Fixed Income Radar (`schemeRadarService.js`)**:
  - Live 24K Gold Spot (999 Purity) rate calculation per gram (₹7,548/g) and per 10g (₹75,480) derived from live gold exchange ETF feeds with 24h delta.
  - Official Reserve Bank of India (RBI) / FBIL Treasury Bill yields (91D: 6.85%, 182D: 6.98%, 364D: 7.04%) and 10-Year GoI Benchmark Bond (7.12%).
  - Sovereign Gold Bonds (SGBs) tracking with 2.50% p.a. guaranteed semi-annual coupon and 0% Capital Gains Tax exemption under Sec 47(viic).
  - Official Ministry of Finance (MoF) Small Savings Schemes gazette rates (SCSS: 8.20%, SSY: 8.20%, NSC: 7.70%, PPF: 7.10%, KVP: 7.50%, POMIS: 7.40%, MSSC: 7.50%).
  - Top Verified Bank Fixed Deposits with accurate lock-in tenures (`1001 Days`, `732 Days`, `400 Days`, `55 Months`, `390 Days`) and DICGC ₹5 Lakh depositor protection.
- **Interactive Yield & FD Maturity Calculator (`PassiveIncomePage.jsx`)**:
  - Dynamic compound interest and APY calculator with parametric sliders for Principal (₹10k - ₹50L), Interest Rate (4% - 12%), Tenor (0.25 - 10 Yrs), and Compounding Frequency (Quarterly, Monthly, Annual, Simple).
  - One-click Senior Citizen Rate bonus (+0.50%) with dynamic recalculation of interest earned and payout cash flows.
  - Visual corpus distribution bar comparing principal ratio vs total interest accumulated.
- **UI/UX & Live Watch Ribbon Upgrades**:
  - Live market status badges (`LIVE` vs `BENCHMARK`) with real-time price change arrows and day ranges.
  - 1-Click "Refresh Live Rates" control with smooth spinning animation.
  - Granular category filter chips (`All`, `RBI T-Bills`, `SGB & Gold`, `Small Savings`, `Bank FDs`).
  - Resolved `{fd.tenureMonths} Months` display bug (`1001 Days` instead of `1001 Months`).
- **Tests & Quality Assurance**:
  - All 34 test suites (229/229 tests) passing 100%.
  - Verified live browser rendering and interactions with recorded WebP session artifacts.

---

## `v3.7.0` — Institutional Monte Carlo Stochastic Engine, 6-Tier FIRE Planner & What-If Sandbox (2026-08-18)
- **Institutional Monte Carlo Stochastic Engine (`fireSimulatorEngine.js`)**:
  - Implemented Geometric Brownian Motion (GBM) with exact Ito calculus drift correction term ($-\\frac{1}{2}\\sigma^2$) to eliminate volatility drag bias.
  - Implemented Merton Jump Diffusion model superimposing Poisson market crash/rally jumps ($\\lambda \\approx 0.12, \\mu_J \\approx -18\\%$).
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

---

## `v3.6.0` — State-of-the-Art Voice Engine, Web Audio Visualizer & Sovereign Local AI Model Hub (2026-08-18)
- **Continuous Resilient Voice Engine (`VoiceQuickLogModal.jsx`)**: Resolved 1-second auto-disconnect bug via `continuous: true`, auto-reconnect watchdog, silence debounce, and graceful session lifecycle management.
- **Live 24-Band Web Audio API Waveform Visualizer**: Integrated real-time `AudioContext` and `AnalyserNode` rendering dynamic glowing cyberpunk equalizer spectrum bars and decibel pulse rings.
- **Multilingual Accent Switcher**: Added regional accent switcher (`en-IN` Indian English, `en-US`, `en-GB`, `hi-IN` Hindi, `es-ES`, `fr-FR`, `de-DE`, `ja-JP`).
- **Multi-Entity Financial NLP Parser (`localVoiceAiService.js`)**: Robust natural language extraction for amounts (₹, $, words, decimals, k/lakh), 15+ financial categories, payment methods (UPI, GPay, PhonePe, Cards, Cash), counterparties, and relative dates (\"yesterday\", \"today\").
- **On-Demand Local AI Model Management Studio in Customization Hub (`LocalAiModelStudio.jsx`)**: Dedicated 7th studio tab in `CustomizationPage.jsx` allowing users to inspect, benchmark, download on demand, switch active engines, and purge local model weights.

---

## `v3.5.0` — Family Multi-User Ledgers, Bank SMS Webhooks & Enterprise Exports (2026-08-18)
- **Family Multi-User Ledgers (`FamilyVault.js` & `familyService.js`)**: Multi-tenant household vaults with Role-Based Access Control (`OWNER`, `ADMIN`, `CONTRIBUTOR`, `VIEWER`), shared budget pools, and private ledger isolation.
- **Family Multi-User Studio (`FamilyVaultPage.jsx`)**: Comprehensive household manager with real-time member invite workflows, shared spend analytics, and pooled expense logging.
- **Indian Bank Transaction SMS Parser (`smsParserEngine.js`)**: Deterministic regex state machine parsing transaction notifications across HDFC, SBI, ICICI, Axis, Kotak, PayTM, PhonePe, and UPI.
- **Instant SMS Quick-Parse Modal Integration (`BankStatementModal.jsx`)**: Dual-mode statement importer supporting both multi-column CSV uploads and direct SMS alert text parsing.
- **Enterprise Vector PDF & CSV Financial Statement Generator (`reportExportEngine.js`)**: Multi-sheet formatted statement reports with executive summaries, category allocation percentages, and tax-ready schedules.
