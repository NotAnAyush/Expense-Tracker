---
title: ADR-006 — Local Fallback Receipt Parsing via Baidu Unlimited-OCR and Specialized SLM Pipeline
tags:
  - adr
  - architecture
  - ocr
  - slm
  - unlimited-ocr
  - privacy
  - offline-first
status: accepted
date: 2026-08-18
---

# ADR-006: Local Fallback Receipt Parsing via Baidu Unlimited-OCR and Specialized SLM Pipeline

## Context
Receipt and invoice scanning currently relies on cloud multimodal APIs (Google Gemini 2.5 Flash / OpenAI GPT-4o-mini). While fast and accurate, this creates critical failure modes:
1. **Network Outages & Offline Usage**: Users without internet access cannot process digital or printed receipts.
2. **API Rate Limiting & Outages**: Cloud 429 rate limit or service disruptions halt receipt ingestion.
3. **Data Privacy & Air-Gap Compliance**: Sensitive medical invoices (80D) and high-value corporate GST bills contain PII that privacy-conscious users prefer not to transmit to cloud providers.
4. **Complex Multi-Page & Thermal Bills**: Traditional CPU OCR (Tesseract / pure regex) fails on skewed thermal paper, complex GST grids, and multi-page invoices.

## Decision
We adopt a **2-Stage Modular Local Fallback Architecture**:
1. **Stage 1 (Perception): Baidu Unlimited-OCR (3B MoE VLM)**:
   - Utilizes Reference Sliding Window Attention (R-SWA) to transcribe receipts, tables, and multi-page bills directly into clean, layout-preserved Markdown and GFM tables with constant $O(1)$ KV cache memory.
2. **Stage 2 (Structuring): Local Small Language Model (SLM - Qwen2.5-1.5B-Instruct)**:
   - Ingests the OCR Markdown and converts it into strict JSON adhering to the `Expense` database schema using **GBNF Grammar-Constrained Decoding**.
3. **Cascading Dispatcher Strategy**:
   $$\text{Cloud Primary (Gemini 2.5 Flash)} \xrightarrow{\text{fallback}} \text{Local GPU (Unlimited-OCR + Qwen2.5-1.5B)} \xrightarrow{\text{fallback}} \text{Local CPU (Tesseract + Regex)}$$

Detailed technical benchmarks and microservice design are documented in `[[LOCAL_UNLIMITED_OCR_AND_SLM_BILL_PARSING_RESEARCH]]`.

## Consequences
- **Positive**:
  - 100% data sovereignty and offline capability for air-gapped environments.
  - Zero token cost per scan during local fallback.
  - Complete elimination of multi-page KV cache explosion via R-SWA.
  - 100% valid JSON guarantee via grammar constraints.
- **Negative**:
  - Requires a local Python Sidecar microservice with GPU acceleration (CUDA, $\ge 6\text{ GB}$ VRAM for BF16 or quantized models) on the host machine for Tier 2 fallback.
  - Cold-start latency for the local model pipeline (~1.5s–2.5s) is slightly higher than cloud APIs (~600ms).
