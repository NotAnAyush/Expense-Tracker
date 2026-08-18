---
title: Adaptive Device Capability Profiler & Hardware Optimization
tags:
  - features
  - hardware-profiling
  - webgpu
  - adaptive-performance
  - performance
version: 1.0.0
last_updated: 2026-08-18
---

# ⚡ Adaptive Device Capability Profiler

Located at: `client/src/services/deviceCapabilityProfiler.js` & `client/src/context/DeviceCapabilityContext.jsx`

---

## 1. Overview & Objective
The **Adaptive Device Capability Profiler** inspects client-side hardware and runtime constraints (WebGPU adapter, RAM, CPU cores, battery level, network metering) and executes a 30ms micro-benchmark. It dynamically gates and configures heavy compute modules (local Unlimited-OCR, in-browser WebLLM SLMs, Monte Carlo iteration counts, and UI blur filters) so that **every device receives a buttery-smooth 60fps experience** while high-end devices unlock maximum sovereign AI power.

```mermaid
graph TD
    ClientLoad["Client App Mount"] --> Inspect["Hardware Probing & 30ms WASM Benchmark"]
    Inspect --> TierEval{"Classify Tier"}
    
    TierEval -->|Low RAM / Battery < 20% / Low Score| Tier0["Tier 0: Eco / Low-Spec<br/>(Cloud OCR, Flat Solid CSS, 100 FIRE Runs)"]
    TierEval -->|Balanced Laptop / Modern Mobile| Tier1["Tier 1: Balanced<br/>(Cloud/Lite AI, Standard Blur, 500 FIRE Runs, Opt-in 0.5B SLM)"]
    TierEval -->|WebGPU Discrete / 16GB+ RAM / Pro CPU| Tier2["Tier 2: Sovereign Pro<br/>(Local Unlimited-OCR, In-Browser 1.5B WebLLM, 2000 FIRE Runs, 60fps Deluxe FX)"]
    
    Tier0 & Tier1 & Tier2 --> ReactContext["DeviceCapabilityContext.jsx<br/>(Provides activeTier & feature gates to all components)"]
```

---

## 2. Feature Gating Matrix

| Subsystem / Feature | Tier 0 (Eco) | Tier 1 (Balanced) | Tier 2 (Sovereign Pro) |
| :--- | :--- | :--- | :--- |
| **In-Browser SLM (WebLLM)** | Disabled (Routes to Cloud/Templates) | Optional Opt-In (`Qwen2.5-0.5B`, ~380MB) | Enabled (`Qwen2.5-1.5B`, ~1.1GB) |
| **Receipt OCR Engine** | Cloud Gemini / OpenAI | Cloud Primary | Local Baidu Unlimited-OCR (3B Sidecar) |
| **Monte Carlo FIRE Simulation** | 100 Iterations (Chunked) | 500 Iterations (Web Worker) | 2,000–5,000 Iterations (Multi-Threaded) |
| **Glassmorphism & Blur** | Solid Semi-Opaque CSS | Standard Backdrop Blur | 60fps Deluxe Glassmorphism & Particles |
| **Storage Architecture** | IndexedDB (Dexie.js) | IndexedDB + Vector Store | OPFS (SQLite-WASM) + Full Vector DB |

---

## 3. User Calibration & Manual Override
Users can inspect their hardware scorecard and manually override the detected tier at any time via the **Device Performance Card** in `SettingsPage.jsx`.

* **Reference**: Complete research report in `[[ADAPTIVE_DEVICE_HARDWARE_PROFILING_AND_CAPABILITY_OPTIMIZATION_RESEARCH]]`.
