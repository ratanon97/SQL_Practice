# Contributing to SQL Dojo

Thank you for your interest in contributing to SQL Dojo! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/sql-practice.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Start the dev server: `npm run dev`

## Development Workflow

### Code Style

- We use ESLint and Prettier for code formatting
- Run `npm run format` to auto-format your code
- Run `npm run lint` to check for issues
- TypeScript strict mode is enabled - all code must be properly typed

### Commit Messages

Use clear, descriptive commit messages:

- `feat: add query export functionality`
- `fix: resolve PGlite memory leak`
- `docs: update README with deployment instructions`
- `refactor: extract challenge selector component`
- `test: add unit tests for progress store`

### Testing

- Write unit tests for new utilities and logic (Vitest)
- Add E2E tests for new user-facing features (Playwright)
- Run tests before submitting: `npm run test:all`
- Ensure all tests pass and coverage remains high

### Adding New Features

1. **New Challenge**: Edit `src/lib/data/challenges.ts`
   - Add challenge object with unique ID
   - Provide starter SQL and solution SQL
   - Test thoroughly in playground mode

2. **New Component**: Create in `src/lib/components/`
   - Use Svelte 5 runes syntax
   - Add TypeScript interfaces for props
   - Include ARIA labels for accessibility
   - Write basic tests

3. **New Store**: Create in `src/lib/stores/`
   - Use Svelte 5 store pattern
   - Include JSDoc documentation
   - Add unit tests
   - Handle localStorage carefully with debouncing

4. **New Utility**: Add to `src/lib/utils/`
   - Write pure functions when possible
   - Add JSDoc comments
   - Include comprehensive unit tests

### Code Review Checklist

Before submitting a PR, ensure:

- [ ] Code follows existing patterns and style
- [ ] TypeScript types are properly defined
- [ ] All tests pass (`npm run test:all`)
- [ ] ESLint and Prettier checks pass (`npm run lint`)
- [ ] New features have tests
- [ ] Accessibility considerations are addressed
- [ ] Documentation is updated (README, JSDoc, etc.)
- [ ] No console.log statements in production code

## Project Architecture

### Component Guidelines

- Keep components focused and single-purpose
- Use props for configuration, not global state
- Prefer composition over inheritance
- Extract reusable logic to stores or utilities

### State Management

- Use Svelte 5 stores for shared state
- LocalStorage interactions must be debounced
- Validate data loaded from localStorage
- Provide sensible defaults

### Performance

- Use PGlite pool for database operations
- Debounce expensive operations
- Avoid unnecessary re-renders
- Keep bundle size in check

### Accessibility

- All interactive elements need keyboard support
- Use semantic HTML
- Add ARIA labels where needed
- Test with screen readers when possible

## Pull Request Process

1. Update documentation for any changed functionality
2. Add tests for new features or bug fixes
3. Ensure the build passes: `npm run build`
4. Update CHANGELOG.md if applicable
5. Submit PR with clear description of changes
6. Link any related issues

### PR Description Template

```markdown
## Description

[Clear description of what this PR does]

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] E2E tests added/updated
- [ ] Manual testing performed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Tests pass locally
- [ ] Documentation updated
- [ ] No breaking changes (or documented if necessary)
```

## Reporting Bugs

When reporting bugs, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS information
- Screenshots if applicable
- Console errors if relevant

## Feature Requests

For feature requests:

- Describe the use case clearly
- Explain why it would be valuable
- Consider implementation complexity
- Check if similar features exist

## Questions?

Feel free to open an issue for any questions or clarifications.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
