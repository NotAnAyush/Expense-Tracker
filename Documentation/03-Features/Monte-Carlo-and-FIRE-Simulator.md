---
title: Institutional Monte Carlo Stochastic Wealth Engine & 6-Tier FIRE Planner
tags:
  - features
  - simulation
  - fire
  - monte-carlo
  - mathematics
  - quantitative-finance
version: 3.2.0
last_updated: 2026-08-18
---

# 📈 Institutional Monte Carlo Stochastic Wealth Engine & 6-Tier FIRE Planner

Located at:
- Backend Engine: `server/src/services/analytics/fireSimulatorEngine.js`
- API Controller: `server/src/controllers/simulationController.js`
- Client UI: `client/src/pages/WealthSimulatorPage.jsx`

---

## 1. Mathematical Specifications & Stochastic Physics

Static average-return financial models suffer from **flaw of averages** and completely miss **Sequence of Returns Risk (SRR)** and **Volatility Drag**. Our engine implements institutional quantitative methods on par with BlackRock Aladdin, Vanguard VCMM, and Modern Portfolio Theory.

### A. Geometric Brownian Motion (GBM) with Ito Volatility Drag
Continuous log-normal asset price diffusion with exact Ito calculus drift correction:
$$W_{t+1} = \left( W_t + C_t \right) \cdot \exp\left( \left(\mu_{\text{real}} - \frac{\sigma_{\text{real}}^2}{2}\right) \Delta t + \sigma_{\text{real}} \sqrt{\Delta t} \, Z_t \right)$$

Where:
- $W_t$: Portfolio net worth at step $t$
- $C_t$: Period cash flow (invested monthly savings with optional annual step-up growth $(1 + g)^y$ or annual inflation-adjusted retirement withdrawal)
- $\mu_{\text{real}} = \frac{1 + \mu_{\text{nominal}} - \tau}{1 + \pi} - 1$: Real rate of return after inflation $\pi$ and tax drag $\tau$
- $\sigma_{\text{real}}$: Annualized portfolio standard deviation / volatility
- $-\frac{1}{2}\sigma_{\text{real}}^2$: **Ito correction term for Volatility Drag** (variance drain on geometric CAGR)
- $Z_t \sim \mathcal{N}(0, 1)$: Standard Gaussian random variable generated via polar Box-Muller transform

---

### B. Merton Fat-Tailed Jump Diffusion Model
Financial markets exhibit excess kurtosis (leptokurtic fat tails) and sudden structural shocks (crashes and flash rallies). The Merton model superimposes a Poisson jump process:
$$\ln\left(\frac{S_{t+1}}{S_t}\right) = \left(\mu - \frac{\sigma^2}{2} - \lambda k\right) \Delta t + \sigma \sqrt{\Delta t} Z_t + \sum_{j=1}^{N(\Delta t)} Y_j$$

Where:
- $N(\Delta t) \sim \text{Poisson}(\lambda \Delta t)$: Integer jump arrivals ($\lambda \approx 0.12$, representing ~1 major shock per 8.3 years)
- $Y_j \sim \mathcal{N}(\mu_J, \sigma_J^2)$: Crash jump magnitude distribution ($\mu_J \approx -18\%$, $\sigma_J \approx 10\%$)
- $k = \exp\left(\mu_J + \frac{\sigma_J^2}{2}\right) - 1$: Compensator to preserve martingale drift

---

### C. Empirical Historical Bootstrap Resampling (1970–2024 Regimes)
Non-parametric resampling directly from 55 years of multi-asset historical cycles (Stagflation, 1987 Black Monday, 2000 Dot-com crash, 2008 Global Financial Crisis, 2020 COVID shock, Indian Nifty macro bull/bear cycles). Preserves empirical cross-sectional tail risk and autocorrelation without normal distribution assumptions.

---

### D. Multi-Asset Covariance Allocation & Dynamic Glidepaths
Blended returns and portfolio volatility derived from cross-asset correlation matrix:
$$\sigma_p = \sqrt{\mathbf{w}^T \mathbf{\Sigma} \mathbf{w}} = \sqrt{\sum_i w_i^2 \sigma_i^2 + 2\sum_{i < j} w_i w_j \sigma_i \sigma_j \rho_{ij}}$$

Supported Asset Classes:
- **Equities**: $\mu = 12.0\%$, $\sigma = 16.0\%$
- **Fixed Income (Debt)**: $\mu = 7.0\%$, $\sigma = 5.5\%$
- **Gold / Commodities**: $\mu = 8.5\%$, $\sigma = 13.0\%$
- **Liquid Cash**: $\mu = 5.5\%$, $\sigma = 1.2\%$

**Dynamic Age Glidepath**:
$$\text{Equity Weight}(t) = \max\left(20\%, \, \text{Initial Equity} - 0.75\% \times t\right)$$
Gradually shifts capital from growth equities into capital-preserving fixed income as target retirement approaches.

---

## 2. Institutional Risk & Return Metrics

| Metric | Formula / Definition | Significance |
| :--- | :--- | :--- |
| **Portfolio Survival Rate (%)** | $\frac{\sum \mathbb{I}(W_{\text{final}} > 0)}{N_{\text{runs}}} \times 100$ | Primary probability of not outliving your nest egg in retirement |
| **Ruin Probability (%)** | $100\% - \text{Survival Rate}$ | Probability of capital exhaustion before end of horizon |
| **Value at Risk (VaR 95%)** | $W_{(0.05 \cdot N)}$ | Minimum portfolio floor at 95% statistical confidence |
| **Conditional VaR (CVaR)** | $\mathbb{E}\left[W \mid W \le \text{VaR}_{95}\right]$ | Expected shortfall in the worst 5% tail market crashes |
| **Sharpe Ratio** | $\frac{\mu_{\text{real}} - r_f}{\sigma_{\text{real}}}$ | Risk-adjusted return per unit of volatility |
| **Average Max Drawdown** | $\frac{1}{N} \sum_{r=1}^N \max_{t} \left(\frac{\text{Peak}_t - W_t}{\text{Peak}_t}\right)$ | Average peak-to-trough decline experienced across all paths |

---

## 3. The 6-Tier Comprehensive FIRE Spectrum

$$\text{Target FIRE Corpus} = \frac{\text{Annual Living Expenses}}{\text{Safe Withdrawal Rate (SWR)}} = \text{Expenses} \times \left(\frac{100}{\text{SWR \%}}\right)$$

1. **Barista FIRE (15x Spend • 6.7% SWR)**: Part-time passion income / freelancing covers 40% of living expenses.
2. **Lean FIRE (20x Spend • 5.0% SWR)**: Frugal essentials & survival living.
3. **Standard FIRE (25x Spend • 4.0% SWR)**: Full lifestyle maintenance (Trinity Study benchmark).
4. **Chubby FIRE (30x Spend • 3.33% SWR)**: Comfortable living with regular travel, dining, and buffers.
5. **Fat FIRE (35x Spend • 2.85% SWR)**: Unconstrained luxury living and generational wealth transfer.
6. **Coast FIRE**:
   $$\text{Coast Target} = \frac{\text{Standard FIRE Target}}{(1 + r_{\text{real}})^{\text{Target Age} - \text{Current Age}}}$$
   Current savings compounding without any additional monthly contributions to hit Standard FIRE by retirement age.

---

## 4. UI Architecture & Features

- **High-Performance Simulation Paths**: 1k, 5k, 10k, 25k, 50k runs with TypedArrays (`Float64Array`).
- **Confidence Fan Area Chart**: Multi-percentile bands ($P_5, P_{10}, P_{25}, P_{50}, P_{75}, P_{90}, P_{95}$) and sample stochastic trajectory spaghetti lines.
- **Interactive What-If Sandbox**: 1-click presets (Promotion, Frugal Optimization, Home Purchase, Sabbatical, Startup ESOP) and timed capital shock events.
- **Executive Quant Summary**: 3-pillar synthesis (Trajectory, Sequence Risk, High-Impact Levers).
- **Interactive Quant Guide Modal**: Educational walkthrough of FIRE math, volatility drag, and survival rules.
