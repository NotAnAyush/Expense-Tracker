---
title: ADR-001 — AI-First Architectural Hierarchy & Zero-Hallucination Guardrails
tags:
  - adr
  - architecture
  - ai
  - governance
status: accepted
date: 2026-08-17
---

# ADR-001: AI-First Architectural Hierarchy & Zero-Hallucination Guardrails

## Context
When introducing AI features into financial software, letting an LLM interact directly with the database or act as the primary arithmetic calculation engine introduces severe risks of hallucination, data corruption, and inaccurate financial calculations.

## Decision
We enforce a strict unidirectional architectural hierarchy across all features:

$$\mathbf{Financial\ Data\ Layer\ (DB)} \longrightarrow \mathbf{Deterministic\ Analytics\ Engine} \longrightarrow \mathbf{AI\ Intelligence\ Layer} \longrightarrow \mathbf{User\ Actions}$$

1. **Deterministic Financial Truth**: All additions, subtractions, debt graphs, Monte Carlo simulations, and tax calculations MUST be computed by deterministic Node.js / math engines.
2. **AI as Explanation & Interface**: The AI Copilot (Gemini Flash) receives pre-calculated deterministic metrics (e.g. Health Score = 84/100, DTI = 12%) and is responsible solely for explaining, summarizing, and recommending user actions.
3. **No Direct Write**: AI services cannot write directly to the database without explicit schema validation and user confirmation.

## Consequences
- **Positive**: Eliminates mathematical hallucinations. Guaranteed accurate financial calculations. Testable with standard unit tests (Jest).
- **Negative**: Requires writing deterministic service engines for each new financial metric before exposing them to AI.
