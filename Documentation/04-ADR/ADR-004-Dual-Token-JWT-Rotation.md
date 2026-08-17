---
title: ADR-004 — Dual-Token JWT Authentication with Refresh Token Rotation
tags:
  - adr
  - architecture
  - security
  - auth
status: accepted
date: 2026-08-17
---

# ADR-004: Dual-Token JWT Authentication with Refresh Token Rotation

## Context
Single static JWT tokens stored in localStorage create persistent vulnerability to XSS token theft. Frequent re-logins create poor user experience.

## Decision
We enforce a dual-token lifecycle with cryptographic rotation:
1. **Access Token**: Short 15-minute lifespan. Kept strictly in React memory (`AuthContext`).
2. **Refresh Token**: 7-day lifespan. Persisted as a SHA-256 hash in MongoDB with automatic MongoDB TTL index cleanup.
3. **Rotation On Use**: Every refresh call `/api/auth/refresh` revokes the previous refresh token and issues a fresh pair. If a revoked token is replayed, all refresh tokens for that user session are invalidated (Replay Attack Defense).

## Consequences
- **Positive**: Eliminates persistent session theft while preserving seamless background token renewal.
- **Negative**: Requires handling race conditions in concurrent client requests during refresh.
