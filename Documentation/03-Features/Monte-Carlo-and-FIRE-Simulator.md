---
title: Monte Carlo Stochastic Wealth & FIRE Simulator
tags:
  - features
  - simulation
  - fire
  - monte-carlo
  - mathematics
version: 3.0.0
last_updated: 2026-08-17
---

# 📈 Monte Carlo Stochastic Wealth & FIRE Simulator

Located at: `server/src/services/analytics/fireSimulatorEngine.js`

---

## 1. Mathematical Model

Traditional calculators assume a fixed static return (e.g. 8% year over year). In reality, market sequence-of-returns risk can deplete a portfolio prematurely.

### Stochastic Differential Equation (Geometric Brownian Motion):
$$W_{t+1} = \left( W_t + S \right) \cdot \exp\left( \left(\mu - \frac{\sigma^2}{2}\right) \Delta t + \sigma \sqrt{\Delta t} \, Z_t \right)$$
Where:
- $W_t$: Portfolio net worth at time $t$
- $S$: Annual net savings contribution
- $\mu$: Expected average market return (e.g. 10%)
- $\sigma$: Annualized market standard deviation / volatility (e.g. 15%)
- $Z_t \sim \mathcal{N}(0, 1)$: Standard Gaussian random variable generated via Box-Muller transform

---

## 2. Percentile Confidence Bands

The engine executes 1,000 randomized parallel paths and samples percentile bands at each yearly step:
- **$P_{90}$ (Top 10th Percentile)**: High-growth optimistic scenario.
- **$P_{50}$ (Median Expected)**: Central expected outcome.
- **$P_{10}$ (Lower 10th Percentile)**: Stress-test bear market sequence.

---

## 3. FIRE Target (Rule of 25)
$$\text{FIRE Number} = \frac{\text{Target Annual Retirement Expenses}}{\text{Safe Withdrawal Rate (SWR)}} = \text{Expenses} \times 25 \quad (\text{assuming } 4\% \text{ SWR})$$
