---
title: Feature Roadmap & Mathematical Engines Specification
tags:
  - features
  - roadmap
  - mathematics
  - analytics
version: 3.0.0
last_updated: 2026-08-17
---

# 🚀 Feature Roadmap & Mathematical Engines Specification

---

## 1. Mathematical Formulas & Engine Definitions

### 1. Cash Flow Velocity & Burn Rate (`cashflowService.js`)
$$\text{Net Cash Flow} = \sum \text{Income} - \sum \text{Expenses}$$
$$\text{Savings Rate (\%)} = \left( \frac{\text{Net Cash Flow}}{\text{Total Income}} \right) \times 100$$
$$\text{Daily Burn Rate} = \frac{\text{Total Monthly Expenses}}{\text{Days Elapsed}}$$
$$\text{Runway (Months)} = \frac{\text{Total Liquid Savings}}{\text{Average Monthly Burn}}$$

---

### 2. 5-Pillar Financial Health Scorecard (0–100) (`financialHealthEngine.js`)

$$\text{Health Score} = w_1 S_{\text{Emergency}} + w_2 S_{\text{SavingsRate}} + w_3 S_{\text{DebtRatio}} + w_4 S_{\text{BudgetAdherence}} + w_5 S_{\text{InvestmentVelocity}}$$

| Pillar | Weight ($w_i$) | Benchmark Target | Score Function |
| :--- | :--- | :--- | :--- |
| **1. Emergency Fund** | 25% | 6 Months of Living Expenses | $\min(100, (\text{Months Saved} / 6) \times 100)$ |
| **2. Savings Rate** | 25% | $\ge 30\%$ of Net Income | $\min(100, (\text{Savings Rate} / 30) \times 100)$ |
| **3. Debt-to-Income (DTI)** | 20% | $\le 20\%$ DTI | $\max(0, 100 - (\text{DTI} \times 3))$ |
| **4. Budget Adherence** | 15% | 0 Unplanned Overspends | $100 - (\text{Overbudget Count} \times 20)$ |
| **5. Goal Velocity** | 15% | On-track for active goals | Progress % against timeline |

---

### 3. Minimum Cash Flow Graph Simplifier (`debtSimplificationEngine.js`)
- **Problem**: In a group of $N$ people with multiple shared bills, arbitrary peer-to-peer debts create up to $\frac{N(N-1)}{2} = O(N^2)$ transactions.
- **Solution**: Compute net balance $B_i = \text{Paid}_i - \text{Owed}_i$ for every member.
- Match maximum debtor with maximum creditor iteratively:
  $$\text{Transfer}(D_{\text{max}} \to C_{\text{max}}, \min(|B_{D}|, B_C))$$
- **Outcome**: Reduces transactions strictly to at most $N-1$ transfers.

---

### 4. Stochastic Monte Carlo Wealth & FIRE Simulator (`fireSimulatorEngine.js`)
- **FIRE Target (Rule of 25)**:
  $$\text{FIRE Number} = \frac{\text{Annual Living Expenses}}{\text{Safe Withdrawal Rate (e.g. 0.04)}} = \text{Annual Expenses} \times 25$$
- **Monte Carlo Engine**: Runs 1,000 simulations with geometric Brownian motion over $T$ years:
  $$W_{t+1} = (W_t + S) \times \left(1 + \mu + \sigma \cdot Z\right), \quad Z \sim \mathcal{N}(0, 1)$$
  Where $W_t$ = Net Worth, $S$ = Annual Savings, $\mu$ = Expected Return, $\sigma$ = Volatility.
- Outputs distribution percentiles: $P_{10}$ (pessimistic), $P_{50}$ (median), $P_{90}$ (optimistic).
