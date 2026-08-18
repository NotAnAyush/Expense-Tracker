# ADR-012: Family Multi-User Ledgers, Bank SMS Webhooks & Enterprise Export Engine

**Status:** Accepted  
**Date:** 2026-08-18  
**Context:** Richy Rich Sovereign Wealth Platform (Phase 9)  
**Deciders:** Core Engineering Team  

---

## 1. Context and Problem Statement

Households need to manage collective budgets without exposing private individual personal expenses. Additionally, users require automated hands-free transaction ingestion via bank SMS and downloadable PDF/Excel statements.

---

## 2. Decision Drivers

1. **Member Privacy**: Household members share pooled budgets, but their private personal transactions must remain strictly isolated.
2. **Deterministic SMS Parsing**: Ingestion must rely on deterministic regex state machines rather than unpredictable cloud LLM tokens.
3. **Enterprise Export Compatibility**: Statements must export in universally standard CSV, Excel, and structured PDF formats.

---

## 3. Decision Outcome

### Chosen Architecture:
1. **`FamilyVault.js` Mongoose Model**: Multi-tenant family schema with role-based access control (`OWNER`, `ADMIN`, `CONTRIBUTOR`, `VIEWER`).
2. **`smsParserEngine.js`**: Deterministic regular expression state machine supporting major Indian banks (HDFC, SBI, ICICI, Axis, Kotak, PayTM, UPI).
3. **`reportExportEngine.js`**: Universal statement export generator with monthly summaries, category allocations, and tax schedules.

---

## 4. Consequences

### Positive:
- Family members can collaborate on groceries, utilities, and rent without compromising personal financial privacy.
- Automated SMS quick-import significantly reduces manual entry friction.
- Audit-ready statement exports for tax filing and personal records.
