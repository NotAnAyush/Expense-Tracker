---
title: Environment Variables & Configuration
tags:
  - architecture
  - config
  - env
  - security
version: 3.0.0
last_updated: 2026-08-17
---

# 🔐 Environment Variables & Configuration

Template reference: `.env.example`

---

## 1. Backend Environment Variables (`server/.env`)

| Variable | Required | Default | Purpose / Security Guardrails |
| :--- | :--- | :--- | :--- |
| `PORT` | No | `5000` | Express HTTP listening port |
| `NODE_ENV` | Yes | `development` | `'development'` \| `'production'` \| `'test'` |
| `MONGODB_URI` | Yes | `mongodb://127.0.0.1:27017/expense-tracker-v2` | MongoDB local connection string or Atlas cluster URI |
| `JWT_SECRET` | Yes | - | Secret used for HMAC-SHA256 signature on Access Tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Yes | - | Secret used to sign Refresh Tokens |
| `GEMINI_API_KEY` | Optional | - | Google Gemini API Key for OCR & AI Copilot. **Backend only — never expose to client.** |
| `FRONTEND_URL` | Yes | `http://localhost:5173` | CORS allowed origin for Vite dev server or production domain |

---

## 2. Frontend Configuration (`client/.env`)

| Variable | Required | Default | Purpose |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | No | `http://localhost:5000/api` | Base URL for Axios / Fetch API client |

---

## 3. Anti-Hallucination Guardrail
- Never hardcode API keys or secret tokens inside React client components.
- Any AI API calls must be proxied through the authenticated backend (`/api/ai/*`).
