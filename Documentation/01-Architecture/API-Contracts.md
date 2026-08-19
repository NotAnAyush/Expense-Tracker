---
title: API Contracts Specification
tags:
  - architecture
  - api
  - rest
  - contracts
version: 3.7.0
last_updated: 2026-08-18
---

# ⚡ API Contracts & Endpoint Specification

Base URL: `http://localhost:5000/api`  
Auth Header: `Authorization: Bearer <accessToken>`

---

## 1. Authentication & Profile (`/auth`, `/users`)

| Method | Endpoint | Auth | Request Body | Response (Success) |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | No | `{ name, email, password, currency? }` | `{ user, accessToken, refreshToken }` |
| `POST` | `/auth/login` | No | `{ email, password }` | `{ user, accessToken, refreshToken }` |
| `POST` | `/auth/refresh` | No | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| `POST` | `/auth/logout` | Yes | `{ refreshToken }` | `{ message: "Logged out" }` |
| `GET` | `/users/profile` | Yes | - | `{ user }` |
| `PUT` | `/users/profile` | Yes | `{ name?, currency?, theme?, preferences? }` | `{ user }` |
| `PUT` | `/users/password` | Yes | `{ currentPassword, newPassword }` | `{ message: "Password updated" }` |

---

## 2. Core Ledger (`/expenses`, `/incomes`, `/budgets`, `/goals`, `/categories`)

| Method | Endpoint | Auth | Query / Body | Response (Success) |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/expenses` | Yes | `?page=&limit=&category=&startDate=&endDate=&search=` | `{ expenses, total, page, pages }` |
| `POST` | `/expenses` | Yes | `{ title, amount, category, date, paymentMethod, tags }` | `{ expense }` |
| `PUT` | `/expenses/:id` | Yes | `{ title?, amount?, category?, date?, paymentMethod? }` | `{ expense }` |
| `DELETE` | `/expenses/:id` | Yes | - | `{ message: "Expense deleted" }` |
| `GET` | `/incomes` | Yes | `?startDate=&endDate=` | `{ incomes, total }` |
| `POST` | `/incomes` | Yes | `{ source, amount, date, frequency, account }` | `{ income }` |
| `DELETE` | `/incomes/:id` | Yes | - | `{ message: "Income deleted" }` |
| `GET` | `/budgets` | Yes | `?month=YYYY-MM` | `{ budgets, totalBudget, totalSpent }` |
| `POST` | `/budgets` | Yes | `{ category, amount, month }` | `{ budget }` |
| `GET` | `/goals` | Yes | - | `{ goals }` |
| `POST` | `/goals` | Yes | `{ name, targetAmount, currentAmount, targetDate }` | `{ goal }` |
| `PUT` | `/goals/:id/contribute` | Yes | `{ amount }` | `{ goal }` |

---

## 3. Analytics, Simulations & AI (`/analytics`, `/simulations`, `/ai`)

| Method | Endpoint | Auth | Request Params / Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/analytics/cashflow` | Yes | `?period=monthly` | Net cash flow, burn rate, runway & savings % |
| `GET` | `/analytics/health-score` | Yes | - | 5-Pillar Score (0–100) + radial dial breakdown |
| `GET` | `/simulations/context` | Yes | - | Baseline financial metrics, 6-tier FIRE targets & initial Monte Carlo |
| `POST` | `/simulations/what-if` | Yes | `{ currentMonthlyIncome, currentMonthlyExpense, currentNetWorth, deltaIncome, deltaExpense, deltaOneTime, annualReturnPct, annualStepUpPct, timedEvents }` | Multi-scenario compounding projections over 1 to 30 years |
| `POST` | `/simulations/monte-carlo` | Yes | `{ currentNetWorth, monthlyContribution, annualExpenseWithdrawal, years, expectedReturn, volatility, inflation, runs, model, phase, assetAllocation, stepUpPct, glidePathEnabled, guardrailsEnabled }` | Institutional 1k–50k path simulation ($P_5$ to $P_{95}$, VaR 95%, CVaR, Survival %) |
| `POST` | `/ai/ocr-receipt` | Yes | `FormData: file (image)` | Multimodal receipt OCR structured parsing |
| `POST` | `/ai/chat` | Yes | `{ message, conversationHistory }` | Deterministic RAG financial copilot advice |

---

## 4. Social Splits & Debt Freedom (`/groups`, `/debts`, `/upi`)

| Method | Endpoint | Auth | Request Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/groups` | Yes | - | List user groups with balance summaries |
| `POST` | `/groups` | Yes | `{ name, members: [{ name, email, upiId }] }` | Create split ledger group |
| `POST` | `/groups/:id/expenses` | Yes | `{ description, amount, paidBy, splitBetween }` | Add group expense |
| `GET` | `/groups/:id/simplify` | Yes | - | Minimum Cash Flow Graph reduction ($O(N^2) \to N-1$) |
| `GET` | `/debts` | Yes | - | List all user debts |
| `POST` | `/debts` | Yes | `{ name, principal, interestRate, minimumPayment, dueDate }` | Create debt |
| `POST` | `/debts/simulate` | Yes | `{ extraMonthlyPayment, strategy: 'snowball' \| 'avalanche' }` | Payoff schedule comparison matrix |
| `POST` | `/upi/generate-qr` | Yes | `{ payeeVpa, payeeName, amount, note }` | Dynamic standard NPCI UPI Intent QR code |

---

## 5. Travel, Multi-Currency FX & Vaults (`/trips`, `/fx`, `/vault`)

| Method | Endpoint | Auth | Request Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/trips` | Yes | - | List travel budget vaults |
| `POST` | `/trips` | Yes | `{ name, destination, tripCurrency, budgetBaseCurrency }` | Create trip vault |
| `POST` | `/trips/:id/expenses` | Yes | `{ description, foreignAmount, currency, category, syncToExpenses }` | Log trip expense with auto FX conversion |
| `GET` | `/fx/rates` | Yes | `?base=INR&refresh=true` | Multi-tier live foreign exchange rates table (OpenER + Frankfurter + Yahoo Forex) |
| `POST` | `/fx/convert` | Yes | `{ amount, fromCurrency, toCurrency, forceRefresh }` | Real-time cross-currency conversion |
| `POST` | `/vault/unlock` | Yes | `{ masterPassphrase }` | Decrypt client-side encrypted secret vault |
| `POST` | `/vault/save` | Yes | `{ encryptedPayload, iv, authTag }` | Persist encrypted credentials |

---

## 6. Stock Market, Sovereign Radar & Passive Income (`/market`)

| Method | Endpoint | Auth | Request Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/market/quotes` | Yes | `?symbols=NIFTY50,RELIANCE,AAPL,GOLD,USDINR&refresh=true` | Live exchange quotes for pre-registered and dynamic custom tickers |
| `GET` | `/market/schemes` | Yes | `?refresh=true` | Sovereign scheme radar (T-Bills, SGBs, Post Office, Bank FDs) with dynamic real yields |
| `GET` | `/market/macro` | Yes | `?refresh=true` | Real-time macroeconomic indicators (RBI Repo, CPI Inflation, 10Y Sovereign Yield, Gold Spot) |
| `POST` | `/market/calculate-maturity` | Yes | `{ principal, annualRatePercent, tenorYears, compounding, isSeniorCitizen }` | Accurate compound maturity & interest breakdown |
| `POST` | `/market/scam-check` | Yes | `{ schemeName, promisedReturnPercent, returnFrequency, hasReferralCommission, isRegulatedBySebiOrRbi }` | Forensic fraud & Ponzi probability score (0–100) |
| `POST` | `/market/dcf-valuation` | Yes | `{ currentFCF, growthRateStage1, growthRateStage2, discountRateWACC, terminalGrowthRate, sharesOutstanding, netDebt, currentPrice }` | 2-Stage Discounted Cash Flow intrinsic fair value |
| `POST` | `/market/arbitrage-solve` | Yes | `{ surplusMonthlyCash, debtBalance, debtInterestRatePercent, expectedEquityReturnPercent, capitalGainsTaxRatePercent, emergencyFundCoveredMonths }` | Optimal monthly routing between accelerated debt payoff and equity SIP |
