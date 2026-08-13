# Graph Report - V2  (2026-08-13)

## Corpus Check
- 54 files · ~44,913 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 504 nodes · 593 edges · 44 communities (38 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9ff52360`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]

## God Nodes (most connected - your core abstractions)
1. `62. FINAL QUALITY AUDIT` - 15 edges
2. `65. START EXECUTION` - 15 edges
3. `46. TESTING THE AI LAYER` - 14 edges
4. `3. DO NOT BREAK THE ORIGINAL PROJECT ROADMAP` - 13 edges
5. `apiFetch()` - 11 edges
6. `AnalyticsService` - 10 edges
7. `useAuth()` - 9 edges
8. `protect()` - 9 edges
9. `39. SIGNATURE DASHBOARD DESIGN` - 9 edges
10. `Components` - 8 edges

## Surprising Connections (you probably didn't know these)
- `MainApp()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/App.jsx → client/src/context/AuthContext.jsx
- `ExpenseFormModal()` --calls--> `getLocalDateString()`  [EXTRACTED]
  client/src/components/Expenses/ExpenseFormModal.jsx → client/src/api/client.js
- `Header()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/components/Shell/Header.jsx → client/src/context/AuthContext.jsx
- `Sidebar()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/components/Shell/Sidebar.jsx → client/src/context/AuthContext.jsx
- `AuthPage()` --calls--> `useAuth()`  [EXTRACTED]
  client/src/pages/AuthPage.jsx → client/src/context/AuthContext.jsx

## Communities (44 total, 6 thin omitted)

### Community 0 - "Client React UI & Shell Components"
Cohesion: 0.04
Nodes (46): 10. PHASE 6 — FINANCIAL ANALYTICS ENGINE, 12. PHASE 7 — AI INTELLIGENCE LAYER, 14. INTELLIGENCE 2 — AUTOMATIC FINANCIAL SUMMARIES, 15. INTELLIGENCE 3 — "WHY DID MY SPENDING CHANGE?", 16. INTELLIGENCE 4 — ANOMALY EXPLANATION, 17. INTELLIGENCE 5 — PERSONAL FINANCE COPILOT, 18. FINANCE COPILOT TOOL ARCHITECTURE, 19. AI INTENT ROUTING (+38 more)

### Community 1 - "Express Server Middleware & Router Security"
Cohesion: 0.05
Nodes (39): Border Radius Scale, Brand & Accent, Breakpoints, Buttons, Cards & Containers, Collapsing Strategy, Colors, Components (+31 more)

### Community 2 - "AI Service & Copilot Intelligence Engine"
Cohesion: 0.13
Nodes (20): apiFetch(), getLocalDateString(), AuthContext, AuthProvider(), useAuth(), CopilotDrawer(), ExpenseFormModal(), AnalyticsPage() (+12 more)

### Community 3 - "AI Tool Registry & Analytics Integration"
Cohesion: 0.06
Nodes (26): AnalyticsService, Expense, ToolRegistry, Budget, Expense, Goal, RecurringExpense, AnalyticsService (+18 more)

### Community 4 - "Database Configuration & Input Sanitization"
Cohesion: 0.07
Nodes (21): bcrypt, Budget, Category, currentMonth, currentYear, defaultCategories, Expense, Goal (+13 more)

### Community 5 - "User Authentication & Registration Logic"
Cohesion: 0.1
Nodes (14): AIService, AnalyticsService, Category, ContextBuilder, { getGeminiModel, isAvailable }, IntentRouter, sanitizeUserText(), ToolRegistry (+6 more)

### Community 6 - "Budget & User Data Models"
Cohesion: 0.09
Nodes (21): Additional Forbidden Patterns, Anti-Patterns (Do NOT Use), Buttons, Cards, code:css (@import url('https://fonts.googleapis.com/css2?family=Fira+C), code:css (/* Primary Button */), code:css (.card {), code:css (.input {) (+13 more)

### Community 7 - "Financial Goals Subsystem"
Cohesion: 0.11
Nodes (15): Budget, cleanCat, budgetSchema, mongoose, mongoose, userSchema, app, Budget (+7 more)

### Community 8 - "Expense Management & Transaction Processing"
Cohesion: 0.12
Nodes (15): aiRoutes, analyticsRoutes, app, authRoutes, budgetRoutes, categoryRoutes, connectDB, cors (+7 more)

### Community 9 - "Analytics Calculations & Metric Aggregations"
Cohesion: 0.13
Nodes (15): 62. FINAL QUALITY AUDIT, Accessibility, AI, Analytics, Deployment, Foundation, Grounding, Mobile (+7 more)

### Community 10 - "Analytics API Controllers & Endpoint Routes"
Cohesion: 0.13
Nodes (15): 65. START EXECUTION, Step 1, Step 10, Step 11, Step 12, Step 13, Step 14, Step 2 (+7 more)

### Community 11 - "Community 11"
Cohesion: 0.16
Nodes (11): jwt, protect(), User, express, { protect }, router, {
  suggestCategory,
  getMonthlySummaryAI,
  getSpendingExplanation,
  copilotChat,
  getInsights,
}, express (+3 more)

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (14): 46. TESTING THE AI LAYER, Contradictory data, Empty dataset, Gemini API failure, Gemini timeout, Hallucinated amount, Invalid category, Malformed model response (+6 more)

### Community 13 - "Community 13"
Cohesion: 0.15
Nodes (13): 3. DO NOT BREAK THE ORIGINAL PROJECT ROADMAP, Phase 0, Phase 1, Phase 10, Phase 11, Phase 2, Phase 3, Phase 4 (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.2
Nodes (9): 1. Backend Setup, 2. Frontend Setup, 3. Environment Configuration, AI-First Personal Finance Intelligence Platform (V2), Architectural Architecture, code:block1 (Financial Data Layer (MongoDB/Mongoose Source of Truth)), code:bash (cd server), code:bash (cd client) (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.22
Nodes (9): 39. SIGNATURE DASHBOARD DESIGN, AI summary, Budget health, Financial summary, Header, Insights, Recent transactions, Spending visualization (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.25
Nodes (8): 48. AI QUALITY METRICS, Accuracy, Conciseness, Grounding, Helpfulness, Latency, Safety, Tool correctness

### Community 18 - "Community 18"
Cohesion: 0.25
Nodes (8): 50. DEVELOPMENT CHECKPOINTS, CHECKPOINT A, CHECKPOINT B, CHECKPOINT C, CHECKPOINT D, CHECKPOINT E, CHECKPOINT F, CHECKPOINT G

### Community 19 - "Community 19"
Cohesion: 0.29
Nodes (7): Level 1 — Record, Level 2 — Understand, Level 3 — Explain, Level 4 — Predict, Level 5 — Assist, Level 6 — Converse, Personal Finance Intelligence Platform

### Community 20 - "Community 20"
Cohesion: 0.29
Nodes (7): 6. PHASE 2 — FINANCIAL DATA FOUNDATION, Budget, Category, Expense, Goal, RecurringExpense, User

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (7): 11. CORE AI PRINCIPLE, Assistant, Communicator, Interpreter, Pattern Explainer, Recommendation Engine, Synthesizer

### Community 22 - "Community 22"
Cohesion: 0.29
Nodes (7): 38. UI ARCHITECTURE FOR AI, Analytics page, Budget page, Dashboard, Global assistant, Goals page, Transaction page

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (7): 49. FEATURE PRIORITY — PRESERVE THE ORIGINAL PLAN, TIER 1 — CORE MVP, TIER 2 — FEATURE-RICH TRACKER, TIER 3 — INTELLIGENCE FOUNDATION, TIER 4 — AI INTELLIGENCE, TIER 5 — FINANCE COPILOT, TIER 6 — ADVANCED AI

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (7): 61. IMPORTANT: DO NOT OVERBUILD TOO EARLY, Add advanced intelligence., Add conversational AI., Add intelligence., Build the foundation., Make the analytics correct., Make the data trustworthy.

### Community 25 - "Community 25"
Cohesion: 0.33
Nodes (6): Budget warning, Goal trajectory, Insights, Recurring burden, Spending increase, Unusual transaction

### Community 26 - "Community 26"
Cohesion: 0.4
Nodes (4): express, { getGoals, createGoal, updateGoal, deleteGoal }, { protect }, router

### Community 27 - "Community 27"
Cohesion: 0.4
Nodes (4): express, {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
}, { protect }, router

### Community 28 - "Community 28"
Cohesion: 0.4
Nodes (4): express, { getAnalyticsOverview }, { protect }, router

### Community 29 - "Community 29"
Cohesion: 0.4
Nodes (4): express, { protect }, { registerUser, loginUser, getMe, seedDemoAccount }, router

### Community 30 - "Community 30"
Cohesion: 0.4
Nodes (4): express, { getCategories, createCategory }, { protect }, router

### Community 31 - "Community 31"
Cohesion: 0.4
Nodes (4): express, {
  getRecurringExpenses,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  getRecurringHistory,
  recordRecurringPayment,
}, { protect }, router

### Community 32 - "Community 32"
Cohesion: 0.4
Nodes (5): 41. AI RESPONSE DESIGN, Answer, Evidence, Explanation, Optional action

### Community 33 - "Community 33"
Cohesion: 0.4
Nodes (5): 2. NON-NEGOTIABLE ARCHITECTURAL PRINCIPLE, Layer 1 — Financial Source of Truth, Layer 2 — Financial Intelligence Primitives, Layer 3 — AI Intelligence Layer, Layer 4 — Experience Layer

### Community 34 - "Community 34"
Cohesion: 0.4
Nodes (5): 4. UPDATED PHASE MODEL, AI capabilities, Deterministic intelligence primitives, Financial entities, PHASE 0 — PRODUCT + AI ARCHITECTURE

### Community 35 - "Community 35"
Cohesion: 0.5
Nodes (4): 55. PERFORMANCE RULE, First, Second, Third

### Community 38 - "Community 38"
Cohesion: 0.67
Nodes (3): 40. FINANCE COPILOT UX, Follow-up questions, Quick questions

### Community 39 - "Community 39"
Cohesion: 0.67
Nodes (3): AI-First Personal Finance Intelligence Platform, Build the financial system first. Build intelligence on top of it. Never reverse the dependency., MASTER ANTIGRAVITY BUILD PROMPT

### Community 40 - "Community 40"
Cohesion: 0.67
Nodes (3): 21. TWO-STAGE AI ARCHITECTURE, Stage 1 — Data retrieval, Stage 2 — Interpretation

## Knowledge Gaps
- **353 isolated node(s):** `AuthContext`, `OLED_CHART_COLORS`, `express`, `cors`, `dotenv` (+348 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `62. FINAL QUALITY AUDIT` connect `Analytics Calculations & Metric Aggregations` to `Client React UI & Shell Components`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `65. START EXECUTION` connect `Analytics API Controllers & Endpoint Routes` to `Client React UI & Shell Components`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `46. TESTING THE AI LAYER` connect `Community 12` to `Client React UI & Shell Components`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `AuthContext`, `OLED_CHART_COLORS`, `express` to the rest of the system?**
  _353 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Client React UI & Shell Components` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Express Server Middleware & Router Security` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `AI Service & Copilot Intelligence Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._