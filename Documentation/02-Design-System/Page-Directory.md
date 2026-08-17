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
| **`DashboardPage.jsx`** | `/` or `/dashboard` | Yes | High-level financial cockpit, net worth KPI cards, recent transactions feed, quick-action loggers, radial health score preview. |
| **`AnalyticsPage.jsx`** | `/analytics` | Yes | Category breakdown donuts, monthly income vs expense bars, daily cashflow velocity burn rate chart, tax deduction summary. |
| **`ExpensesPage.jsx`** | `/expenses` | Yes | Paginated expense table, advanced multi-filter (category, date range, payment method, tax-deductible flag), bulk CSV export, receipt OCR modal. |
| **`BudgetsPage.jsx`** | `/budgets` | Yes | Category-wise monthly spend caps, visual progress bars with dynamic color shifts (Mint $\to$ Amber $\to$ Rose), overspend alerts. |
| **`GoalsPage.jsx`** | `/goals` | Yes | Savings goals targets, visual fund milestone trackers, one-click contribution modal. |
| **`RecurringPage.jsx`**| `/recurring` | Yes | Subscription manager, upcoming bill calendar preview, annual billing cost projections. |
| **`DebtPayoffPage.jsx`**| `/debts` | Yes | Side-by-side Snowball vs Avalanche amortization simulator, interest saved calculator, extra monthly payment acceleration slider. |
| **`GroupSplitPage.jsx`**| `/groups` | Yes | Shared split bill ledger, Minimum Cash Flow graph transfer solver, instant UPI Intent QR code popup modal. |
| **`WealthSimulatorPage.jsx`**| `/wealth-simulator` | Yes | 1,000-run stochastic Monte Carlo trajectory simulator, Rule-of-25 FIRE retirement target calculator, interactive risk sliders. |
| **`TripVaultPage.jsx`** | `/trip-vaults` | Yes | Dedicated travel budget vaults, multi-currency conversion, local currency expense tagging, trip burn rate. |
| **`ProfilePage.jsx`** | `/profile` | Yes | Comprehensive user preferences, currency selector, security settings, avatar customization, export data tools. |
| **`SettingsPage.jsx`** | `/settings` | Yes | Appearance toggles, notification settings, privacy shield defaults, audit log history viewer. |
| **`AuthPage.jsx`** | `/login`, `/register` | No | Luxury fintech login/signup interface with animated tab switcher, instant password strength meter, remember-me. |
