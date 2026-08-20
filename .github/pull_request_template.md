## 📋 Pull Request Description

### Summary of Changes
<!-- Provide a clear, concise explanation of what changes this PR introduces -->

### Type of Change
- [ ] 🚀 `feat`: New feature or capability
- [ ] 🐛 `fix`: Bug fix
- [ ] 📚 `docs`: Documentation updates or additions
- [ ] 🎨 `style`: Formatting, CSS, cosmetic changes
- [ ] ♻️ `refactor`: Code refactoring without changing functionality
- [ ] 🧪 `test`: Adding or updating test suites
- [ ] 🔧 `chore`: Tooling, build scripts, or dependency updates

---

## 🧪 Verification & Quality Checklist

- [ ] All automated tests pass: `npm test` (9 suites, 79+ tests in `server/`)
- [ ] Frontend builds cleanly: `npm run build` (Vite output to `client/dist/`)
- [ ] Input validation applied using Joi schemas where necessary
- [ ] Handled async errors with `asyncHandler` and `AppError` subclasses
- [ ] No hardcoded secrets, personal paths, or debug logs (`console.log`) in git diff
- [ ] Updated relevant documentation in [`Documentation/`](../Documentation/00-Index.md) if applicable
