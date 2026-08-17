---
title: Cash Flow Velocity Engine Deep Dive
tags:
  - features
  - analytics
  - cashflow
  - mathematics
version: 3.0.0
last_updated: 2026-08-17
---

# 💸 Cash Flow Velocity & Burn Rate Engine

Located at: `server/src/services/analytics/cashflowService.js`

---

## 1. Core Equations

### 1. Net Cash Flow
$$\text{Net Cash Flow} = \sum_{i=1}^n \text{Income}_i - \sum_{j=1}^m \text{Expense}_j$$

### 2. Savings Rate Percentage
$$\text{Savings Rate} = \left( \frac{\text{Net Cash Flow}}{\text{Total Income}} \right) \times 100$$
- $> 30\%$: Excellent / High Velocity (Green badge `var(--color-mint)`).
- $15\% - 30\%$: Healthy / Standard (Cyan badge `var(--color-cyan)`).
- $0\% - 15\%$: Tight / Vulnerable (Amber badge `var(--color-amber)`).
- $< 0\%$: Deficit / Negative Cashflow (Rose alert `var(--color-rose)`).

### 3. Daily Burn Rate
$$\text{Daily Burn} = \frac{\text{Total Month-to-Date Expenses}}{\text{Current Day of Month}}$$

### 4. Liquidity Runway
$$\text{Runway (Months)} = \frac{\text{Liquid Savings + Emergency Fund}}{\text{Average Monthly Burn Rate}}$$
