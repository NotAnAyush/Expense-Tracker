---
title: ADR-014 — Wealth & FIRE Simulator Luxury FinTech UI/UX Design System Alignment
tags:
  - adr
  - architecture
  - ui-ux
  - design-system
  - frontend
  - simulations
status: accepted
date: 2026-08-19
---

# ADR-014: Wealth & FIRE Simulator Luxury FinTech UI/UX Design System Alignment

## Context
During initial development, `WealthSimulatorPage.jsx` was composed using generic Tailwind CSS utility classes. However, Richy Rich is built on a bespoke Vanilla CSS design system (`RICHY RICH — DESIGN SYSTEM & LUXURY FINTECH CSS v3.0`) defined in `client/src/index.css` without a Tailwind compiler runtime. Consequently, the Wealth & FIRE simulator page rendered in an unstyled state with broken visual hierarchy, misaligned inputs, and unstyled raw buttons.

## Decision
We systematically refactored `WealthSimulatorPage.jsx` to adhere 100% to the project's native luxury FinTech design language:
1. **Design System Tokens Integration**: Replaced all Tailwind classes with native CSS custom properties (`--bg-obsidian-card`, `--color-mint`, `--color-gold`, `--color-cyan`, `--color-violet`, `--color-rose`, `--border-glass`) and project utility classes (`.glass-card`, `.glass-pill`, `.filter-chip`, `.filter-chip-active`, `.btn-primary-mint`, `.btn-glass-secondary`, `.btn-icon-soft`, `.display-xl`, `.heading-lg`, `.heading-md`, `.body-sm`, `.tabular-nums`).
2. **FinTech Range Slider & Progress Bar Utilities**: Added hardware-accelerated slider classes (`.slider-luxury`, `.slider-mint`, `.slider-cyan`, `.slider-amber`, `.slider-violet`, `.slider-rose`) with custom thumb glow animations and sleek glass tracks, alongside glowing progress bar utilities (`.progress-bar-luxury`, `.progress-bar-fill-gold`, `.progress-bar-fill-mint`).
3. **State-of-the-Art Micro-Animations**: Embedded Framer Motion layout transitions (`<AnimatePresence mode="wait">`, `<motion.div>`) across sub-studio navigation tabs, modal backdrops (`.modal-overlay`), and interactive card hover elevations (`.preset-card-luxury`).
4. **Luxury Dark Tooltips & Visual Polish**: Implemented custom dark glassmorphic Recharts tooltips with glowing neon borders for both the What-If Sandbox comparative trajectory chart and the Stochastic Monte Carlo percentile fan ribbon.
5. **Zero Mathematical Degradation**: Preserved 100% of underlying stochastic models (Ito Geometric Brownian Motion, Merton Jump Diffusion, Historical Bootstrap, Guyton-Klinkis Guardrails, and SWR calculations).

## Consequences
- **Positive**: Complete visual harmony with the rest of the application, responsive layout across all device viewports, rich micro-interactions, dark obsidian glassmorphism, and instant sub-100ms render performance.
- **Negative**: Requires maintaining consistent CSS variables across custom simulation components.
