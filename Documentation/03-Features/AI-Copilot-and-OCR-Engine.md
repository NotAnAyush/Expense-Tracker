---
title: AI Copilot & Vision Receipt OCR Engine
tags:
  - features
  - ai
  - gemini
  - ocr
  - rag
version: 3.0.0
last_updated: 2026-08-17
---

# 🤖 AI Copilot & Vision Receipt OCR Engine

Located at: `server/src/services/ai/`

---

## 1. Multimodal Receipt OCR Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User as Client (Image Upload)
    participant Route as /api/ai/ocr-receipt
    participant Service as receiptOcrService.js
    participant Gemini as Gemini 2.5 Flash API
    participant Regex as Offline Fallback Parser
    participant DB as MongoDB Expense Model

    User->>Route: POST multipart/form-data (image)
    Route->>Service: Validate Buffer & MIME type
    alt Online & API Key Available
        Service->>Gemini: Base64 Image + Structured JSON Schema Prompt
        Gemini-->>Service: { merchant, totalAmount, date, category, taxDeductible }
    else Offline or Rate Limited
        Service->>Regex: Tesseract / Offline Regex Fallback
        Regex-->>Service: Best-effort Extracted Metadata
    end
    Service-->>User: Pre-populated Form Preview
    User->>DB: Confirm & Save Transaction
```

---

## 2. Deterministic RAG Context Architecture (`contextBuilder.js`)
When user chats with the AI copilot:
1. `contextBuilder.js` queries MongoDB for high-level aggregate numbers:
   - Total income, monthly expense total, top 3 spending categories, active debt balances, health score.
2. Injects this numerical context directly into Gemini's system instructions.
3. Model is explicitly constrained:
   > *"You are Richy, a sovereign financial intelligence copilot. Use ONLY the user's verified metrics provided below. Never make up balances or calculate totals on your own."*
