---
title: ADR-002 — Graphify AST Code Graph Integration with Obsidian SSOT
tags:
  - adr
  - architecture
  - graphify
  - ast
status: accepted
date: 2026-08-17
---

# ADR-002: Graphify AST Code Graph Integration with Obsidian SSOT

## Context
As the project scaled to over 20 route modules, 14 data models, and 13 frontend pages, AI coding assistants needed an exact, deterministic topological map of code symbols, call graphs, and imports to prevent hallucinating non-existent modules or functions.

## Decision
We integrate **Graphify** (`graphify-out/`) alongside **Obsidian** (`Documentation/`):
1. **Graphify Role**: Automatically parses Abstract Syntax Trees (AST), generating `graph.json` and interactive `graph.html` (1,999+ nodes, 2,721+ edges mapped).
2. **Obsidian Role**: Serves as the human-curated functional specification, UI tokens, acceptance criteria, and ADR vault.
3. **Synchronization**: After making code edits, running `graphify update .` updates the AST graph with zero LLM API cost.

## Consequences
- **Positive**: Antigravity navigates exact symbol paths without reading dozens of raw files. Zero confusion on imports.
- **Negative**: Requires running `graphify update .` after code modifications.
