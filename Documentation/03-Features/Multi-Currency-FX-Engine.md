---
title: Multi-Currency Foreign Exchange (FX) Engine
tags:
  - features
  - fx
  - currencies
  - travel
version: 3.0.0
last_updated: 2026-08-17
---

# 🌍 Multi-Currency Foreign Exchange (FX) Engine

Located at: `server/src/services/fx/fxService.js`

---

## 1. Supported Base & Target Currencies

- **Base Supported**: `INR` (₹), `USD` ($), `EUR` (€), `GBP` (£), `JPY` (¥), `CAD` ($), `AUD` ($), `SGD` ($), `AED` (د.إ).
- **Caching Mechanism**: Rates are fetched from free reliable FX exchange feeds and cached in-memory with a 1-hour expiration timestamp to eliminate network latency.

---

## 2. Trip Vault Isolation & Conversion

When a user creates a `TripVault` (e.g. "Tokyo Vacation 2026", Base: `INR`, Target: `JPY`):
1. The user logs receipts in `JPY`.
2. The `TripVault` stores the raw foreign expense and automatically converts to `INR` based on the locked trip exchange rate or live spot rate.
3. Dashboards continue to display the user's primary net worth in their native currency without distortion.
