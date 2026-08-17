---
title: Security and Middleware Architecture
tags:
  - architecture
  - security
  - middleware
  - zero-trust
version: 3.0.0
last_updated: 2026-08-17
---

# 🛡️ Security & Enterprise Middleware Architecture

This document specifies the defense-in-depth security model implemented in `server/src/middleware/`.

---

## 1. Middleware Execution Pipeline

Every incoming HTTP request traverses this deterministic sequence:

```mermaid
sequenceDiagram
    autonumber
    actor Client as Frontend Client
    participant CORS as CORS & Helmet
    participant Sanitize as Input Sanitizer
    participant Rate as In-Memory Rate Limiter
    participant Auth as JWT Auth Middleware
    participant Idemp as Idempotency Engine
    participant Ctrl as Route Controller & DB
    participant Audit as Structured Audit Logger

    Client->>CORS: HTTP Request
    CORS->>Sanitize: Safe Headers
    Sanitize->>Rate: Strip XSS / NoSQL Injections
    Rate->>Auth: Check IP & Route Quotas (429 if exceeded)
    Auth->>Idemp: Verify Bearer Token & User Context
    Idemp->>Ctrl: Check Idempotency-Key (Prevent duplicate POST)
    Ctrl->>Audit: Process Business Logic & Return JSON
    Audit-->>Client: HTTP Response + Audit Trail Entry
```

---

## 2. Security Subsystems

### 1. Dual-Token JWT Authentication (`authMiddleware.js`)
- **Access Token**: Short-lived (15 minutes), signed with `JWT_SECRET`, carried in `Authorization: Bearer <token>`.
- **Refresh Token**: Long-lived (7 days), persisted as SHA-256 hash in MongoDB (`RefreshToken` collection) with automatic MongoDB TTL index cleanup.
- **Rotation**: On every `/api/auth/refresh` call, the old refresh token is invalidated and a fresh pair is minted.

### 2. Rate Limiting (`rateLimiter.js`)
- Protects public and sensitive endpoints (`/auth/login`, `/auth/register`, `/ai/*`).
- Configurable window (default 15 minutes, 100 requests max per IP; login capped at 10 attempts).

### 3. Idempotency Control (`idempotency.js`)
- Critical for financial operations (adding transactions, processing group settlements).
- Client passes an `Idempotency-Key` header (UUID or hash).
- Cached responses return identical output for 120 seconds if retried, preventing duplicate charges.

### 4. Input Sanitization & NoSQL Injection Guard (`sanitizer.js`)
- Strips any keys containing `$` or `.` from request bodies and query parameters.
- Encodes HTML entities on free-form text inputs to mitigate XSS vulnerabilities.

### 5. Structured Audit Logging (`auditLogger.js`)
- Records security-sensitive operations (`AUTH_LOGIN`, `PASSWORD_RESET`, `TRANSACTION_DELETE`, `VAULT_ACCESS`).
- Logs client IP, User-Agent, user ID, status (`SUCCESS` / `FAILED`), and timestamp to MongoDB `AuditLog` collection.
