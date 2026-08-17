---
title: Component Catalog Specification
tags:
  - design-system
  - react
  - components
  - ui
version: 3.0.0
last_updated: 2026-08-17
---

# 🧩 UI Component Catalog & Interactive States

Located at: `client/src/components/`

---

## 1. Radial Financial Health Dial (`RadialScoreDial.jsx`)
- **Metric**: 0 to 100 Financial Health Score.
- **Visuals**: SVG Arc with conic gradient (`var(--color-rose)` for <50, `var(--color-amber)` for 50-75, `var(--color-mint)` for 75-100).
- **Sub-pillars**: 5 breakdown badges (Emergency Fund, Debt-to-Income, Savings Rate, Budget Adherence, Investment Velocity).

---

## 2. Privacy Shield (`PrivacyShield.jsx`)
- **Hotkey**: `Alt + P` or toggle button in Navbar.
- **Behavior**: Blurs all financial numbers (`.privacy-blur`) using CSS `filter: blur(8px)` while retaining layouts intact for screenshotting or working in public.

---

## 3. Expense & Income Modals (`ExpenseFormModal.jsx`, `IncomeModal.jsx`)
- **Backdrop**: `var(--bg-obsidian-modal)` with spring animation fade-in.
- **Fields**:
  - Category selector with visual icons.
  - Tag pill input with autocomplete.
  - Receipt OCR Drag-and-Drop dropzone (triggers Gemini OCR endpoint).
  - Tax deduction toggle (80C / 80D / GST).

---

## 4. Monte Carlo Simulator Visualizer (`MonteCarloChart.jsx`)
- **Algorithm Output**: 1,000 randomized stochastic return paths.
- **Confidence Intervals Rendered**:
  - $P_{90}$ (Bull Case): Top 10th percentile curve.
  - $P_{50}$ (Expected Median): Central trajectory curve (`var(--color-gold)`).
  - $P_{10}$ (Bear Case): Lower bound resilience curve.
- **Controls**: Sliders for Monthly Savings, Return Rate %, Volatility $\sigma$, and Target Years.

---

## 5. Group Settlement Matrix & UPI QR (`GroupSettlementModal.jsx`)
- **Display**: Minimum Cash Flow graph reduction transfers ($A \to B \text{ amount } X$).
- **Interaction**: Click on transfer $\to$ renders dynamic standard NPCI UPI Intent QR code for zero-friction mobile settlement.
