---
title: ADR-009 — Adaptive Device Hardware Profiling, Dynamic Feature Tiers & Sovereign Capability Optimization
tags:
  - adr
  - architecture
  - hardware-profiling
  - webgpu
  - adaptive-performance
  - edge-ai
  - optimization
status: accepted
date: 2026-08-18
---

# ADR-009: Adaptive Device Hardware Profiling, Dynamic Feature Tiers & Sovereign Capability Optimization

## Context
Expense Tracker V2 features a continuum of compute-intensive modules:
1. **Local Unlimited-OCR (3B MoE VLM)** requiring $\ge 6\text{ GB}$ VRAM.
2. **In-Browser WebGPU SLMs (Qwen2.5-0.5B / 1.5B via WebLLM)** requiring 400MB–1.1GB RAM and WebGPU shader support.
3. **1,000-Run Stochastic Monte Carlo FIRE Simulations** requiring multi-threaded CPU matrix operations.
4. **Deluxe Glassmorphism & High-FPS Canvas Visualizations** requiring GPU compositor bandwidth.

When accessing the app from low-spec mobile devices or battery-constrained laptops, running heavy on-device models or high-iteration simulations causes UI freezes (high INP), battery drain, or memory crashes. Conversely, high-end workstations are underutilized if forced to rely on cloud APIs.

## Decision
We adopt a **Client-Side Hardware Profiling & Dynamic Tiering Architecture**:

1. **Non-Invasive Hardware Profiler (`deviceCapabilityProfiler.js`)**:
   - Inspects `navigator.gpu`, `navigator.deviceMemory`, `navigator.hardwareConcurrency`, `navigator.storage.estimate()`, `navigator.connection`, and `navigator.getBattery()`.
   - Runs a 30ms single-core WASM float matrix micro-benchmark.
2. **Tiered Capability Allocation**:
   - **Tier 0 (Eco / Low-Spec)**: Cloud API vision/copilot, flat solid CSS, 100-run Monte Carlo simulation, zero heavy downloads.
   - **Tier 1 (Balanced)**: Standard UI blur, 500-run Monte Carlo, optional opt-in in-browser Qwen2.5-0.5B model.
   - **Tier 2 (Sovereign Pro)**: Full local Baidu Unlimited-OCR, in-browser Qwen2.5-1.5B WebLLM, 2,000-run Monte Carlo, 60fps deluxe UI.
3. **User Sovereign Control**:
   - Users can manually override their detected profile anytime via the **Device Performance Card** in `SettingsPage.jsx` ("Force Eco Mode", "Force Sovereign Pro").

Detailed micro-benchmark algorithms and React context code are documented in `[[ADAPTIVE_DEVICE_HARDWARE_PROFILING_AND_CAPABILITY_OPTIMIZATION_RESEARCH]]`.

## Consequences
- **Positive**:
  - Universal hardware compatibility: Smooth 60fps experience on budget phones, while unlocking full sovereign AI power on pro workstations.
  - Zero accidental bandwidth/storage exhaustion: Heavy models (400MB+) require explicit opt-in on metered/low-storage devices.
  - Automatic battery conservation when device charge drops below 20%.
- **Negative**:
  - Requires maintaining tiered implementations of visual effects and simulation batch sizes across components.
