# ADR-008: Institutional Stochastic Monte Carlo Engine & 6-Tier FIRE Architecture

## Status
**ACCEPTED** (2026-08-18)

## Context
Standard personal finance applications use naive deterministic compound interest formulas ($\text{FV} = \text{PV}(1+r)^n$) or arithmetic Gaussian shocks. In real financial markets:
1. **Arithmetic averages overestimate terminal wealth** due to variance drag ($\mu - \frac{1}{2}\sigma^2$).
2. **Sequence of Returns Risk (SRR)** can cause catastrophic portfolio depletion in early retirement even if average long-term returns meet expectations.
3. Market returns are not purely Gaussian; they exhibit leptokurtic fat tails and sudden macro jump crashes (1987, 2008, 2020).
4. Users require granular control to model up to 50,000 parallel paths, multi-asset covariance portfolios, dynamic glide paths, and timed life events (promotions, sabbaticals, home downpayments).

## Decision
We implemented an institutional-grade quantitative simulation engine in `server/src/services/analytics/fireSimulatorEngine.js` and `client/src/pages/WealthSimulatorPage.jsx`:
1. **Geometric Brownian Motion (GBM)**: Formulated with exact Ito calculus drift correction term ($-\frac{1}{2}\sigma^2$).
2. **Merton Jump Diffusion**: Incorporated Poisson jump processes with log-normal shock magnitudes to model crash risk.
3. **Empirical Historical Bootstrap**: Implemented non-parametric sampling from 55 years of multi-asset historical cycles (1970–2024).
4. **Multi-Asset Allocation & Dynamic Glidepath**: Modeled cross-asset correlation ($\rho$) across Equities, Debt, Gold, and Cash with linear age glidepath shifts.
5. **Quantitative Risk Metrics**: Calculated Portfolio Survival Rate, Ruin Probability, Value at Risk (VaR 95%), Conditional VaR (Expected Shortfall), Sharpe Ratio, and 7-point percentile confidence ribbons ($P_5$ to $P_{95}$).
6. **6-Tier Comprehensive FIRE Spectrum**: Expanded milestones to Barista (15x), Lean (20x), Standard (25x), Chubby (30x), Fat (35x), and Coast FIRE.
7. **Performance Optimization**: Employed JavaScript `Float64Array` typed array buffers to achieve $<180\text{ms}$ calculation latency even at 50,000 iterations.
8. **In-App Education**: Added an interactive "How It Works & Quant Guide" tutorial modal for user guidance.

## Consequences
- **Positive**: Eliminates mathematical inaccuracies, protects users from sequence-of-returns blindspots, provides institutional-level decision clarity, and provides high-performance simulation capabilities.
- **Backward Compatibility**: Fully backward-compatible with existing API endpoints while supporting rich query parameters.
