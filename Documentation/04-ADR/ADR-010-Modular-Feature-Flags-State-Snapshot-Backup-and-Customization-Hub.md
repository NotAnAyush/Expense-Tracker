---
title: ADR-010 — Modular Feature Flags, Memento State Snapshot Backup & Sovereign Customization Hub
tags:
  - adr
  - architecture
  - feature-flags
  - customization-hub
  - state-snapshots
  - memento-pattern
  - dynamic-layout
status: accepted
date: 2026-08-18
---

# ADR-010: Modular Feature Flags, Memento State Snapshot Backup & Sovereign Customization Hub

## Context
As Expense Tracker V2 expands with sophisticated modules (AI Copilot, Local Unlimited-OCR, FIRE Simulator, Debt Optimizer, Travel FX Vaults, Lifestyle Habit Engine, Multi-currency, GST breakdowns), users demand:
1. **Total Customization**: The ability to turn features ON and OFF to fit their personal workflow.
2. **Safety & Zero Data Loss**: Toggling or reorganizing features must never cause accidental data loss or corruption.
3. **Staged Confirmation ("Confirm Changes")**: Changes must remain in a draft buffer until confirmed, preventing unintended side effects while exploring options.
4. **Self-Aware Dynamic Layouts**: When features are disabled, the UI (dashboard, sidebar, transaction tables) must gracefully self-format without empty gaps, visual bugs, or broken layouts.

## Decision
We adopt a **Staged Feature Flag Architecture with Memento State Snapshots**:

1. **Dual-State Staged Configuration (`CustomizationContext.jsx`)**:
   - Maintains `activeConfig` (live) and `stagedConfig` (draft).
   - Any toggles made in the Customization Hub update `stagedConfig` and display the **Staged Confirmation Floating Action Bar**.
2. **Automated 4-Step Atomic Commit Pipeline**:
   - **Step 1 (Pre-Flight Validation)**: Verifies hardware tier compatibility (from ADR-009) and module dependencies.
   - **Step 2 (Pre-Sync Snapshot)**: Automatically creates an encrypted, timestamped Memento state snapshot in `IndexedDB` (`richy_state_snapshots`) before applying changes.
   - **Step 3 (Atomic State Mutation & API Sync)**: Updates `activeConfig`, writes to local storage, and syncs to MongoDB.
   - **Step 4 (Self-Aware Dynamic Layout Re-Formatting)**: Dashboard widgets and navigation items re-grid using CSS Grid `dense` packing and Framer Motion FLIP layout animations.
3. **Best-in-Class Customization Hub (`CustomizationPage.jsx`)**:
   - 5 specialized studio tabs: *Feature Modules*, *Visual Theme Studio*, *Dashboard Layout Studio*, *Currency & Regional Preferences*, and *State Snapshot & Backup Vault*.

Detailed schemas, code blueprints, and research benchmarks are documented in `[[MODULAR_FEATURE_FLAG_ENGINE_AND_STATE_SNAPSHOT_CUSTOMIZATION_HUB_RESEARCH]]`.

## Consequences
- **Positive**:
  - Full user agency: Users can configure a minimalist ledger or a maximalist financial command center.
  - Zero risk: Automated pre-sync snapshots guarantee instant 1-click rollback if any customization causes unexpected behavior.
  - Clean visual harmony: The UI dynamically self-heals its layout without empty grid slots or jarring page reloads.
  - Historical data preservation: Disabling a module hides its UI components while preserving historical records safely in MongoDB.
- **Negative**:
  - Requires maintaining component-level guards (`if (!modules.fireSimulator) return null;`) across pages.
