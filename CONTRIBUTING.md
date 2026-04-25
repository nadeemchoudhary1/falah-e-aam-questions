# Contributing to Quiz App

Thank you for your interest in contributing! This document provides guidelines for submitting code changes.

## Code Style

- Use ES6+ syntax
- Follow existing code patterns
- Add comments for complex logic
- Use meaningful variable names

### Frontend
- Functional components with hooks
- PascalCase for components
- camelCase for functions/variables
- Use Tailwind CSS for styling

### Backend
- Use async/await pattern
- Follow REST API conventions
- Add request validation
- Implement error handling

## Before Submitting

1. **Test your changes**
   - Frontend: `npm test`
   - Backend: `npm test`

2. **Run linter**
   - Frontend: `npm run lint`
   - Backend: `npm run lint`

3. **Check formatting**
   - Ensure consistent code style
   - Remove console.logs
   - Clean up unused imports

## Pull Request Process

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes
4. Commit with clear messages: `git commit -am 'Add feature description'`
5. Push to branch: `git push origin feature/your-feature`
6. Open pull request with description

## Commit Message Format

```
type(scope): subject

body (optional)
footer (optional)
```

Types: feat, fix, docs, style, refactor, test, chore

Example:
```
feat(quiz): add timer warning at 5 minutes

- Display visual warning when 5 minutes remain
- Play notification sound
- Add configuration for warning time
```

## Bug Reports

Include:
- Browser/environment details
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Browser console errors

## Feature Requests

Include:
- Detailed description
- Use cases
- Potential implementation
- Mock-ups (if applicable)

---

Thank you for contributing! 🙏
