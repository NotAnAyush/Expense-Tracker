# AI-First Personal Finance Intelligence Platform (V2)

A personal financial operating system built with Node.js, Express, MongoDB, React, Vite, and Gemini.

## Architectural Architecture

```
Financial Data Layer (MongoDB/Mongoose Source of Truth)
        ↓
Financial Analytics Layer (Deterministic Calculations)
        ↓
AI Intelligence Layer (Gemini Interpretation & Reasoning)
        ↓
User Experience (Dashboard, Insights & Personal Finance Copilot)
```

## Quick Start

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```

### 3. Environment Configuration
Copy `.env.example` to `server/.env` and supply your `MONGODB_URI` and optional `GEMINI_API_KEY`.
If `GEMINI_API_KEY` is not provided, the platform functions fully using deterministic analytics and fallback indicators.

## Project Documentation & Knowledge Graph

- **Project Status & Architecture Report**: [`Documentation/PROJECT_STATUS.md`](Documentation/PROJECT_STATUS.md)
- **Backend Architecture & API Specs**: [`Documentation/BACKEND.md`](Documentation/BACKEND.md)
- **Team Collaboration & Git Protocol**: [`user manual/TEAM_COLLABORATION_MANUAL.md`](user%20manual/TEAM_COLLABORATION_MANUAL.md)
- **Interactive Knowledge Graph**: Open [`graphify-out/graph.html`](graphify-out/graph.html) in your browser.
- **Hierarchical D3 Tree**: Open [`graphify-out/GRAPH_TREE.html`](graphify-out/GRAPH_TREE.html) in your browser.
- **Knowledge Graph Audit**: [`graphify-out/GRAPH_REPORT.md`](graphify-out/GRAPH_REPORT.md)
