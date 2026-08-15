# Graph Report - ep  (2026-08-15)

## Corpus Check
- 99 files · ~67,335 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 527 nodes · 738 edges · 33 communities (25 shown, 8 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 6 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- AI & Budget Controller Logic
- MongoDB Database Configuration & Lifecycle
- Client React UI & Shell Components
- AI Copilot Engine & Analytics Service
- Budget & User Mongoose Schema Models
- Expense & Transaction Export Processing
- Frontend Dependencies & Framework Manifest
- User Authentication & Session Management
- Backend Server Dependencies & Middleware Stack
- Workspace Metadata & Root Configuration
- API Rate Limiting & Abuse Prevention
- Test Framework & Dev Tooling Config
- Audit Logging & Security Middleware
- Error Handling & Standard Exceptions
- Expense Management API Endpoints
- Financial Goals API Endpoints
- Budget Management API Endpoints
- Recurring Subscriptions API Endpoints
- Analytics Metric Calculations & Aggregations
- JWT Authentication Middleware & Route Protection
- Git Hooks & Developer Workflow Automation
- Expense Category API Endpoints
- AI Intelligence & Copilot Routing
- Audit Log Retrieval API Endpoints
- Data Export & CSV API Endpoints
- Request Validation Middleware
- Documentation & Architecture Standards
- Design Tokens & UI Guidelines
- AI Prompt Engineering & Master Plan
- Utility Helpers & Sanitization
- Graphify Knowledge Engine System

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 21 edges
2. `react` - 16 edges
3. `AppError` - 13 edges
4. `express` - 12 edges
5. `scripts` - 11 edges
6. `protect()` - 11 edges
7. `AnalyticsService` - 10 edges
8. `BadRequestError` - 10 edges
9. `useAuth()` - 9 edges
10. `keywords` - 9 edges

## Surprising Connections (you probably didn't know these)
- `AI-First Personal Finance Intelligence Platform Plan` --conceptually_related_to--> `Backend Architecture & API Specs`  [INFERRED]
  Plan/Revised Master Antigravity Prompt — AI-First Personal Finance Intelligence Platform.md → Documentation/BACKEND.md
- `Team Collaboration Manual & Git Protocol` --conceptually_related_to--> `Codebase Standards & Architecture Constraints`  [INFERRED]
  user manual/TEAM_COLLABORATION_MANUAL.md → .agents/rules/codebase-standards.md
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

## Communities (33 total, 8 thin omitted)

### Community 0 - "AI & Budget Controller Logic"
Cohesion: 0.05
Nodes (35): AIService, asyncHandler, { BadRequestError }, asyncHandler, Budget, { NotFoundError, BadRequestError }, asyncHandler, { BadRequestError, ConflictError } (+27 more)

### Community 1 - "MongoDB Database Configuration & Lifecycle"
Cohesion: 0.05
Nodes (38): closeDatabase(), connectDB(), mongoose, mongooseOptions, cleanupTimer, idempotencyCache, sanitizeInput(), sanitizeValue() (+30 more)

### Community 2 - "Client React UI & Shell Components"
Cohesion: 0.16
Nodes (22): apiFetch(), getLocalDateString(), App(), MainApp(), CopilotDrawer(), ExpenseFormModal(), Header(), Sidebar() (+14 more)

### Community 3 - "AI Copilot Engine & Analytics Service"
Cohesion: 0.07
Nodes (23): AnalyticsService, asyncHandler, AIService, AnalyticsService, Category, ContextBuilder, { getGeminiModel, isAvailable }, IntentRouter (+15 more)

### Community 4 - "Budget & User Mongoose Schema Models"
Cohesion: 0.06
Nodes (27): budgetSchema, mongoose, mongoose, userSchema, app, Budget, Expense, { MongoMemoryServer } (+19 more)

### Community 5 - "Expense & Transaction Export Processing"
Cohesion: 0.06
Nodes (20): asyncHandler, Expense, expenseSchema, mongoose, mongoose, recurringExpenseSchema, Expense, TrendService (+12 more)

### Community 6 - "Frontend Dependencies & Framework Manifest"
Cohesion: 0.07
Nodes (28): dependencies, framer-motion, lucide-react, react, react-dom, recharts, devDependencies, @types/react (+20 more)

### Community 7 - "User Authentication & Session Management"
Cohesion: 0.07
Nodes (22): asyncHandler, { BadRequestError, UnauthorizedError }, bcrypt, Budget, Category, crypto, Expense, Goal (+14 more)

### Community 8 - "Backend Server Dependencies & Middleware Stack"
Cohesion: 0.07
Nodes (27): bcryptjs, compression, cors, dotenv, express, express-rate-limit, express-validator, @google/generative-ai (+19 more)

### Community 9 - "Workspace Metadata & Root Configuration"
Cohesion: 0.08
Nodes (24): author, description, keywords, license, name, private, scripts, build (+16 more)

### Community 10 - "API Rate Limiting & Abuse Prevention"
Cohesion: 0.12
Nodes (19): RefreshToken, aiLimiter, authLimiter, demoLimiter, globalLimiter, isTestEnv(), rateLimit, shouldSkip() (+11 more)

### Community 11 - "Test Framework & Dev Tooling Config"
Cohesion: 0.12
Nodes (16): jest, nodemon, description, devDependencies, jest, nodemon, supertest, main (+8 more)

### Community 12 - "Audit Logging & Security Middleware"
Cohesion: 0.18
Nodes (10): asyncHandler, AuditLog, AuditLog, auditLogger(), redactBody(), REDACTED_FIELDS, resolveAction(), AUDIT_TTL_DAYS (+2 more)

### Community 14 - "Expense Management API Endpoints"
Cohesion: 0.18
Nodes (11): { createExpenseSchema, updateExpenseSchema }, express, {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
}, { protect }, router, validate, createExpenseSchema, Joi (+3 more)

### Community 15 - "Financial Goals API Endpoints"
Cohesion: 0.20
Nodes (10): { createGoalSchema, updateGoalSchema }, express, {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
}, { protect }, router, validate, createGoalSchema, Joi (+2 more)

### Community 16 - "Budget Management API Endpoints"
Cohesion: 0.22
Nodes (9): { createBudgetSchema, updateBudgetSchema }, express, {
  getBudgets,
  createBudget,
  updateBudget,
  deleteBudget,
}, { protect }, router, validate, createBudgetSchema, Joi (+1 more)

### Community 17 - "Recurring Subscriptions API Endpoints"
Cohesion: 0.22
Nodes (9): { createRecurringSchema, updateRecurringSchema }, express, {
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  getRecurringHistory,
  recordRecurringPayment,
}, { protect }, router, validate, createRecurringSchema, Joi (+1 more)

### Community 19 - "JWT Authentication Middleware & Route Protection"
Cohesion: 0.25
Nodes (7): jwt, protect(), User, express, { getAnalyticsOverview }, { protect }, router

### Community 20 - "Git Hooks & Developer Workflow Automation"
Cohesion: 0.29
Nodes (6): fs, gitDir, hooksDir, path, postMergeFile, repoRoot

### Community 21 - "Expense Category API Endpoints"
Cohesion: 0.33
Nodes (5): express, express, { getCategories, createCategory }, { protect }, router

### Community 22 - "AI Intelligence & Copilot Routing"
Cohesion: 0.40
Nodes (4): express, { protect }, router, {
  suggestCategory,
  getMonthlySummaryAI,
  getSpendingExplanation,
  copilotChat,
  getInsights,
}

### Community 23 - "Audit Log Retrieval API Endpoints"
Cohesion: 0.40
Nodes (4): express, { getAuditLogs }, { protect }, router

### Community 24 - "Data Export & CSV API Endpoints"
Cohesion: 0.40
Nodes (4): { exportExpenses }, express, { protect }, router

## Knowledge Gaps
- **295 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+290 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **8 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `express` connect `Expense Category API Endpoints` to `MongoDB Database Configuration & Lifecycle`, `Workspace Metadata & Root Configuration`, `API Rate Limiting & Abuse Prevention`, `Expense Management API Endpoints`, `Financial Goals API Endpoints`, `Budget Management API Endpoints`, `Recurring Subscriptions API Endpoints`, `JWT Authentication Middleware & Route Protection`, `AI Intelligence & Copilot Routing`, `Audit Log Retrieval API Endpoints`, `Data Export & CSV API Endpoints`?**
  _High betweenness centrality (0.181) - this node is a cross-community bridge._
- **Why does `keywords` connect `Workspace Metadata & Root Configuration` to `Client React UI & Shell Components`, `Expense Category API Endpoints`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **Why does `react` connect `Client React UI & Shell Components` to `Workspace Metadata & Root Configuration`?**
  _High betweenness centrality (0.108) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _295 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AI & Budget Controller Logic` be split into smaller, more focused modules?**
  _Cohesion score 0.05143191116306254 - nodes in this community are weakly interconnected._
- **Should `MongoDB Database Configuration & Lifecycle` be split into smaller, more focused modules?**
  _Cohesion score 0.045328399629972246 - nodes in this community are weakly interconnected._
- **Should `AI Copilot Engine & Analytics Service` be split into smaller, more focused modules?**
  _Cohesion score 0.06543385490753911 - nodes in this community are weakly interconnected._