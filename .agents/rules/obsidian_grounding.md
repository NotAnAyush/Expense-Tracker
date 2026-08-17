# Obsidian Grounding & Anti-Hallucination Protocol

This repository uses an **Obsidian-based Single Source of Truth (SSOT)** located in `Documentation/` to prevent hallucinations, schema drift, and ungrounded code generation.

---

## 1. Core Operating Principles

### Principle 1: No Spec = No Code (Deterministic Grounding)
Before writing or modifying any backend route, database query, data model, or UI component:
1. **Always inspect the relevant specification note** in `Documentation/` or `Plan/`:
   - Database schemas: `[[Database-Models]]` (`Documentation/01-Architecture/Database-Models.md`)
   - API endpoints & payloads: `[[API-Contracts]]` (`Documentation/01-Architecture/API-Contracts.md`)
   - Design tokens & theme colors: `[[Design-Tokens]]` (`Documentation/02-Design-System/Design-Tokens.md`)
   - Feature criteria & formulas: `[[Feature-Roadmap]]` (`Documentation/03-Features/Feature-Roadmap.md`)
2. **Never invent arbitrary fields or payloads**: If a property or parameter is not in the spec or active codebase, verify with the user or check the spec before creating it.

### Principle 2: Architectural Hierarchy
Always adhere to the hard project rule (`[[ADR-001-AI-First-Hierarchy]]`):
$$\text{Financial Data Layer (DB)} \longrightarrow \text{Analytics Engine} \longrightarrow \text{AI Intelligence Layer} \longrightarrow \text{User Actions}$$
- AI copilot features must **never** be the source of raw financial truth or write directly to the database without validation.

---

## 2. Execution & Sync Protocol

### Step 1: Pre-Execution Grounding
- When asked to implement or fix a feature, locate the feature in `[[Project-Kanban]]` (`Documentation/05-Tasks/Project-Kanban.md`).
- Cross-reference the AST code graph using `graphify query "<feature>"` or `graphify-out/` to locate existing dependencies.

### Step 2: In-Flight Verification
- Ensure API routes strictly follow existing middleware chains:
  `authMiddleware` $\rightarrow$ `validateRequest` $\rightarrow$ `rateLimiter` $\rightarrow$ `auditLogger` $\rightarrow$ `controller`.
- Ensure UI components use CSS custom properties (e.g., `var(--primary)`, `var(--bg-card)`) rather than ad-hoc hex values.

### Step 3: Post-Execution Knowledge Sync
- Upon completing or modifying any major feature or architectural pattern:
  1. Check off the corresponding task in `Documentation/05-Tasks/Project-Kanban.md`.
  2. If a non-trivial architectural choice was made, record an ADR in `Documentation/04-ADR/`.
  3. Run `graphify update .` to update the AST code graph.
