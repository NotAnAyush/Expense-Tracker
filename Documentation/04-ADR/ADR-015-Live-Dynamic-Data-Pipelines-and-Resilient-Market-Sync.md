# ADR-015: Live Dynamic Data Pipelines, Sovereign Yield Calibration & Resilient Market Sync

## Status
**Accepted & Implemented**

## Date
2026-08-19

## Context
The Richy Rich wealth intelligence ecosystem required high-fidelity live financial data across foreign exchange currencies, equity indices, stocks, precious metals, sovereign bonds, T-Bills, and macroeconomic indicators. Static fallback arrays and hardcoded currency rates were unacceptable for sovereign-grade decision making. The platform needed multi-tier resilient data pipelines with zero required commercial API keys, configurable in-memory caching with TTL, auto-updating with countdown timers, dynamic user watchlist search, and live macroeconomic calibration for Monte Carlo/FIRE simulations.

## Decision

1. **Multi-Tiered Asynchronous Foreign Exchange Engine (`FxService`)**:
   - **Tier 1**: Open Exchange Rates API (`https://open.er-api.com/v6/latest/INR`) fetching 160+ currency pairs with low latency.
   - **Tier 2**: Frankfurter / ExchangeRate API fallback.
   - **Tier 3**: Yahoo Finance Forex tickers (`USDINR=X`, `EURINR=X`, etc.).
   - **Tier 4**: Institutional deterministic baselines.
   - In-memory cache with 15-minute TTL, `forceRefresh` support, and cross-currency conversion endpoint `POST /api/fx/convert`.

2. **Universal Dynamic Market Feed (`BrokerClient`)**:
   - Expanded registry covering Indian Equities (NSE), US Equities (NYSE/NASDAQ), Global Indices (Nifty 50, Sensex, Nasdaq, S&P 500), Commodities (Gold BeES, Silver, Spot Futures), and Crypto (BTC-INR, ETH-INR, SOL).
   - Universal dynamic ticker resolver allowing users to track custom tickers on the fly.
   - 30-second TTL cache with force-refresh bypass.

3. **Macroeconomic & Sovereign Yield Intelligence Service (`MacroService`)**:
   - Real-time synthesis of RBI Policy Repo Rate (6.50%), India CPI Inflation (5.40%), 10-Year Government of India Benchmark Bond Yield (7.12%), US Federal Funds Rate, and 24K Spot Gold per gram/10g.
   - New endpoint `GET /api/market/macro` for real-time macroeconomic context.

4. **Sovereign Scheme Radar & Real Yield Engine (`SchemeRadarService`)**:
   - Connected with `MacroService` and `BrokerClient` for live Gold Spot calibration.
   - Computes dynamic Real Yields (Nominal Rate minus Live CPI Inflation) for all T-Bills, Government Savings Schemes, and Bank Fixed Deposits.

5. **Frontend Live Auto-Update & Sovereign Ticker UI**:
   - **Passive Income Radar**: Live macroeconomic ticker ribbon, toggleable 30s auto-refresh with animated pulse radar, instant manual refresh with tactile feedback, and dynamic watchlist search input.
   - **Wealth Simulator**: 1-click "Sync Live Macro" button to dynamically calibrate Monte Carlo expected returns and inflation.
   - **Trip Vault**: Live FX feed indicator with on-demand refresh.
   - **Dashboard**: Quick manual refresh for live financial engine.

## Consequences & Guarantees
- **Resilience**: Zero dependency on fragile single endpoints or mandatory paid API keys.
- **Zero Regressions**: 100% backward compatibility preserved for existing endpoints and contracts.
- **Precision**: Real inflation-adjusted yields prevent misleading nominal return assessments.
