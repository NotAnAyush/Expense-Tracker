---
title: API Contracts Specification
tags:
  - architecture
  - api
  - rest
  - contracts
version: 3.0.0
last_updated: 2026-08-17
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

## 3. Analytics & Intelligence (`/analytics`, `/simulation`, `/ai`)

| Method | Endpoint | Auth | Request Params / Body | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/analytics/cashflow` | Yes | `?period=monthly` | Net cash flow, burn rate, runway & savings % |
| `GET` | `/analytics/health-score` | Yes | - | 5-Pillar Score (0–100) + radial dial breakdown |
| `POST` | `/simulation/monte-carlo` | Yes | `{ currentNetWorth, monthlySavings, years, returnRate, volatility }` | 1,000-run stochastic simulation ($P_{10}, P_{50}, P_{90}$) |
| `POST` | `/simulation/fire` | Yes | `{ annualExpenses, swrPercent, currentSavings, returnRate }` | Rule-of-25 FIRE target & retirement year |
| `POST` | `/ai/ocr-receipt` | Yes | `FormData: file (image)` | Multimodal Gemini receipt OCR structured parsing |
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

## 5. Travel & Vaults (`/trip-vaults`, `/fx`, `/vault`)

| Method | Endpoint | Auth | Request Payload | Description |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/trip-vaults` | Yes | - | List vacation budget vaults |
| `POST` | `/trip-vaults` | Yes | `{ tripName, destination, baseCurrency, targetCurrency, budgetTotal }` | Create trip vault |
| `GET` | `/fx/rates` | Yes | `?base=INR` | Real-time foreign exchange conversion table |
| `POST` | `/vault/unlock` | Yes | `{ masterPassphrase }` | Decrypt client-side encrypted secret vault |
| `POST` | `/vault/save` | Yes | `{ encryptedPayload, iv, authTag }` | Persist encrypted credentials |
