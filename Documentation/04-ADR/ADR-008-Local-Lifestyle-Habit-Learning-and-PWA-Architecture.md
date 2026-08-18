---
title: ADR-008 — Local Lifestyle & Habit Learning Engine and Sovereign Web App (PWA) Architecture
tags:
  - adr
  - architecture
  - behavioral-finance
  - habit-learning
  - pwa
  - webapp
  - local-first
  - sovereign
status: accepted
date: 2026-08-18
---

# ADR-008: Local Lifestyle & Habit Learning Engine and Sovereign Web App (PWA) Architecture

## Context
As Expense Tracker V2 transitions from an API-coupled tool into a comprehensive financial operating system, two requirements emerge:
1. **Local Lifestyle & Habit Intelligence**: Users want deep, personalized insights into their spending psychology, income cadence ($C_v$), payday euphoria decay curves, late-night impulse buying, and lifestyle inflation ($\mathcal{L}_{\text{inf}}$) without sending private transaction histories or personal habits to third-party cloud servers.
2. **Web Application Transformation**: The application must run as an installable, offline-capable, responsive **Web Application (PWA)** that operates seamlessly on desktop, tablet, and mobile with zero loading latency, offline local storage, and hardware API access (camera receipt capture, WebAuthn biometrics, push nudges, Web Share Target).

## Decision
We adopt a **Dual-Platform Sovereign Architecture** backed by an **On-Device Habit Learning Engine**:

1. **Local Lifestyle & Habit Learning Engine (`lifestyleHabitEngine.js`)**:
   - Executes 100% on the user's device in JavaScript/WASM.
   - Calculates income cadence stability, payday euphoria decay fits, temporal weekend/late-night biases, discretionary burn elasticity, and lifestyle inflation indices.
   - Persists habit vectors and profiles in encrypted on-device storage (`OPFS` / `IndexedDB` with AES-GCM-256 via Web Crypto API).
2. **Progressive Web App (PWA) Conversion**:
   - **Web App Manifest (`manifest.json`)**: Configured with `display: "standalone"`, quick-action shortcuts (Scan Receipt, Add Expense, FIRE Simulator), and `share_target` for direct PDF/image receipt ingestion from other apps.
   - **Multi-Tier Service Worker (`sw.js`)**: Employs `CacheFirst` for static shell/AI models, `StaleWhileRevalidate` for analytics, and `BackgroundSync` (`sync-expenses`) for offline transaction queues.
   - **Hardware & Web APIs**: WebAuthn biometric passkeys, App Badging API, and Web Push notifications.

Detailed mathematical models and code blueprints are documented in `[[LOCAL_LIFESTYLE_HABIT_LEARNING_AND_SOVEREIGN_WEBAPP_ARCHITECTURE]]`.

## Consequences
- **Positive**:
  - Absolute privacy & data sovereignty: Behavioral profiles and habit vectors never leave the user's device.
  - Native app-like experience without app store gatekeepers or download friction.
  - Complete offline resilience: The full application, including habit analysis and local AI, runs without internet connectivity.
  - Proactive behavioral interventions empower users to curb emotional spending spikes before month-end distress.
- **Negative**:
  - Initial service worker caching and local model asset download requires ~400MB of browser storage for in-browser AI features.
  - Requires maintaining local-first synchronization queues between IndexedDB and MongoDB when online.
