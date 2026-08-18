# 👨‍👩‍👧‍👦 Family Multi-User Ledgers, Bank SMS Webhooks & Enterprise Financial Exports — Research Report

**Document Status:** Complete & Verified  
**Author:** AI Architecture & Data Systems Engineering Team  
**Date:** 2026-08-18  
**Version:** 1.0.0  
**Tags:** `#family` `#rbac` `#sms-webhook` `#export` `#enterprise`

---

## 1. Executive Summary

This engineering paper formalizes the architecture for three core operational pillars:
1. **Family Multi-User Ledgers (`FamilyVault.js`)**: Role-Based Access Control (RBAC) allowing household members to maintain shared pooled budgets while safeguarding individual private ledgers.
2. **Automated Bank Transaction SMS Parsing Engine (`smsParserEngine.js`)**: Robust regular expression state machine designed for Indian Banking SMS standards (HDFC, SBI, ICICI, Axis, Kotak, PayTM, UPI).
3. **Enterprise Vector PDF & Multi-Sheet Excel Financial Export Engine (`reportExportEngine.js`)**: Production-ready data export generator providing executive financial health summaries, tax schedules, and ledger exports.

---

## 2. Family Role-Based Access Control (RBAC) Matrix

| Permission Capability | OWNER | ADMIN | CONTRIBUTOR | VIEWER |
| :--- | :---: | :---: | :---: | :---: |
| **Manage Family Members & Roles** | ✅ | ✅ | ❌ | ❌ |
| **Create / Adjust Shared Budgets** | ✅ | ✅ | ❌ | ❌ |
| **Log Shared Household Expense** | ✅ | ✅ | ✅ | ❌ |
| **View Household Aggregated Analytics** | ✅ | ✅ | ✅ | ✅ |
| **Inspect Individual Member Private Ledgers** | ❌ *(Privacy Guarded)* | ❌ | ❌ | ❌ |
| **Delete Family Vault** | ✅ | ❌ | ❌ | ❌ |

---

## 3. Indian Bank SMS Parsing Regex State Machine

Indian financial SMS messages adhere to typical transactional grammars:
- **Debit Pattern**: `(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s*(?:debited|spent|paid|withdrawn).*?(?:at|to|info)\s+([A-Za-z0-9\s._*-]+?)(?:\s+on|\.|\s+Avl|$)`
- **Credit Pattern**: `(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{2})?)\s*(?:credited|deposited|received).*?(?:from|by)\s+([A-Za-z0-9\s._*-]+?)(?:\s+on|\.|\s+Avl|$)`
- **UPI Reference Pattern**: `(?:UPI\s*Ref(?:\s*no)?|Ref\s*no|UTR)\s*[:\s]*([0-9]{12})`
- **Account / Card Identifier**: `(?:A/c\s*(?:no\.?)?|Card\s*(?:ending)?)\s*[*Xx]*(\d{4})`

---

## 4. Conclusion

Phase 9 completes the transition of Richy Rich from a single-user tool into an institutional-grade, multi-user household wealth operating system.
