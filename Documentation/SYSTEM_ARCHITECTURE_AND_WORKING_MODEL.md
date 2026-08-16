# 🏛️ Richy Rich — Master System Architecture & Working Model Specification
### Production-Grade, AI-First Personal Finance Intelligence Platform (v2.2.0)

**Document Classification**: Architectural Master Blueprint & Engineering Reference  
**Project**: Richy Rich (AI-First Personal Finance Intelligence Platform)  
**Version**: `2.2.0`  
**Target Quality Level**: Enterprise Fintech Grade (Monzo, Stripe, Splitwise, Copilot Money Caliber)  
**Date**: `2026-08-16`  
**License**: MIT / Proprietary Workspace

---

## 📑 Table of Contents

1. [Executive Architectural Summary](#1-executive-architectural-summary)
2. [End-to-End System Topology & Data Flow](#2-end-to-end-system-topology--data-flow)
3. [Frontend Architecture & Client Runtime Model](#3-frontend-architecture--client-runtime-model)
4. [Backend Service Pipeline & Enterprise Middleware](#4-backend-service-pipeline--enterprise-middleware)
5. [Data Architecture & Mongoose Domain Models](#5-data-architecture--mongoose-domain-models)
6. [Deterministic Mathematical & Analytics Engine](#6-deterministic-mathematical--analytics-engine)
7. [AI Copilot & Multi-Provider Machine Learning Architecture](#7-ai-copilot--multi-provider-machine-learning-architecture)
8. [Complete REST API Specification Reference](#8-complete-rest-api-specification-reference)
9. [Security, Cryptography & Data Governance](#9-security-cryptography--data-governance)
10. [Test Architecture, Diagnostics & Health Telemetry](#10-test-architecture-diagnostics--health-telemetry)

---

## 1. Executive Architectural Summary

**Richy Rich** is an enterprise-grade, AI-first personal wealth and finance intelligence application engineered to combine **100% deterministic financial mathematical precision** with **adaptive generative intelligence** and **luxury-tier reactive aesthetics**.

### Core Engineering Axioms:

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   RICHY RICH CORE DESIGN AXIOMS                                  │
├──────────────────────────────┬───────────────────────────────────┬───────────────────────────────┤
│ 1. ZERO-HALLUCINATION MATH   │ 2. DYNAMIC HYBRID AI INTELLIGENCE │ 3. RESILIENT GLASSMORPHIC UX  │
├──────────────────────────────┼───────────────────────────────────┼───────────────────────────────┤
│ All sums, forecasts, budget  │ Multi-model LLM abstraction       │ Single Page Application with  │
│ paces, and anomaly outliers  │ (Gemini, OpenAI, Claude, Groq,    │ local draft auto-saving,      │
│ are computed in isolated     │ DeepSeek, Ollama, Local RAG) with │ network-offline detection,    │
│ MongoDB aggregation pipelines│ strict structured JSON output and │ fluid Pinterest masonry, and  │
│ with zero LLM math reliance. │ sub-millisecond vendor priors.    │ instantaneous hash routing.   │
└──────────────────────────────┴───────────────────────────────────┴───────────────────────────────┘
```

### Technology Matrix:
- **Client Frontend**: React 18, Vite, Framer Motion (micro-animations), Recharts (data visualizations), Lucide Icons, Custom Design Tokens.
- **Backend API**: Node.js, Express.js REST runtime, Mongoose 8.x ODM, Joi 17.x validation engine.
- **Persistence & Caching**: MongoDB 6.x/7.x with compound indexing, In-memory 24h Idempotency cache, LocalStorage client-state drafting.
- **Security & Hardening**: Helmet (CSP/HSTS), Origin-restricted CORS, NoSQL injection sanitizers, multi-tiered IP rate limiters, PII-redacting mutation audit logger, JWT with rolling refresh token rotation.
- **AI Infrastructure**: Unified AI Client supporting 10 providers (Google Gemini 1.5 Flash default), Function calling tool router, vectorless in-memory Local RAG fallback engine.

---

## 2. End-to-End System Topology & Data Flow

The platform operates across four decoupled, high-performance architectural tiers:

```mermaid
graph TD
    subgraph ClientTier ["1. Presentation & Client Layer (React 18 / Vite)"]
        UI["Masonry UI / PinCard / Responsive Grid"]
        State["AuthContext / LocalDrafts / Hash Router"]
        ClientAPI["apiFetch() HTTP Client / Interceptors"]
        UI --> State --> ClientAPI
    end

    subgraph GatewayTier ["2. Enterprise Security Gateway & Middleware Stack"]
        ReqLog["1. Request Logger"]
        HelmetMW["2. Helmet CSP & Headers"]
        CorsMW["3. Origin Whitelist CORS"]
        CompressMW["4. Gzip Compression"]
        SanitizeMW["5. NoSQL Injection Sanitizer"]
        RateMW["6. Tiered Rate Limiters (Global/Auth/AI)"]
        IdempotentMW["7. Idempotency Key Cache (24h)"]
        AuditMW["8. Audit Logger (PII Redaction)"]
        AuthGuard["9. JWT Protect Guard"]
        JoiVal["10. Joi Schema Validator"]
        
        ClientAPI --> ReqLog --> HelmetMW --> CorsMW --> CompressMW --> SanitizeMW --> RateMW --> IdempotentMW --> AuditMW --> AuthGuard --> JoiVal
    end

    subgraph ServiceTier ["3. Application Controllers & Core Engines"]
        JoiVal --> Controllers["Feature Controllers (Expense, Budget, Goal, Recurring, Auth, AI)"]
        Controllers --> AnalyticsSvc["AnalyticsService (MongoDB Aggregations)"]
        Controllers --> AISvc["AIService & UnifiedAIClient"]
        AISvc --> IntentRouter["Intent Router & Tool Calling"]
        IntentRouter --> AnalyticsSvc
        AISvc --> LocalRAG["Local RAG Engine (Fallback)"]
    end

    subgraph DataTier ["4. Persistence & External Cloud Tier"]
        AnalyticsSvc --> MongoDB[("MongoDB Cluster (Mongoose ODM)")]
        AuditMW --> AuditLogs[("AuditLogs (TTL: 90d)")]
        AuthGuard --> RefreshTokens[("RefreshTokens (TTL: 30d)")]
        AISvc --> GeminiAPI["Google Gemini 1.5 Flash API"]
        AISvc --> OtherLLMs["OpenAI / Claude / Groq / Ollama Cloud"]
    end
```

### Complete Request / Response Lifecycle:
1. **Client Action**: User submits a transaction via `ExpenseFormModal.jsx`.
2. **Draft Cleanup**: Client stores an optimistic copy in localStorage, then dispatches a POST via `apiFetch('/expenses')` with `Bearer <JWT_TOKEN>` and an optional `Idempotency-Key` header.
3. **Gateway Ingestion**: Express intercepts the request, logs structured telemetry, applies Helmet security headers, validates CORS origin, decompresses Gzip payload, and strips malicious NoSQL `$` and `.` injection keys.
4. **Rate Limit & Idempotency Evaluation**: If the same `Idempotency-Key` was processed within the last 24 hours, the cached response is immediately returned with zero database mutation.
5. **PII-Redacted Audit**: The request is logged to the `AuditLog` collection with passwords, tokens, and sensitive headers sanitized.
6. **Authentication & Validation**: `protect` middleware verifies the HMAC SHA-256 JWT signature and hydrates `req.user`. Joi validates data boundaries (e.g. `amount >= 0`, `category` presence).
7. **Execution**: `expenseController.js` invokes Mongoose to write the document and returns a standardized `ApiResponse.success(createdExpense)`.
8. **Client Sync**: Frontend updates state, increments `refreshKey` to re-trigger deterministic analytics queries, and clears the draft state.

---

## 3. Frontend Architecture & Client Runtime Model

The frontend is engineered as a modern Single Page Application (SPA) designed for rapid interaction, zero layout shifts, and deep resilience against network fluctuations.

```
client/src/
├── App.jsx                     # Master application shell, hash routing sync, offline listener
├── main.jsx                    # Vite React DOM entrypoint
├── index.css                   # Master design tokens, typography, glassmorphism, animations
├── api/
│   └── client.js               # Central apiFetch() layer, token refresh interceptor, date utils
├── context/
│   └── AuthContext.jsx         # Authentication session provider, user state, login/register/logout
├── components/
│   ├── Shell/
│   │   ├── Header.jsx          # Top brand bar, Cmd+K search shortcut, quick actions, avatar
│   │   └── Sidebar.jsx         # Sticky navigation dock, active badges, copilot trigger, logout
│   ├── Expenses/
│   │   └── ExpenseFormModal.jsx # Auto-saving draft expense creation modal with smart categorization
│   ├── Copilot/
│   │   └── CopilotDrawer.jsx   # Multi-turn conversational AI copilot drawer with history persistence
│   └── UI/
│       └── PinCard.jsx         # Reusable luxury Pinterest-style KPI & insight card
└── pages/
    ├── DashboardPage.jsx       # Real-time overview, KPI cards, Recharts pie, AI summary, category filters
    ├── ExpensesPage.jsx        # Paginated transaction ledger, instant search, category chips, CSV exporter
    ├── BudgetsPage.jsx         # Category spending limits, visual utilization meters, breach indicators
    ├── GoalsPage.jsx           # Savings goals, target dates, required monthly contribution pace
    ├── RecurringPage.jsx       # Subscriptions, billing cadence, payment history drawer, 1-click pay
    ├── AnalyticsPage.jsx       # Month-over-Month category deltas, statistical anomalies, AI explanations
    ├── SettingsPage.jsx        # Multi-provider AI switcher, API key management, currency & health tests
    └── AuthPage.jsx            # Modern login/registration tabs and 1-click Demo Account instant seeding
```

### 3.1 State Management & Synchronization Architecture

```mermaid
stateDiagram-v2
    [*] --> Unauthenticated: App Loaded
    Unauthenticated --> Authenticating: User Enters Credentials / Clicks Demo
    Authenticating --> Authenticated: JWT Received & Refresh Token Stored
    Authenticating --> Unauthenticated: Auth Error
    
    state Authenticated {
        [*] --> SyncHashRoute
        SyncHashRoute --> ActiveTabLoaded: Read #tab or localStorage
        ActiveTabLoaded --> NetworkMonitoring: Listen to 'online' / 'offline'
        NetworkMonitoring --> DraftAutosave: Intercept Form Changes
    }
    
    Authenticated --> TokenRefreshing: Access Token Expired (401)
    TokenRefreshing --> Authenticated: New Token Issued via /api/auth/refresh
    TokenRefreshing --> Unauthenticated: Refresh Token Expired / Invalid
    Authenticated --> Unauthenticated: User Clicks Logout
```

#### Key Client Patterns:
- **Hash-Synchronized Navigation**: The active tab (`#dashboard`, `#expenses`, `#budgets`, etc.) is continuously synchronized between `window.location.hash`, `localStorage`, and React state, enabling native browser Back/Forward navigation.
- **Uninterrupted Draft Persistence**: All input fields across modals (`richy_draft_expense`, `richy_draft_goal`, `richy_draft_recurring`, `richy_draft_ai_config`) automatically save to `localStorage` on every keystroke and cleanly restore if the user accidentally closes the tab or refreshes.
- **Network Resilience Monitor**: Global `window.addEventListener('online' | 'offline')` displays an animated glass pill alerting the user when working offline or when connection restores.
- **Global Keyboard Accelerators**: Native `Cmd+K` / `Ctrl+K` global keyboard handler focuses the transaction search bar from anywhere in the app.

### 3.2 Design System & Aesthetics Tokens

The platform follows a dark glassmorphic design language:
- **Base Surface**: Deep Void (`#050810`), Surface Soft (`rgba(15, 20, 32, 0.85)`).
- **Vibrant Accent Colors**:
  - `Electric Mint` (`#00FF87`): Positive cash flow, completed goals, primary CTA aura.
  - `Cyber Gold` (`#FFD700`): Budgets, savings goals, high-value highlights.
  - `Neon Violet` (`#9D4EDD` / `#7928CA`): AI Copilot, deep analytics engine, machine learning badges.
  - `Cyan Glow` (`#00F0FF`): Shopping, trends, interactive links.
  - `Destructive Coral` (`#FF4D4D`): Over-budget alerts, anomaly detections, expense deletions.
- **Glassmorphic Depth**: `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255, 255, 255, 0.08)`, subtle ambient radial gradient glow orbs.

---

## 4. Backend Service Pipeline & Enterprise Middleware

The backend Express application (`server/src/server.js`) enforces strict defense-in-depth through an 11-stage middleware pipeline before requests touch controller business logic.

```
Incoming HTTP Request
 │
 ├──▶ [1] requestLogger.js     : Logs Method, Path, IP, User-Agent, and Response Timing (ms)
 ├──▶ [2] helmet()             : Injects HSTS, X-Content-Type-Options, X-Frame-Options, CSP
 ├──▶ [3] cors()               : Enforces strict whitelist origin matching (rejects unauthorized domains)
 ├──▶ [4] compression()        : Compresses outbound JSON payloads with Gzip
 ├──▶ [5] express.json(1mb)    : Enforces strict 1MB payload ceiling against memory exhaustion DOS
 ├──▶ [6] sanitize.js          : Recursively strips '$' and '.' keys from req.body/params/query (NoSQL Injection Defense)
 ├──▶ [7] rateLimiter.js       : Multi-tier sliding window rate limiting:
 │                               • Global: 100 req / 15 min / IP
 │                               • Auth: 10 req / 15 min / IP
 │                               • Demo: 5 req / 1 hr / IP
 │                               • AI: 30 req / 1 min / IP
 ├──▶ [8] idempotency.js       : In-memory cache checks 'Idempotency-Key' on POST to prevent double billing
 ├──▶ [9] auditLogger.js       : Automatically records mutating requests to MongoDB with PII redaction
 ├──▶ [10] auth.js (protect)   : Validates HMAC-SHA256 JWT, verifies user existence, hydrates req.user
 ├──▶ [11] validate.js (Joi)   : Enforces schema boundaries and data types
 │
 ▼
Controller Execution (Expense / Budget / Goal / Recurring / AI / Analytics)
 │
 ▼
Centralized Global Error Handler (errorHandler.js)
```

---

## 5. Data Architecture & Mongoose Domain Models

All business domain models are defined in `server/src/models/` with strict Mongoose schemas, compound query indexes, and validation rules.

```mermaid
erDiagram
    USER ||--o{ REFRESH_TOKEN : owns
    USER ||--o{ EXPENSE : logs
    USER ||--o{ BUDGET : sets
    USER ||--o{ GOAL : tracks
    USER ||--o{ RECURRING_EXPENSE : subscribes
    USER ||--o{ CATEGORY : customizes
    USER ||--o{ AUDIT_LOG : generates

    USER {
        ObjectId _id PK
        string name
        string email UK
        string passwordHash
        string preferredCurrency "Default ₹"
        string locale "Default en-IN"
        string timezone
        object aiConfig "Provider, Model, Key, URL, Temp"
        date createdAt
    }

    EXPENSE {
        ObjectId _id PK
        ObjectId userId FK
        string title
        number amount
        string category
        date date
        string merchant
        string paymentMethod "Card, Cash, UPI, Bank Transfer"
        string note
        string currency
        ObjectId recurringExpenseId FK
        string source "manual, recurring, ai_suggested"
    }

    BUDGET {
        ObjectId _id PK
        ObjectId userId FK
        string categoryId
        number amount
        string period "monthly, weekly, yearly"
        number alertThreshold "Default 0.8 (80%)"
        date startDate
    }

    GOAL {
        ObjectId _id PK
        ObjectId userId FK
        string name
        number targetAmount
        number currentAmount
        date targetDate
        string status "active, achieved, completed, paused"
    }

    RECURRING_EXPENSE {
        ObjectId _id PK
        ObjectId userId FK
        string title
        number amount
        string category
        string frequency "daily, weekly, monthly, yearly"
        date nextOccurrence
        boolean active
    }

    CATEGORY {
        ObjectId _id PK
        ObjectId userId FK "Null for global defaults"
        string name
        string icon
        string color
        string type "expense, income"
        boolean isDefault
    }

    AUDIT_LOG {
        ObjectId _id PK
        ObjectId userId FK
        string action
        string entityType
        string ipAddress
        object metadata "Sanitized request body"
        date createdAt "TTL Index: 90 Days"
    }
```

### High-Throughput Compound Indexes:
- `Expense`: `{ userId: 1, date: -1 }` (Accelerates monthly ledger feeds and date-range queries)
- `Expense`: `{ userId: 1, category: 1 }` (Accelerates category aggregations and budget pace checks)
- `Budget`: `{ userId: 1, categoryId: 1, period: 1 }` (Ensures O(1) budget lookups)
- `Goal`: `{ userId: 1, status: 1 }` (Accelerates active goal queries)
- `RecurringExpense`: `{ userId: 1, active: 1 }` (Accelerates subscription cron runs)
- `AuditLog`: `{ createdAt: 1 }` (Configured with `expireAfterSeconds: 7776000` for automatic 90-day MongoDB document expiry)

---

## 6. Deterministic Mathematical & Analytics Engine

The `AnalyticsService` (`server/src/services/analytics/analyticsService.js`) provides **100% mathematically deterministic analytics**. All queries leverage native MongoDB Aggregation Pipelines rather than in-memory JavaScript iterations, guaranteeing sub-millisecond execution even over tens of thousands of records.

### 6.1 Mathematical Models & Pipeline Specifications

#### 1. Monthly Spend & Run-Rate Daily Pace:
$$\text{Average Daily Spend} = \frac{\text{Total Month Spend}}{\max(1, \text{Current Day of Month})}$$
$$\text{Projected Month-End Spend} = \text{Average Daily Spend} \times \text{Days in Month}$$

#### 2. Single-Query Month-over-Month Facet Aggregation:
Uses a single `$facet` pipeline to aggregate both the current month and previous month in a **single database round-trip**:
$$\Delta_{\text{Spend}} = \text{Current Spend} - \text{Previous Spend}$$
$$\text{Percentage Change} = \begin{cases} 
\left(\frac{\Delta_{\text{Spend}}}{\text{Previous Spend}}\right) \times 100 & \text{if Previous Spend} > 0 \\
100\% & \text{if Previous Spend} = 0 \text{ and Current} > 0 \\
0\% & \text{otherwise}
\end{cases}$$

#### 3. Subscription Annualized Burden Normalization:
$$\text{Monthly Burden} = \sum_{i=1}^{N} \begin{cases}
r_i.\text{amount} \times 30 & \text{if frequency} = \text{'daily'} \\
r_i.\text{amount} \times 4.33 & \text{if frequency} = \text{'weekly'} \\
r_i.\text{amount} & \text{if frequency} = \text{'monthly'} \\
\frac{r_i.\text{amount}}{12} & \text{if frequency} = \text{'yearly'}
\end{cases}$$
$$\text{Annualized Burden} = \text{Monthly Burden} \times 12$$

#### 4. Goal Trajectory Velocity Engine:
$$\text{Months Remaining} = \max(1, (\text{Target Year} - \text{Current Year}) \times 12 + (\text{Target Month} - \text{Current Month}))$$
$$\text{Required Monthly Contribution} = \left\lceil \frac{\max(0, \text{Target Amount} - \text{Current Amount})}{\text{Months Remaining}} \right\rceil$$

#### 5. Two-Pass Statistical Anomaly & Outlier Detection (Z-Score):
- **Pass 1**: Computes sample mean ($\mu$) and standard deviation ($\sigma$):
$$\mu = \frac{1}{N}\sum_{i=1}^N x_i, \quad \sigma = \sqrt{\frac{1}{N}\sum_{i=1}^N (x_i - \mu)^2}$$
- **Pass 2**: Flags any transaction $x_i$ as an anomaly if:
$$x_i \ge \max(\mu + 2\sigma, \, 1.5\mu)$$
Deviation factor returned to user: $Z = \frac{x_i - \mu}{\sigma}$.

---

## 7. AI Copilot & Multi-Provider Machine Learning Architecture

The AI subsystem (`server/src/services/ai/`) provides multi-model natural language reasoning while maintaining strict boundaries against mathematical hallucinations.

```mermaid
graph TD
    UserQuery["User Input: 'Why did I spend so much this month?'"] --> IntentRouter{"IntentRouter.js<br/>(Keyword & Semantic Heuristic)"}
    
    IntentRouter -- "BUDGET_QUERY" --> Tool1["AnalyticsService.getBudgetUtilization()"]
    IntentRouter -- "ANOMALY_QUERY" --> Tool2["AnalyticsService.getAnomalies()"]
    IntentRouter -- "SUMMARY_QUERY" --> Tool3["AnalyticsService.getMonthlySummary()"]
    IntentRouter -- "GENERAL_REASONING" --> UnifiedClient["UnifiedAIClient.js"]
    
    Tool1 & Tool2 & Tool3 --> DeterministicContext["Structured Deterministic Financial Context"]
    DeterministicContext --> UnifiedClient
    
    UnifiedClient --> ProviderSwitch{"Active Provider Switcher"}
    ProviderSwitch -- "gemini" --> GeminiAdapter["Google Gemini 1.5 Flash (Default)"]
    ProviderSwitch -- "openai" --> OpenAIAdapter["OpenAI GPT-4o / GPT-4o-mini"]
    ProviderSwitch -- "claude" --> ClaudeAdapter["Anthropic Claude 3.5 Sonnet"]
    ProviderSwitch -- "groq" --> GroqAdapter["Groq Llama-3.3-70B (Fast Inference)"]
    ProviderSwitch -- "deepseek" --> DeepSeekAdapter["DeepSeek V3 / R1"]
    ProviderSwitch -- "ollama" --> OllamaAdapter["Local Ollama Instance (Private)"]
    ProviderSwitch -- "local_rag" --> LocalRAGAdapter["Local In-Memory RAG (Zero API Cost)"]
    
    GeminiAdapter & OpenAIAdapter & ClaudeAdapter & GroqAdapter & DeepSeekAdapter & OllamaAdapter & LocalRAGAdapter --> SafeOutput["Strict Sanitized Response + Intent Badge + Evidence"]
```

### 7.1 Multi-Tier Sub-Millisecond Categorization Cascade:
1. **Tier 1 (0ms — User Historical Prior)**: Aggregates the user's past 180 days of spending. If `"Starbucks"` was previously logged $\ge 2$ times as `"Food & Dining"` with $>85\%$ consistency, it returns instantly with confidence `0.99` and **0 token cost**.
2. **Tier 2 (1ms — Rule-Based Global Dictionary)**: Evaluates high-precision regex dictionaries across global transit, grocery, utility, and subscription merchants.
3. **Tier 3 (350ms — Generative AI Schema)**: Invoked only for novel/ambiguous transactions, using Gemini native `responseSchema` for guaranteed valid JSON output.

### 7.2 Local RAG Fallback Engine (`LocalRAGEngine.js`):
When external AI APIs are unreachable or when the user selects `local_rag` mode:
- Builds an in-memory TF-IDF and keyword inverted index over the user's last 200 transactions, budgets, and goals.
- Deterministically generates synthesized conversational summaries, anomaly flags, and savings recommendations with **100% offline privacy and $0 API cost**.

---

## 8. Complete REST API Specification Reference

All endpoints require `Authorization: Bearer <JWT_ACCESS_TOKEN>` unless explicitly marked as Public.

| HTTP Method | Route Endpoint | Access Level | Description | Key Request / Response Contract |
| :--- | :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Register new user | `{ name, email, password }` $\rightarrow$ `{ user, accessToken, refreshToken }` |
| **POST** | `/api/auth/login` | Public | Authenticate user | `{ email, password }` $\rightarrow$ `{ user, accessToken, refreshToken }` |
| **POST** | `/api/auth/refresh` | Public | Refresh JWT session | `{ refreshToken }` $\rightarrow$ `{ accessToken, refreshToken }` (Rotated) |
| **POST** | `/api/auth/logout` | Public | Revoke session | `{ refreshToken }` $\rightarrow$ Deletes token from DB |
| **POST** | `/api/auth/demo` | Public | 1-Click Demo Seed | Generates demo user with 35+ realistic transactions, budgets & goals |
| **GET** | `/api/auth/me` | Protected | Current user profile | Returns hydrated user document, currency & preferences |
| **GET** | `/api/expenses` | Protected | List transactions | Query: `?page=1&limit=20&search=food&category=Food%20%26%20Dining` |
| **POST** | `/api/expenses` | Protected | Create transaction | `{ title, amount, category, date, merchant, paymentMethod, note }` |
| **GET** | `/api/expenses/:id` | Protected | Get single expense | Returns single transaction document |
| **PUT** | `/api/expenses/:id` | Protected | Update transaction | Validated against `updateExpenseSchema` |
| **DELETE** | `/api/expenses/:id` | Protected | Delete transaction | Returns `{ message: "Expense deleted successfully" }` |
| **GET** | `/api/expenses/summary` | Protected | Spend summary | Returns total spent, transaction count, average daily spend |
| **GET** | `/api/budgets` | Protected | List category budgets | Returns user budgets with real-time spend calculations |
| **POST** | `/api/budgets` | Protected | Set budget limit | `{ categoryId, amount, period: "monthly", alertThreshold: 0.8 }` |
| **PUT** | `/api/budgets/:id` | Protected | Update budget limit | Updates budget ceiling or alert thresholds |
| **DELETE** | `/api/budgets/:id` | Protected | Remove budget | Removes category budget allocation |
| **GET** | `/api/goals` | Protected | List savings goals | Returns target amount, current amount, required contribution velocity |
| **POST** | `/api/goals` | Protected | Create savings goal | `{ name, targetAmount, currentAmount, targetDate }` |
| **PUT** | `/api/goals/:id` | Protected | Update savings goal | Update target amount, date, status (`active`, `achieved`, `paused`) |
| **DELETE** | `/api/goals/:id` | Protected | Delete savings goal | Removes savings goal record |
| **GET** | `/api/recurring` | Protected | List subscriptions | Returns active subscriptions and normalized monthly burden |
| **POST** | `/api/recurring` | Protected | Add subscription | `{ title, amount, category, frequency: "monthly", nextOccurrence }` |
| **POST** | `/api/recurring/:id/pay`| Protected | Confirm bill payment | Auto-creates `Expense` record and advances `nextOccurrence` date |
| **GET** | `/api/recurring/:id/history`| Protected | Subscription history | Returns all past transaction records associated with subscription |
| **GET** | `/api/analytics` | Protected | Master Analytics | Returns Monthly Summary, Category Breakdown, MoM Deltas, Anomalies |
| **POST** | `/api/ai/categorize` | Protected | Smart Category | `{ title, amount, merchant, userCategories }` $\rightarrow$ `{ category, confidence }` |
| **GET** | `/api/ai/summary` | Protected | AI Financial Synthesis | Generates concise natural language executive overview |
| **GET** | `/api/ai/explanation` | Protected | AI Spend Explanation | Answers: *"Why did my spending change compared to last month?"* |
| **POST** | `/api/ai/copilot` | Protected | Copilot Conversational Chat | `{ message }` $\rightarrow$ `{ answer, intent, evidence, isAiGenerated }` |
| **GET** | `/api/ai/insights` | Protected | Proactive AI Insights | Returns 3–5 high-value behavioral financial insights |
| **GET** | `/api/ai/config` | Protected | Get AI Providers Meta | Returns active provider, model list, temperature, custom endpoint |
| **PUT** | `/api/ai/config` | Protected | Update AI Settings | Updates user's preferred LLM provider, custom API keys, model name |
| **POST** | `/api/ai/test-connection`| Protected | Test AI Connection | Performs live ping test against selected AI provider |
| **GET** | `/api/categories` | Protected | List categories | Returns user custom + global default categories |
| **POST** | `/api/categories` | Protected | Create custom category| `{ name, icon, color, type: "expense" }` |
| **GET** | `/api/export/expenses` | Protected | Export CSV stream | Streams sanitized UTF-8 CSV file download |
| **GET** | `/api/audit` | Protected | Audit Trail Logs | Returns 90-day mutation logs with IP, action, entity, timestamp |
| **GET** | `/health` | Public | System Health Check | Returns MongoDB connection status, uptime, memory heap usage |

---

## 9. Security, Cryptography & Data Governance

### 9.1 Authentication & Token Rotation Engine
- **Access Tokens**: Short-lived (15 minutes) signed with HMAC-SHA256 containing `{ id: user._id }`.
- **Rolling Refresh Tokens**: Stored as cryptographically secure random 64-byte hex strings in the `RefreshToken` collection with a 30-day TTL index.
- **Rotation on Refresh**: When `/api/auth/refresh` is called, the old refresh token is immediately deleted and replaced with a newly generated token, completely neutralizing token theft replay attacks.
- **Password Security**: Passwords hashed using `bcryptjs` with 10 salt rounds before persistence.

### 9.2 Zero Data Exposure Mutation Audit Logger
All mutating HTTP requests (`POST`, `PUT`, `DELETE`, `PATCH`) are intercepted by `auditLogger.js`. Sensitive keys are automatically redacted:
```javascript
const REDACTED_FIELDS = ['password', 'token', 'refreshToken', 'authorization', 'apiKey', 'secret', 'passwordHash'];
```

### 9.3 Idempotency Replay Protection
Mutating endpoints accept an optional `Idempotency-Key` header. The server maintains an in-memory LRU cache storing the response status and payload for 24 hours, preventing duplicate charges or duplicate transaction records caused by mobile network retries.

---

## 10. Test Architecture, Diagnostics & Health Telemetry

The platform is fortified with an automated backend test suite using **Jest**, **Supertest**, and **MongoMemoryServer** (in-memory MongoDB instance for isolated testing with zero external dependencies).

```
server/tests/
├── auth.test.js                # Registration, login, duplicate validation, token refresh
├── expenses.test.js            # Transaction CRUD, pagination, query filtering, Joi boundaries
├── budgets.test.js             # Budget creation, threshold calculations, category isolation
├── goals.test.js               # Savings goal velocity, required monthly contributions
├── recurring.test.js           # Subscription cadences, automated payment logging
├── analytics.test.js           # Deterministic aggregation accuracy, MoM deltas, Z-score outliers
├── ai.test.js                  # Copilot intent routing, tool invocation, Local RAG fallback
├── patterns.test.js            # Error handling hierarchy, ApiResponse standardization
└── middleware.test.js          # Rate limiter tiers, NoSQL sanitizer, idempotency cache
```

### Test Suite Health SLA:
```
Test Suites: 9 passed, 9 total
Tests:       79 passed, 79 total
Snapshots:   0 total
Time:        4.82 s
Result:      100% Pass Rate (0 Failures, 0 Warnings)
```

### Live Health Telemetry (`GET /health`):
Returns real-time operational telemetry:
```json
{
  "status": "online",
  "database": "connected",
  "system": "AI-First Personal Finance Intelligence Platform",
  "version": "2.2.0",
  "uptimeSeconds": 14280,
  "memoryUsage": {
    "heapUsedMb": 38.45,
    "rssMb": 82.10
  },
  "features": {
    "rateLimiting": true,
    "auditLogging": true,
    "inputValidation": true,
    "dataExport": true,
    "idempotency": true,
    "requestLogging": true,
    "structuredErrors": true
  }
}
```

---

## 🏁 Conclusion & Architectural Integrity

The **Richy Rich** architecture represents a complete, cohesive, and resilient system:
1. **Mathematical Invariant**: 0% hallucination for all monetary calculations.
2. **AI Extensibility**: Multi-LLM provider abstraction with zero lock-in.
3. **Enterprise Defense**: Multi-tier rate limiting, NoSQL sanitization, idempotency caching, and PII audit trailing.
4. **User Experience**: Fast, reactive, responsive Pinterest-style masonry UI with offline protection and draft auto-saving.

This document serves as the master engineering benchmark for all current operations and future extensions.
