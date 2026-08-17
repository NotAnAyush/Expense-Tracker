---
title: Known Gotchas, Anti-Patterns & Troubleshooting
tags:
  - tasks
  - troubleshooting
  - gotchas
  - debugging
version: 3.0.0
last_updated: 2026-08-17
---

# ⚠️ Known Gotchas, Anti-Patterns & Troubleshooting

---

## 1. Backend Port & Process Gotchas
- **Port 5000 Collision**: If the server fails with `EADDRINUSE: address already in use :::5000`, terminate orphan node processes using `taskkill /F /IM node.exe` (Windows PowerShell).
- **Node ESM vs CommonJS**: `server/package.json` uses `"type": "module"`. All imports must include file extensions: `import { x } from './file.js';`.

---

## 2. MongoDB & Database Gotchas
- **TTL Index Timing**: MongoDB TTL background monitor runs once every 60 seconds; refresh tokens may linger for up to 60s post expiration before automatic document purging.
- **ObjectId Casting**: In custom aggregate pipelines, string IDs must be explicitly wrapped in `new mongoose.Types.ObjectId(id)`.

---

## 3. Frontend & Vite Gotchas
- **API Base URL**: Client Axios instance defaults to `http://localhost:5000/api`. Ensure backend server is running before testing authenticated endpoints.
- **Privacy Shield Blur**: If numbers appear blurred unexpectedly, check if `Alt+P` was accidentally pressed.
