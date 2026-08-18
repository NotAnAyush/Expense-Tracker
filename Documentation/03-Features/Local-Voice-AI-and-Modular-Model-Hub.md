---
title: Local Sovereign Voice AI & Modular Intelligence Model Hub
tags:
  - features
  - voice
  - ai
  - speech
  - models
  - local-ai
version: 3.6.0
last_updated: 2026-08-18
---

# 🎙️ Local Sovereign Voice AI & Modular Model Management Studio

Located at:
- Voice Interface: `client/src/components/Expenses/VoiceQuickLogModal.jsx`
- Local NLP Parser: `client/src/services/localVoiceAiService.js`
- Model Studio UI: `client/src/components/Customization/LocalAiModelStudio.jsx`
- Master Research: `Documentation/LOCAL_VOICE_AI_AND_ON_DEMAND_MODULAR_INTELLIGENCE_RESEARCH.md`
- Architecture Decision: `Documentation/04-ADR/ADR-013-Local-Voice-AI-and-On-Demand-Modular-Intelligence-Hub.md`

---

## 1. Feature Overview

The **Local Sovereign Voice AI & Modular Model Management Studio** empowers users to speak natural financial transactions ("Paid 450 rupees for lunch via UPI yesterday") and have them parsed deterministically with zero mandatory cloud connectivity.

---

## 2. Real-Time Web Audio Equalizer

Integrated dynamic 24-band frequency spectrum visualizer utilizing the browser `AudioContext` and `AnalyserNode`:
- Frequency binning into 24 animated bars
- Decibel RMS power metering
- Visual feedback rings pulsating in response to acoustic volume

---

## 3. On-Demand Modular AI Model Management Hub

Integrated as the 7th studio tab in `CustomizationPage.jsx`:
- Dynamic download & caching in browser CacheStorage / IndexedDB
- Model benchmarking and memory footprint tracking
- Supported sovereign models:
  - Whisper-Tiny & Whisper-Base
  - Moonshine Web STT
  - Baidu PP-OCRv4
  - Qwen2.5-0.5B & 1.5B Instruct
  - BGE-Micro Embeddings
