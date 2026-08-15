# Richy Rich Engineering Standards & Architecture Rules

## 1. Project Overview & Technology Stack
- **Frontend**: React 19, Vite, Vanilla CSS design tokens (`client/src/index.css`), Lucide React icons, Framer Motion for micro-interactions, Recharts for data visualizations.
- **Backend**: Node.js, Express, MongoDB with Mongoose (with automated fallback to `mongodb-memory-server` for zero-dependency execution), Joi for input validation, Helmet for HTTP security, JWT for stateless access tokens with Refresh Token rotation, and structured operational error handling (`AppError`).
- **AI Engine**: Google Gemini API via `@google/generative-ai` with structured fallback analytics when API keys are unconfigured.

---

## 2. Core Coding Guidelines for Team Members & AI Agents

### Backend Conventions
1. **Controllers & Async Flow**: Always wrap async Express route handlers with `asyncHandler(...)` located in `server/src/utils/asyncHandler.js`.
2. **Error Handling**: Use operational `AppError` subclasses (`BadRequestError`, `NotFoundError`, `UnauthorizedError`, `ConflictError`, `ValidationError`). Do not throw generic unhandled errors.
3. **Input Validation**: All mutating endpoints (`POST`, `PUT`, `PATCH`) must have a corresponding Joi schema in `server/src/validators/` and use the `validate(schema)` middleware in route definitions.
4. **Security & Data Sanitization**: Sensitive fields (`password`, `passwordHash`, `token`, `refreshToken`, `apiKey`) must NEVER be logged or persisted in `AuditLog`.
5. **Deterministic Calculations**: Financial mathematics (totals, velocity, pacing, runway) must always use deterministic arithmetic. AI suggestions are layered *on top* of exact calculations, never replacing them.

### Frontend Conventions
1. **Design System & Styling**: Use Vanilla CSS leveraging CSS custom variables defined in `client/src/index.css` (e.g., `var(--color-mint)`, `var(--color-surface)`, `var(--radius-md)`). Avoid ad-hoc utility frameworks like Tailwind unless explicitly requested.
2. **API Communication**: Always use `apiFetch` from `client/src/api/client.js`. It automatically injects Authorization Bearer tokens and handles automatic token refresh rotation on HTTP 401.
3. **User Feedback**: Always surface actionable, user-friendly error messages from API responses instead of raw server stack traces.

---

## 3. Team Git & Collaboration Workflow
1. **Branches**: Branch off `main` with descriptive prefixes: `feature/<feature-name>`, `fix/<bug-name>`, `refactor/<target>`.
2. **Commits**: Follow Conventional Commits: `feat: ...`, `fix: ...`, `chore: ...`, `test: ...`, `docs: ...`.
3. **Syncing**: Keep local feature branches rebased on `main` before opening PRs (`git pull --rebase origin main`).
4. **Testing**: Run `npm test` in `server/` and verify `npm run build` in `client/` prior to opening a Pull Request.
