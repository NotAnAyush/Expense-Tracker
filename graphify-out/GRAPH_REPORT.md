# Graph Report - .  (2026-08-12)

## Corpus Check
- Corpus is ~26,467 words - fits in a single context window. You may not need a graph.

## Summary
- 211 nodes · 301 edges · 11 communities (10 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Client React UI & Shell Components|Client React UI & Shell Components]]
- [[_COMMUNITY_Express Server Middleware & Router Security|Express Server Middleware & Router Security]]
- [[_COMMUNITY_AI Service & Copilot Intelligence Engine|AI Service & Copilot Intelligence Engine]]
- [[_COMMUNITY_AI Tool Registry & Analytics Integration|AI Tool Registry & Analytics Integration]]
- [[_COMMUNITY_Database Configuration & Input Sanitization|Database Configuration & Input Sanitization]]
- [[_COMMUNITY_User Authentication & Registration Logic|User Authentication & Registration Logic]]
- [[_COMMUNITY_Budget & User Data Models|Budget & User Data Models]]
- [[_COMMUNITY_Financial Goals Subsystem|Financial Goals Subsystem]]
- [[_COMMUNITY_Expense Management & Transaction Processing|Expense Management & Transaction Processing]]
- [[_COMMUNITY_Analytics Calculations & Metric Aggregations|Analytics Calculations & Metric Aggregations]]
- [[_COMMUNITY_Analytics API Controllers & Endpoint Routes|Analytics API Controllers & Endpoint Routes]]

## God Nodes (most connected - your core abstractions)
1. `apiFetch()` - 11 edges
2. `AnalyticsService` - 10 edges
3. `useAuth()` - 9 edges
4. `protect()` - 9 edges
5. `AIService` - 6 edges
6. `getGeminiModel()` - 6 edges
7. `PinCard()` - 5 edges
8. `Header()` - 3 edges
9. `Sidebar()` - 3 edges
10. `AuthPage()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `MainApp()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/App.jsx → client/src/context/AuthContext.jsx
- `Header()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/components/Shell/Header.jsx → client/src/context/AuthContext.jsx
- `Sidebar()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/components/Shell/Sidebar.jsx → client/src/context/AuthContext.jsx
- `AuthPage()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/pages/AuthPage.jsx → client/src/context/AuthContext.jsx

## Communities (11 total, 1 thin omitted)

### Community 0 - "Client React UI & Shell Components"
Cohesion: 0.14
Nodes (18): apiFetch(), AuthContext, AuthProvider(), useAuth(), CopilotDrawer(), ExpenseFormModal(), AnalyticsPage(), AuthPage() (+10 more)

### Community 1 - "Express Server Middleware & Router Security"
Cohesion: 0.08
Nodes (24): AIService, jwt, protect(), User, express, { protect }, router, {
  suggestCategory,
  getMonthlySummaryAI,
  getSpendingExplanation,
  copilotChat,
  getInsights,
} (+16 more)

### Community 2 - "AI Service & Copilot Intelligence Engine"
Cohesion: 0.11
Nodes (13): AIService, AnalyticsService, Category, ContextBuilder, { getGeminiModel, isAvailable }, IntentRouter, sanitizeUserText(), ToolRegistry (+5 more)

### Community 3 - "AI Tool Registry & Analytics Integration"
Cohesion: 0.09
Nodes (18): AnalyticsService, Expense, ToolRegistry, Budget, Expense, Goal, RecurringExpense, currentNext (+10 more)

### Community 4 - "Database Configuration & Input Sanitization"
Cohesion: 0.1
Nodes (18): mongoose, sanitizeInput(), sanitizeValue(), aiRoutes, analyticsRoutes, app, authRoutes, budgetRoutes (+10 more)

### Community 5 - "User Authentication & Registration Logic"
Cohesion: 0.1
Nodes (16): bcrypt, Budget, Category, currentMonth, currentYear, defaultCategories, Expense, Goal (+8 more)

### Community 6 - "Budget & User Data Models"
Cohesion: 0.11
Nodes (14): Budget, budgetSchema, mongoose, mongoose, userSchema, app, Budget, Expense (+6 more)

### Community 7 - "Financial Goals Subsystem"
Cohesion: 0.2
Nodes (7): Goal, goalSchema, mongoose, express, { getGoals, createGoal, updateGoal, deleteGoal }, { protect }, router

### Community 8 - "Expense Management & Transaction Processing"
Cohesion: 0.2
Nodes (8): Expense, query, sortOptions, totalAmount, express, {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
}, { protect }, router

### Community 10 - "Analytics API Controllers & Endpoint Routes"
Cohesion: 0.29
Nodes (5): AnalyticsService, express, { getAnalyticsOverview }, { protect }, router

## Knowledge Gaps
- **116 isolated node(s):** `AuthContext`, `PINTEREST_COLORS`, `express`, `cors`, `dotenv` (+111 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `AnalyticsService` connect `Analytics Calculations & Metric Aggregations` to `AI Tool Registry & Analytics Integration`?**
  _High betweenness centrality (0.070) - this node is a cross-community bridge._
- **Why does `protect()` connect `Express Server Middleware & Router Security` to `Expense Management & Transaction Processing`, `Analytics API Controllers & Endpoint Routes`, `Financial Goals Subsystem`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **What connects `AuthContext`, `PINTEREST_COLORS`, `express` to the rest of the system?**
  _116 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Client React UI & Shell Components` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._
- **Should `Express Server Middleware & Router Security` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `AI Service & Copilot Intelligence Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.11 - nodes in this community are weakly interconnected._
- **Should `AI Tool Registry & Analytics Integration` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._