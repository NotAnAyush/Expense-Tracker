---
title: UX Flows, Interactions & Keyboard Shortcuts
tags:
  - design-system
  - ux
  - shortcuts
  - interaction
version: 3.0.0
last_updated: 2026-08-17
---

# ⌨️ UX Flows, Micro-Interactions & Keyboard Shortcuts

---

## 1. Global Keyboard Shortcuts

| Shortcut Key | Scope | Action Triggered |
| :--- | :--- | :--- |
| `Alt + P` | Global | **Privacy Shield**: Instantly toggles blur filter (`.privacy-blur`) over sensitive financial values. |
| `Ctrl + /` or `Cmd + /` | Global | **Quick Command Search**: Focuses search bar or opens global navigation quick-actions. |
| `Escape` | Global | Closes any open modal dialog (Expense, Income, OCR, UPI Settlement). |
| `Enter` | Form Modals | Submits current active form if validation criteria pass. |

---

## 2. Micro-Interactions & Animation Patterns

- **Button Press Physics**: `transform: scale(0.98)` on `:active` with smooth spring transition `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Card Hover Elevation**: `transform: translateY(-2px)` + subtle border brightness boost (`--border-glass-bright`).
- **Modal Entry**: Fade-in with slight upward slide (`translateY(16px) \to translateY(0px)`).
- **Number Counters**: Smooth animated odometer transitions on KPI value increments.
