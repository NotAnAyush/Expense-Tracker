# Richy Rich Engineering Documentation & User Manual

Welcome to the **Richy Rich v2.2 Documentation Hub**.

This directory contains the authoritative guides and manuals for team members, contributors, and engineering leads.

---

## 📖 Primary Manual

- **[Team Collaboration & Antigravity 2.0 / Git Manual](./TEAM_COLLABORATION_MANUAL.md)**:  
  Comprehensive, beginner-to-advanced guide covering:
  - Repository anatomy and zero-config local setup (`npm run setup`).
  - Automated dependency synchronization with Git hooks (`post-merge`).
  - Professional Git & GitHub branching, Conventional Commits, and PR checklists.
  - Mastering Google Antigravity 2.0 & Antigravity IDE (Autocomplete, Inline `Ctrl+I`, Sidebar Agent, Planning Mode, and Customizations).
  - Full-stack architecture conventions (Node/Express, Joi, React 19, Vanilla CSS design tokens).
  - Testing workflows and common troubleshooting recipes.

---

## 🚀 Quick Commands

```bash
# Complete workspace setup (installs hooks + client & server dependencies)
npm run setup

# Start development servers
npm run dev:server    # Backend on http://localhost:5000
npm run dev:client    # Frontend on http://localhost:5173

# Run automated test suites (9 suites, 79+ tests)
npm test

# Build production bundle
npm run build
```
