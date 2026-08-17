---
title: ADR-003 — Zero-Knowledge Client-Side Encrypted Secret Vault
tags:
  - adr
  - architecture
  - security
  - encryption
status: accepted
date: 2026-08-17
---

# ADR-003: Zero-Knowledge Client-Side Encrypted Secret Vault

## Context
Users store sensitive notes, bank account identifiers, and secret PINs in the application. Storing these in plaintext in MongoDB creates significant data breach risks.

## Decision
We implement a zero-knowledge encrypted vault (`SecretVault.js`):
1. User provides a Master Passphrase in the frontend client.
2. Web Crypto API derives an AES-256-GCM key using PBKDF2 (100,000 iterations + salt).
3. Payload is encrypted entirely client-side; only the ciphertext, IV, and auth tag are sent to `/api/vault/save`.
4. The server and database never receive the master passphrase or the plaintext payload.

## Consequences
- **Positive**: Complete zero-knowledge privacy. Even database compromise yields no readable data.
- **Negative**: If the user loses their master passphrase, data cannot be recovered by server administrators.
