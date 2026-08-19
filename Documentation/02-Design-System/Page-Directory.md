---
title: Frontend Page Directory & Route Catalog
tags:
  - design-system
  - frontend
  - pages
  - routing
version: 3.0.0
last_updated: 2026-08-17
---

# 📱 Frontend Page Directory & Routing Catalog

Located at: `client/src/pages/`

---

## 1. Complete Page Catalog (13 Pages)

| Page Component | Route Path | Auth Required | Key Features & Visual Components |
| :--- | :--- | :--- | :--- |
| **`DashboardPage.jsx`** | `/#dashboard` | Yes | High-level financial cockpit, net worth KPI cards, recent transactions feed, quick-action loggers, radial health score preview. |
| **`AnalyticsPage.jsx`** | `/#analytics` | Yes | Category breakdown donuts, monthly income vs expense bars, daily cashflow velocity burn rate chart, tax deduction summary. |
| **`ExpensesPage.jsx`** | `/#expenses` | Yes | Paginated expense table, advanced multi-filter (category, date range, payment method, tax-deductible flag), bulk CSV export, receipt OCR modal. |
| **`WealthSimulatorPage.jsx`**| `/#fire` | Yes | Institutional Stochastic Monte Carlo (GBM, Merton Jump Diffusion, Historical Bootstrap), 6-Tier FIRE Spectrum, What-If Sandbox, Executive Quant Brief, and Quant Guide Tutorial Modal. |
| **`PassiveIncomePage.jsx`** | `/#market` | Yes | Real-time NSE/BSE/US market quotes, official RBI T-Bill/G-Sec yields, MoF small savings rates, Scam Shield, DCF intrinsic valuation, and Yield Maturity Calculator. |
| **`FamilyVaultPage.jsx`** | `/#family` | Yes | Multi-User RBAC household shared budget vault, shared grocery/utility expense tracker, spending limits, and isolated private ledgers. |
| **`BudgetsPage.jsx`** | `/#budgets` | Yes | Category-wise monthly spend caps, visual progress bars with dynamic color shifts (Mint $\to$ Amber $\to$ Rose), overspend alerts. |
| **`GoalsPage.jsx`** | `/#goals` | Yes | Savings goals targets, visual fund milestone trackers, one-click contribution modal. |
| **`RecurringPage.jsx`**| `/#recurring` | Yes | Subscription manager, upcoming bill calendar preview, annual billing cost projections. |
| **`DebtPayoffPage.jsx`**| `/#debts` | Yes | Side-by-side Snowball vs Avalanche amortization simulator, interest saved calculator, extra monthly payment acceleration slider. |
| **`GroupSplitPage.jsx`**| `/#splits` | Yes | Shared split bill ledger, Minimum Cash Flow graph transfer solver, instant UPI Intent QR code popup modal. |
| **`TripVaultPage.jsx`** | `/#trips` | Yes | Dedicated travel budget vaults, multi-currency conversion, local currency expense tagging, trip burn rate. |
| **`CustomizationPage.jsx`** | `/#customization` | Yes | Sovereign Modular Feature Flags, Visual Studio, Dashboard Grid density, Currency format, State Snapshots, and Local AI Model Hub. |
| **`ProfilePage.jsx`** | `/#profile` | Yes | Comprehensive user preferences, currency selector, security settings, avatar customization, export data tools. |
| **`SettingsPage.jsx`** | `/#settings` | Yes | Appearance toggles, notification settings, privacy shield defaults, audit log history viewer. |
| **`AuthPage.jsx`** | `/login`, `/register` | No | Luxury fintech login/signup interface with animated tab switcher, instant password strength meter, remember-me. |

