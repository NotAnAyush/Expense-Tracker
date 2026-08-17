---
title: ADR-005 — Custom Vanilla CSS Tokens vs Tailwind Utility Bloat
tags:
  - adr
  - architecture
  - css
  - design-system
status: accepted
date: 2026-08-17
---

# ADR-005: Custom Vanilla CSS Tokens vs Tailwind Utility Bloat

## Context
Fintech applications require ultra-refined visual polish, dark obsidian glassmorphism, animated glow effects, and custom chart themes. Heavy utility frameworks often create noisy JSX markup and difficulty managing unified CSS custom property themes.

## Decision
We implement a bespoke Vanilla CSS design system (`client/src/index.css`):
1. Curated design tokens (`--bg-obsidian`, `--color-mint`, `--border-glass`) exposed on `:root`.
2. Standardized component utility classes (`.btn-primary`, `.glass-card`, `.stat-badge`).
3. Hardware-accelerated CSS animations for micro-interactions.

## Consequences
- **Positive**: Clean React JSX, zero Tailwind compile steps, instant theme switching, predictable stylesheet debugging.
- **Negative**: Requires maintaining consistent CSS variable naming across all pages.
