---
title: ADR-007 — Local Financial Small Language Models (SLMs) for Sovereign Intelligence & Zero-Outage Fallback
tags:
  - adr
  - architecture
  - slm
  - finance
  - local-ai
  - qwen
  - ollama
  - fallback
status: accepted
date: 2026-08-18
---

# ADR-007: Local Financial Small Language Models (SLMs) for Sovereign Intelligence & Zero-Outage Fallback

## Context
Financial intelligence features in Expense Tracker V2 (Monthly Summaries, "Why Did My Spending Change?", Copilot Q&A, and Anomaly Insights) rely on cloud LLM APIs (Gemini 2.5 Flash / OpenAI GPT-4o-mini).
This introduces key operational risks:
1. **API Key Depletion & Rate Limits (HTTP 429)**: Users running on free-tier keys or experiencing traffic spikes face sudden degradation.
2. **Data Sovereignty & Offline Usage**: Users traveling without connectivity or wishing to keep financial records completely offline cannot access natural language insights.
3. **Rigid Static Templates**: The current zero-AI fallback (`localRagEngine.js`) uses static string concatenation, which lacks the empathy, flexibility, and natural language understanding needed for conversational Q&A.

## Decision
We adopt a **3-Tier Intelligent Cascading AI Architecture** utilizing lightweight **Local Small Language Models (SLMs)** in the 0.5B to 3.8B parameter range:
1. **Tier 1 (Cloud Frontier AI)**: Google Gemini 2.5 Flash / OpenAI GPT-4o-mini (sub-second latency, zero local compute).
2. **Tier 2 (Local Host SLM Fallback)**: **Qwen2.5-1.5B-Instruct** (or Llama-3.2-1B/3B) running via Ollama (`http://127.0.0.1:11434`) or embedded Python sidecar.
3. **Tier 2B (Optional In-Browser Client SLM)**: **Qwen2.5-0.5B-Instruct** running via WebGPU (`@mlc-ai/web-llm`) directly inside the browser with zero server install.
4. **Tier 3 (Deterministic Local Template Engine)**: `localRagEngine.js` rule-based templates if no AI engine is active.

### Strict Arithmetic Boundary Enforcement (ADR-001)
SLMs are **never tasked with raw arithmetic calculation**. All additions, delta calculations, burn rates, debt graphs, and Monte Carlo simulations are pre-calculated by deterministic Node.js engines (`analyticsService.js`, `cashflowService.js`). The SLM receives verified numerical facts and focuses strictly on **narrative explanation, tone management, categorization, and contextual advice**.

Detailed benchmarks and code blueprints are documented in `[[LOCAL_FINANCIAL_SLM_INTELLIGENCE_AND_FALLBACK_RESEARCH]]`.

## Consequences
- **Positive**:
  - Zero-outage resilience: App gracefully maintains full conversational and analytical intelligence when cloud APIs fail or are offline.
  - Complete privacy for sovereign financial data.
  - Tiny footprint: 4-bit quantized Qwen2.5-1.5B consumes only ~1.1 GB of RAM and generates 55–75 tokens/sec on modern CPUs.
  - Zero hallucinations due to deterministic context injection and boundary enforcement.
- **Negative**:
  - Running local host SLMs requires local RAM overhead (~1.1 GB) when enabled.
  - In-browser WebGPU models require initial one-time download (~400MB) cached into browser IndexedDB.
