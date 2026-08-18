# 👨‍👩‍👧‍👦 Family Multi-User Ledgers, Bank SMS Webhooks & Enterprise Exports

**Feature ID:** `FEAT-012`  
**Phase:** Phase 9  
**Status:** In Progress / Architecture  
**Tags:** `#family` `#rbac` `#sms` `#exports` `#enterprise`

---

## 1. Overview

The **Family Multi-User Ledgers & Enterprise Exports** module empowers families to collaborate on shared household finances while preserving individual privacy, enables instant bank SMS quick-logging, and outputs institutional-grade financial statements.

---

## 2. Core Capabilities

### 1. Family Multi-User Vault (`FamilyVault.js` & `familyService.js`)
- Roles: `OWNER`, `ADMIN`, `CONTRIBUTOR`, `VIEWER`.
- Shared household budgets (e.g. Groceries ₹30,000, Housing ₹45,000, Utilities ₹12,000).
- Real-time aggregated household analytics and member contribution breakdowns.

### 2. Bank Transaction SMS Webhook & Parser (`smsParserEngine.js`)
- Instant parsing of transaction alerts from HDFC, SBI, ICICI, Axis, Kotak, PayTM, PhonePe, and Google Pay.
- Auto-extracts amount, debit/credit type, merchant/payee, account last 4 digits, and UPI reference (UTR).

### 3. Enterprise Report Export Generator (`reportExportEngine.js`)
- **CSV & Excel (.xlsx)**: Universal multi-sheet workbooks with monthly summaries and categorized line items.
- **Vector PDF / Print Statement**: Executive summaries, savings rate indicators, tax breakdown schedules, and auditor signature lines.

---

## 3. API Endpoints

- Family Vaults:
  - `POST /api/family` — Create new family household vault.
  - `GET /api/family` — List user's family vaults.
  - `POST /api/family/:id/members` — Invite or add member.
  - `POST /api/family/:id/expenses` — Log shared household expense.
  - `GET /api/family/:id/summary` — Aggregate family budget summary.
- Bank SMS:
  - `POST /api/import/sms-parse` — Parse raw SMS text into structured transaction.
  - `POST /api/import/sms-webhook` — Direct webhook ingestion endpoint.
- Enterprise Reports:
  - `GET /api/export/financial-statement` — Generate executive statement report data.
