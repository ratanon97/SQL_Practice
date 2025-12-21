# Requirements Document

## Project Overview

**SQL Dojo** is an interactive web-based SQL learning platform that enables users to practice SQL queries directly in their browser. The platform provides structured challenges, real-time feedback, AI-powered assistance, and progress tracking.

**Key Value Propositions:**
- No database installation required
- No server setup or configuration
- No account creation or signup
- Immediate hands-on practice with real PostgreSQL

---

## Target Users

**Primary:** Aspiring data analysts, CS students, career changers, professionals refreshing SQL skills

**Secondary:** Bootcamp instructors, interviewers, self-learners

---

## Functional Requirements

### FR-1: Challenge System

- Provide 30+ unique SQL challenges across three difficulty tiers (beginner, intermediate, advanced)
- Display challenge prompt with clear success criteria and starter SQL
- Validate user query results against expected output
- Tag challenges with SQL concepts (JOIN, GROUP BY, etc.)
- Support multiple database contexts (employees, e-commerce, movies)

### FR-2: In-Browser SQL Execution

- Execute SQL queries entirely in browser using PGlite (PostgreSQL WASM)
- Support full PostgreSQL syntax and functions
- Execute queries within 500ms for typical workloads
- Isolate database instances to prevent cross-contamination
- Handle SQL syntax errors gracefully with helpful messages

### FR-3: Query Validation

- Compare user query results against expected results
- Validate both schema (column names/order) and data (row content)
- Display user results and expected results side-by-side
- Show execution time for performance awareness

### FR-4: AI-Powered Hints

- Provide on-demand hints via Claude 3.5 Sonnet
- Stream hints in real-time for responsive UX
- Provide context-aware hints based on challenge, user query, and schema
- Guide users toward correct SQL concepts without providing complete solutions
- Gracefully degrade if API key not configured

### FR-5: Progress Tracking

- Track completed challenges, total points, and daily streak
- Persist progress to browser localStorage
- Calculate and display completion percentage
- Provide progress reset functionality with confirmation

### FR-6: Code Editor

- Syntax highlighting for SQL (CodeMirror 6)
- Keyboard shortcuts (Cmd/Ctrl+Enter to run)
- SQL autocomplete suggestions
- Dark theme for reduced eye strain

### FR-7: Schema Explorer

- Display all tables and columns for current database
- Update when switching databases
- Remain visible while editing queries

### FR-8: Query History

- Record every query execution (up to 50 per user)
- Display timestamp and success/failure status
- Allow loading previous queries back into editor
- Filter history by current challenge

### FR-9: Playground Mode

- Unrestricted SQL query interface
- Database switching (employees, e-commerce, movies)
- Support both read and write operations
- CSV export of results

### FR-10: Concept Filtering

- Filter challenges by SQL concepts
- Support multiple concept selection
- Show challenge count for each concept

---

## Non-Functional Requirements

### NFR-1: Performance

- Initial page load: < 2 seconds on 3G
- PGlite initialization: < 2 seconds
- Query execution: < 500ms
- Result rendering: < 100ms

### NFR-2: Accessibility

- WCAG 2.1 AA compliance
- Full keyboard navigation
- ARIA labels for interactive elements
- Screen reader support

### NFR-3: Security

- Validate all API inputs with Zod schemas
- Sanitize user queries to prevent XSS
- Store API keys server-side only
- Rate limiting on AI hint endpoint
- PGlite runs in WASM sandbox (isolated)

### NFR-4: Browser Compatibility

- Chrome, Firefox, Safari, Edge (latest 2 versions)
- WebAssembly support required
- Responsive: mobile (320px+), tablet (768px+), desktop (1024px+)

### NFR-5: Maintainability

- TypeScript strict mode
- Test coverage > 70%
- ESLint + Prettier for code quality
- Component files < 150 lines

---

## Technical Architecture

### Tech Stack

| Category | Technology |
|----------|------------|
| Framework | SvelteKit 2 + Svelte 5 |
| Styling | UnoCSS |
| Database | PGlite (PostgreSQL WASM) |
| Editor | CodeMirror 6 |
| AI | Vercel AI SDK + Anthropic Claude |
| Validation | Zod |
| Testing | Vitest + Playwright |

### Data Models

```typescript
interface Challenge {
  id: string;
  title: string;
  prompt: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  points: number;
  database: 'employees' | 'ecommerce' | 'movies';
  starterSQL: string;
  solutionSQL: string;
  concepts: string[];
}

interface ProgressState {
  completed: Record<string, boolean>;
  points: number;
  streak: number;
  lastCompletedDate: string | null;
  attempts: number;
}

interface HistoryEntry {
  id: string;
  sql: string;
  timestamp: string;
  success: boolean;
  challengeId: string;
}
```

### Database Schemas

**Employees:** departments, employees, dept_manager, dept_emp, salaries

**E-commerce:** customers, products, orders, order_items

**Movies:** movies, actors, directors, movie_actors

### Project Structure

```
src/
├── lib/
│   ├── components/     # UI components
│   ├── stores/         # Svelte 5 stores
│   ├── logic/          # Business logic (runner.ts)
│   ├── data/           # Challenge definitions
│   ├── hooks/          # Custom hooks
│   ├── services/       # API and security services
│   └── utils/          # Helper functions
├── routes/
│   ├── +page.svelte    # Main application
│   └── api/hint/       # AI hint endpoint
tests/
├── e2e/                # Playwright E2E tests
└── *.test.ts           # Unit tests
```

---

## Environment Configuration

| Variable | Required | Description |
|----------|----------|-------------|
| `ANTHROPIC_API_KEY` | No | Anthropic API key for AI hints |

---

## Constraints

- **Browser-only execution**: All SQL runs client-side in PGlite
- **No authentication**: Free, anonymous access
- **English only**: All content in English
- **Static challenges**: No user-generated content

---

## Document Info

- **Version:** 2.0.0
- **Last Updated:** 2025-12-21
- **Status:** Production
