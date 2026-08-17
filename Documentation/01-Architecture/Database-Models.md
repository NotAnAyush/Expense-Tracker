---
title: Database Models Specification
tags:
  - architecture
  - database
  - mongoose
  - schema
version: 3.0.0
last_updated: 2026-08-17
---

# 🗄️ Database Models Specification (Mongoose / MongoDB)

This document is the **Single Source of Truth (SSOT)** for all MongoDB collections and Mongoose schemas in `server/src/models/`.

---

## 1. User & Authentication

### `User` (`server/src/models/User.js`)
| Field | Type | Required | Default | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `String` | Yes | - | Trimmed, 1-50 chars |
| `email` | `String` | Yes | - | Unique, lowercase, indexed |
| `password` | `String` | Yes | - | Bcrypt hashed (min 6 chars) |
| `currency` | `String` | No | `'INR'` | ISO 4217 Currency Code (`INR`, `USD`, `EUR`, `GBP`) |
| `theme` | `String` | No | `'dark'` | `'dark'` \| `'light'` |
| `preferences` | `Object` | No | `{}` | Notification and privacy toggle settings |
| `createdAt` / `updatedAt` | `Date` | Auto | `Date.now` | Managed by Mongoose timestamps |

### `RefreshToken` (`server/src/models/RefreshToken.js`)
| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `token` | `String` | Yes | Unique, SHA-256 hashed |
| `user` | `ObjectId` | Yes | Ref: `User`, indexed |
| `expiresAt` | `Date` | Yes | TTL indexed for automatic expiration |

---

## 2. Core Ledger Models

### `Expense` (`server/src/models/Expense.js`)
| Field | Type | Required | Default | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `user` | `ObjectId` | Yes | - | Ref: `User`, indexed |
| `title` | `String` | Yes | - | Trimmed, description |
| `amount` | `Number` | Yes | - | Positive number |
| `category` | `String` | Yes | `'Miscellaneous'` | Standard category enum or custom |
| `date` | `Date` | Yes | `Date.now` | Transaction timestamp |
| `paymentMethod`| `String` | No | `'Cash'` | `'UPI'`, `'Credit Card'`, `'Debit Card'`, `'Cash'`, `'Net Banking'` |
| `isRecurring` | `Boolean` | No | `false` | True if spawned by recurring job |
| `receiptUrl` | `String` | No | `null` | Uploaded image path or OCR scan |
| `tags` | `[String]` | No | `[]` | Free-form searchable tags |
| `taxDeductible`| `Boolean` | No | `false` | Tax deduction flag (80C, 80D, etc.) |

### `Income` (`server/src/models/Income.js`)
| Field | Type | Required | Default | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `user` | `ObjectId` | Yes | - | Ref: `User`, indexed |
| `source` | `String` | Yes | - | e.g. `'Salary'`, `'Freelance'`, `'Investments'` |
| `amount` | `Number` | Yes | - | Positive number |
| `date` | `Date` | Yes | `Date.now` | Received date |
| `frequency` | `String` | No | `'one-time'` | `'one-time'`, `'monthly'`, `'annual'` |
| `account` | `String` | No | `'Primary'` | Linked account name |

### `Budget` (`server/src/models/Budget.js`)
| Field | Type | Required | Default | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `user` | `ObjectId` | Yes | - | Ref: `User`, indexed |
| `category` | `String` | Yes | - | Category targeted |
| `amount` | `Number` | Yes | - | Monthly cap |
| `month` | `String` | Yes | - | Format `YYYY-MM` |
| `alertThreshold` | `Number` | No | `0.80` | Alert threshold (e.g. 80%) |

### `Goal` (`server/src/models/Goal.js`)
| Field | Type | Required | Default | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `user` | `ObjectId` | Yes | - | Ref: `User` |
| `name` | `String` | Yes | - | Goal title (e.g. "Emergency Fund") |
| `targetAmount` | `Number` | Yes | - | Target sum |
| `currentAmount`| `Number` | No | `0` | Saved so far |
| `targetDate` | `Date` | No | `null` | Deadline |
| `category` | `String` | No | `'Savings'` | |

---

## 3. Social & Debt Models

### `Debt` (`server/src/models/Debt.js`)
| Field | Type | Required | Default | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `user` | `ObjectId` | Yes | - | Ref: `User` |
| `name` | `String` | Yes | - | e.g. "Credit Card A", "Car Loan" |
| `principal` | `Number` | Yes | - | Outstanding principal balance |
| `interestRate` | `Number` | Yes | - | Annual % interest (APR) |
| `minimumPayment`| `Number` | Yes | - | Minimum monthly installment |
| `dueDate` | `Number` | No | `1` | Day of month (1-31) |

### `Group` (`server/src/models/Group.js`)
| Field | Type | Required | Default | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `name` | `String` | Yes | - | Group name (e.g. "Goa Trip") |
| `creator` | `ObjectId` | Yes | - | Ref: `User` |
| `members` | `[Object]` | Yes | - | Array of `{ name, email, user (ref), upiId }` |
| `expenses` | `[Object]` | No | `[]` | Array of split expenses and shares |
| `settlements` | `[Object]` | No | `[]` | Resolved transfer records |

---

## 4. Advanced & Vault Models

### `TripVault` (`server/src/models/TripVault.js`)
| Field | Type | Required | Default | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `user` | `ObjectId` | Yes | - | Ref: `User` |
| `tripName` | `String` | Yes | - | e.g. "Japan Autumn 2026" |
| `destination` | `String` | Yes | - | Country / City |
| `baseCurrency` | `String` | Yes | `'INR'` | User native currency |
| `targetCurrency`| `String` | Yes | `'JPY'` | Destination currency |
| `budgetTotal` | `Number` | Yes | - | Total budget in base currency |
| `expenses` | `[Object]` | No | `[]` | Sub-expenses recorded during trip |

### `SecretVault` (`server/src/models/SecretVault.js`)
| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `user` | `ObjectId` | Yes | Ref: `User`, unique per user |
| `encryptedPayload` | `String` | Yes | AES-256-GCM ciphertext |
| `iv` | `String` | Yes | Initialization vector |
| `authTag` | `String` | Yes | Authentication tag |

### `AuditLog` (`server/src/models/AuditLog.js`)
| Field | Type | Required | Notes |
| :--- | :--- | :--- | :--- |
| `user` | `ObjectId` | No | Ref: `User` (if authenticated) |
| `action` | `String` | Yes | e.g. `'AUTH_LOGIN'`, `'EXPENSE_DELETE'` |
| `ip` | `String` | Yes | Client IP address |
| `userAgent` | `String` | No | Browser/Device UA |
| `status` | `String` | Yes | `'SUCCESS'` \| `'FAILED'` |
| `metadata` | `Object` | No | Sanitized contextual event details |
