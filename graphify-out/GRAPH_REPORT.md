# Graph Report - ep  (2026-08-15)

## Corpus Check
- 103 files · ~79,813 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 683 nodes · 904 edges · 45 communities (33 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.63)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ee7d2d7b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- asyncHandler.js
- server.js
- App.jsx
- aiService.js
- analytics.test.js
- Expense.js
- client/package.json
- 🧠 AI/ML Architecture & Comprehensive Evolution Guide
- dependencies
- scripts
- authController.js
- server/package.json
- exportAndAudit.test.js
- AppError
- expenseRoutes.js
- goalRoutes.js
- budgetRoutes.js
- recurringRoutes.js
- ⚡ Enterprise AI/ML Production Improvement Blueprint
- aiProviders.test.js
- setup-git-hooks.cjs
- express
- auth.js
- AnalyticsService
- exportRoutes.js
- validate.js
- Codebase Standards & Architecture Constraints
- Backend Architecture & API Specs
- Graphify Knowledge Graph Rule
- Pinterest Style UI & Masonry Design System
- Design System Master Tokens & Styling Guide
- 🔑 Complete REST API Endpoints Reference
- Project Status & Architectural Knowledge Report
- errors.js
- patterns.test.js
- aiRoutes.js
- categoryController.js
- recurringController.js
- ApiResponse
- Richy Rich Engineering Documentation & User Manual
- graphify.md
- pinterest/README.md
- geminiClient.js

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 23 edges
2. `react` - 17 edges
3. `AppError` - 13 edges
4. `express` - 12 edges
5. `useAuth()` - 11 edges
6. `scripts` - 11 edges
7. `protect()` - 11 edges
8. `⚡ Enterprise AI/ML Production Improvement Blueprint` - 11 edges
9. `AnalyticsService` - 10 edges
10. `BadRequestError` - 10 edges

## Surprising Connections (you probably didn't know these)
- `Team Collaboration Manual & Git Protocol` --conceptually_related_to--> `Codebase Standards & Architecture Constraints`  [INFERRED]
  user manual/TEAM_COLLABORATION_MANUAL.md → .agents/rules/codebase-standards.md
- `AI-First Personal Finance Intelligence Platform Plan` --conceptually_related_to--> `Backend Architecture & API Specs`  [INFERRED]
  Plan/Revised Master Antigravity Prompt — AI-First Personal Finance Intelligence Platform.md → Documentation/BACKEND.md
- `MainApp()` --calls--> `apiFetch()`  [EXTRACTED]
  client/src/App.jsx → client/src/api/client.js
- `MainApp()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/App.jsx → client/src/context/AuthContext.jsx
- `ExpenseFormModal()` --calls--> `getLocalDateString()`  [EXTRACTED]
  client/src/components/Expenses/ExpenseFormModal.jsx → client/src/api/client.js

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Finance AI Platform Core Architecture** — documentation_backend_architecture, plan_revised_master_prompt, design_pinterest_design_pinterest_spec [INFERRED 0.95]

## Communities (45 total, 12 thin omitted)

### Community 0 - "asyncHandler.js"
Cohesion: 0.14
Nodes (11): asyncHandler, Budget, { NotFoundError, BadRequestError }, asyncHandler, Expense, { NotFoundError, BadRequestError }, asyncHandler, Goal (+3 more)

### Community 1 - "server.js"
Cohesion: 0.05
Nodes (38): closeDatabase(), connectDB(), mongoose, mongooseOptions, cleanupTimer, idempotencyCache, sanitizeInput(), sanitizeValue() (+30 more)

### Community 2 - "App.jsx"
Cohesion: 0.14
Nodes (26): apiFetch(), getLocalDateString(), App(), getInitialTab(), MainApp(), VALID_TABS, CopilotDrawer(), DEFAULT_MESSAGE (+18 more)

### Community 3 - "aiService.js"
Cohesion: 0.06
Nodes (26): AIService, asyncHandler, { BadRequestError }, UnifiedAIClient, User, AIService, AnalyticsService, ContextBuilder (+18 more)

### Community 4 - "analytics.test.js"
Cohesion: 0.12
Nodes (14): budgetSchema, mongoose, app, Budget, Expense, { MongoMemoryServer }, mongoose, request (+6 more)

### Community 5 - "Expense.js"
Cohesion: 0.04
Nodes (31): AnalyticsService, asyncHandler, asyncHandler, Expense, expenseSchema, mongoose, goalSchema, mongoose (+23 more)

### Community 6 - "client/package.json"
Cohesion: 0.07
Nodes (28): dependencies, framer-motion, lucide-react, react, react-dom, recharts, devDependencies, @types/react (+20 more)

### Community 7 - "🧠 AI/ML Architecture & Comprehensive Evolution Guide"
Cohesion: 0.05
Nodes (36): 1. Category-Specific Outlier Detection (Modified Z-Score / MAD), 1. Executive Summary & Philosophical Foundation, 1. In-Memory / Redis Fact & Summary Caching, 1. Native Gemini Structured JSON Schema (`responseSchema`), 1. Receipt & Invoice Multimodal OCR (`POST /api/ai/receipt-scan`), 2. Automated AI Grounding & Eval Test Suite, 2. Bill-Aware & Seasonality Run-Rate Forecasting, 2. Composite Financial Health Score (0–100 Index) (+28 more)

### Community 8 - "dependencies"
Cohesion: 0.07
Nodes (29): bcryptjs, compression, cors, dotenv, express, express-rate-limit, express-validator, @google/generative-ai (+21 more)

### Community 9 - "scripts"
Cohesion: 0.08
Nodes (24): author, description, keywords, license, name, private, scripts, build (+16 more)

### Community 10 - "authController.js"
Cohesion: 0.06
Nodes (34): asyncHandler, { BadRequestError, UnauthorizedError }, bcrypt, Budget, Category, crypto, Expense, Goal (+26 more)

### Community 11 - "server/package.json"
Cohesion: 0.12
Nodes (16): jest, nodemon, description, devDependencies, jest, nodemon, supertest, main (+8 more)

### Community 12 - "exportAndAudit.test.js"
Cohesion: 0.11
Nodes (16): asyncHandler, AuditLog, AuditLog, auditLogger(), redactBody(), REDACTED_FIELDS, resolveAction(), AUDIT_TTL_DAYS (+8 more)

### Community 14 - "expenseRoutes.js"
Cohesion: 0.18
Nodes (11): { createExpenseSchema, updateExpenseSchema }, express, {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
}, { protect }, router, validate, createExpenseSchema, Joi (+3 more)

### Community 15 - "goalRoutes.js"
Cohesion: 0.20
Nodes (10): { createGoalSchema, updateGoalSchema }, express, {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
}, { protect }, router, validate, createGoalSchema, Joi (+2 more)

### Community 16 - "budgetRoutes.js"
Cohesion: 0.22
Nodes (9): { createBudgetSchema, updateBudgetSchema }, express, {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
}, { protect }, router, validate, createBudgetSchema, Joi (+1 more)

### Community 17 - "recurringRoutes.js"
Cohesion: 0.22
Nodes (9): { createRecurringSchema, updateRecurringSchema }, express, {
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  getRecurringHistory,
  recordRecurringPayment,
}, { protect }, router, validate, createRecurringSchema, Joi (+1 more)

### Community 18 - "⚡ Enterprise AI/ML Production Improvement Blueprint"
Cohesion: 0.07
Nodes (29): 1.1 Architectural Flow, 1.2 Drop-In Implementation Blueprint, 2.1 Why Native Tool Calling Replaces Naive Substring Routing, 2.2 Drop-In Implementation: Function Calling Declarations, 2.3 Conversational Multi-Turn Copilot Service with Streaming, 3.1 Category-Scoped Median Absolute Deviation (MAD) Outlier Detection, 3.2 Bill-Aware & Seasonality Run-Rate Forecaster, 4.1 Specification (+21 more)

### Community 19 - "aiProviders.test.js"
Cohesion: 0.06
Nodes (22): mongoose, userSchema, LocalRagEngine, app, Expense, LocalRagEngine, { MongoMemoryServer }, mongoose (+14 more)

### Community 20 - "setup-git-hooks.cjs"
Cohesion: 0.29
Nodes (6): fs, gitDir, hooksDir, path, postMergeFile, repoRoot

### Community 21 - "express"
Cohesion: 0.33
Nodes (5): express, express, { getCategories, createCategory }, { protect }, router

### Community 22 - "auth.js"
Cohesion: 0.16
Nodes (11): jwt, protect(), User, express, { getAnalyticsOverview }, { protect }, router, express (+3 more)

### Community 24 - "exportRoutes.js"
Cohesion: 0.40
Nodes (4): { exportExpenses }, express, { protect }, router

### Community 33 - "🔑 Complete REST API Endpoints Reference"
Cohesion: 0.08
Nodes (24): 1. Authentication (`/api/auth`), 1. User Model (`User.js`), 2. RefreshToken Model (`RefreshToken.js`), 2. Transactions / Expenses (`/api/expenses`), 3. Budgets & Pace (`/api/budgets`), 3. Expense Model (`Expense.js`), 4. AuditLog Model (`AuditLog.js`), 4. Savings Goals (`/api/goals`) (+16 more)

### Community 34 - "Project Status & Architectural Knowledge Report"
Cohesion: 0.12
Nodes (15): 1. Executive Summary & Runtime Health, 2. Graphify Knowledge Graph Mapping, 3. Core Architectural Hubs ("God Nodes"), 4. Key Subsystems & Community Structure, 5. Active Feature Checklist, Knowledge Graph Artifacts, Major Subsystem Breakdown, Project Status & Architectural Knowledge Report (+7 more)

### Community 35 - "errors.js"
Cohesion: 0.25
Nodes (5): {
  AppError,
  ValidationError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  TooManyRequestsError,
}, ForbiddenError, TooManyRequestsError, UnauthorizedError, ValidationError

### Community 36 - "patterns.test.js"
Cohesion: 0.20
Nodes (7): ApiResponse, app, {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  TooManyRequestsError,
}, asyncHandler, { MongoMemoryServer }, mongoose, request

### Community 37 - "aiRoutes.js"
Cohesion: 0.40
Nodes (4): express, { protect }, router, {
  suggestCategory,
  getMonthlySummaryAI,
  getSpendingExplanation,
  copilotChat,
  getInsights,
  getAIConfig,
  updateAIConfig,
  testConnection,
}

### Community 38 - "categoryController.js"
Cohesion: 0.33
Nodes (4): asyncHandler, { BadRequestError, ConflictError }, Category, ConflictError

### Community 39 - "recurringController.js"
Cohesion: 0.40
Nodes (4): asyncHandler, Expense, { NotFoundError, BadRequestError }, RecurringExpense

### Community 41 - "Richy Rich Engineering Documentation & User Manual"
Cohesion: 0.50
Nodes (3): 📖 Primary Manual, 🚀 Quick Commands, Richy Rich Engineering Documentation & User Manual

## Knowledge Gaps
- **390 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+385 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `express` connect `express` to `server.js`, `aiRoutes.js`, `scripts`, `authController.js`, `expenseRoutes.js`, `goalRoutes.js`, `budgetRoutes.js`, `recurringRoutes.js`, `auth.js`, `exportRoutes.js`?**
  _High betweenness centrality (0.124) - this node is a cross-community bridge._
- **Why does `keywords` connect `scripts` to `App.jsx`, `express`?**
  _High betweenness centrality (0.122) - this node is a cross-community bridge._
- **Why does `react` connect `App.jsx` to `scripts`?**
  _High betweenness centrality (0.078) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _390 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `asyncHandler.js` be split into smaller, more focused modules?**
  _Cohesion score 0.13725490196078433 - nodes in this community are weakly interconnected._
- **Should `server.js` be split into smaller, more focused modules?**
  _Cohesion score 0.045328399629972246 - nodes in this community are weakly interconnected._
- **Should `App.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._