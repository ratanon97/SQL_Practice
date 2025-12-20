# Requirements Document

## Project Overview

**SQL Dojo** is an interactive web-based SQL learning platform that enables users to practice SQL queries directly in their browser without needing server infrastructure. The platform provides structured challenges, real-time feedback, AI-powered assistance, and progress tracking to help users master SQL from beginner to advanced levels.

---

## Business Requirements

### Purpose and Vision

SQL Dojo addresses the gap in accessible, practical SQL education by eliminating traditional barriers to learning:

- No database installation required
- No server setup or configuration
- No account creation or signup friction
- Immediate hands-on practice with real PostgreSQL

The platform empowers users to learn by doing, with intelligent guidance and instant feedback that accelerates the learning journey from basic queries to complex data analysis.

### Target Users

**Primary Audience:**

- Aspiring data analysts and developers learning SQL for the first time
- Students in data science or computer science programs
- Career changers transitioning into data-related roles
- Professionals refreshing SQL skills after time away

**Secondary Audience:**

- Bootcamp instructors looking for teaching resources
- Interviewers preparing SQL assessment questions
- Self-learners building portfolio projects

### Core User Needs

**As a learner, I want to:**

1. Practice SQL without the complexity of database installation
2. Receive immediate feedback on whether my queries are correct
3. Get helpful guidance when stuck without being given the answer
4. Track my progress and build momentum through consistent practice
5. Focus on specific SQL concepts I need to improve
6. Experiment freely in a safe environment without breaking anything
7. Access the platform from any device with a web browser

**As an instructor, I want to:**

1. Recommend a tool that students can use immediately without setup
2. See realistic database schemas that mirror industry scenarios
3. Have confidence that students are learning standard SQL syntax

### Success Criteria

The platform succeeds when:

- Users complete their first challenge within 2 minutes of landing on the page
- 70% of users who complete one challenge attempt at least 3 more
- Users successfully solve challenges without hints 60% of the time
- The platform loads and executes queries in under 3 seconds
- Users report feeling more confident in SQL interviews
- Zero setup friction enables viral word-of-mouth growth

---

## Functional Requirements

### FR-1: Challenge System

**Business Need:** Users need structured, progressive learning paths with clear goals.

**Core Requirements:**

- **FR-1.1** MUST provide at least 30 unique SQL challenges
- **FR-1.2** MUST categorize challenges into three difficulty tiers:
  - Beginner: SELECT, WHERE, basic filtering (1-5 points)
  - Intermediate: JOINs, GROUP BY, aggregations (6-10 points)
  - Advanced: Subqueries, CTEs, window functions (11-15 points)
- **FR-1.3** MUST display challenge prompt with clear success criteria
- **FR-1.4** MUST provide starter SQL for each challenge
- **FR-1.5** MUST validate user query results against expected output
- **FR-1.6** MUST tag challenges with SQL concepts covered (JOIN, GROUP BY, etc.)
- **FR-1.7** MUST assign point values based on difficulty
- **FR-1.8** MUST support multiple database contexts (employees, e-commerce, movies)

**Technical Details:**

```typescript
interface Challenge {
	id: string; // Unique identifier
	title: string; // Display name
	prompt: string; // User-facing instructions
	difficulty: 'beginner' | 'intermediate' | 'advanced';
	points: number; // 1-15 based on difficulty
	database: 'employees' | 'ecommerce' | 'movies';
	starterSQL: string; // Initial query template
	solutionSQL: string; // Reference solution for validation
	concepts: string[]; // ['JOIN', 'GROUP BY', etc.]
}
```

### FR-2: In-Browser SQL Execution

**Business Need:** Users need immediate query execution without external dependencies.

**Core Requirements:**

- **FR-2.1** MUST execute SQL queries entirely in the browser using PGlite
- **FR-2.2** MUST support full PostgreSQL syntax and functions
- **FR-2.3** MUST initialize database instances on demand
- **FR-2.4** MUST seed databases with realistic sample data
- **FR-2.5** MUST execute queries within 500ms for typical workloads
- **FR-2.6** MUST provide structured result sets with column names and row data
- **FR-2.7** MUST isolate database instances to prevent cross-contamination
- **FR-2.8** MUST handle SQL syntax errors gracefully with helpful messages
- **FR-2.9** MUST support both read (SELECT) and write (INSERT, UPDATE) operations in playground mode

**Technical Details:**

```typescript
// PGlite pooling for performance
class PGlitePool {
  - Maintain pool of 2 instances per database type
  - Automatic cleanup and reset between queries
  - Eliminates repeated WASM initialization overhead
}

// Result structure
interface TableResult {
  fields: string[];                    // Column names
  rows: Record<string, unknown>[];     // Result rows
}
```

**Performance Targets:**

- Initial database load: < 2 seconds
- Query execution: < 500ms
- Result rendering: < 100ms

### FR-3: Query Validation

**Business Need:** Users need immediate, accurate feedback on query correctness.

**Core Requirements:**

- **FR-3.1** MUST compare user query results against expected results
- **FR-3.2** MUST execute both queries in parallel for performance
- **FR-3.3** MUST validate both schema (column names/order) and data (row content)
- **FR-3.4** MUST handle floating-point comparisons with tolerance
- **FR-3.5** MUST display both user results and expected results side-by-side
- **FR-3.6** MUST show execution time for performance awareness
- **FR-3.7** MUST mark challenges as complete only when results match exactly
- **FR-3.8** MUST prevent gaming by checking query logic, not just output

**Validation Logic:**

1. Execute user query against challenge database
2. Execute solution query against same database
3. Compare column names and order
4. Compare row count
5. Compare row data with type-aware equality
6. Report differences clearly to user

### FR-4: AI-Powered Hints

**Business Need:** Users need contextual guidance without receiving direct answers.

**Core Requirements:**

- **FR-4.1** MUST provide on-demand hints via AI integration
- **FR-4.2** MUST use Claude 3.5 Sonnet for hint generation
- **FR-4.3** MUST stream hints in real-time for responsive UX
- **FR-4.4** MUST provide context-aware hints based on:
  - Challenge prompt and requirements
  - User's current query attempt
  - Database schema and available tables
- **FR-4.5** MUST NOT provide complete solutions
- **FR-4.6** MUST guide users toward correct SQL concepts
- **FR-4.7** MUST gracefully degrade if API key not configured
- **FR-4.8** MUST validate hint requests to prevent abuse

**Technical Details:**

```typescript
// API endpoint: /api/hint
POST request with:
{
  challengeTitle: string;
  prompt: string;
  userQuery: string;
  schemaInfo: string;
}

Response: Streaming text (Server-Sent Events)
```

**Hint Strategy:**

- Identify gaps in user's query logic
- Suggest relevant SQL concepts
- Reference schema tables/columns
- Provide examples without solving the problem
- Encourage experimentation

### FR-5: Progress Tracking

**Business Need:** Users need motivation and visibility into learning progress.

**Core Requirements:**

- **FR-5.1** MUST track completed challenges per user
- **FR-5.2** MUST calculate total points earned
- **FR-5.3** MUST maintain daily completion streak
- **FR-5.4** MUST count total attempts across all challenges
- **FR-5.5** MUST persist progress to browser localStorage
- **FR-5.6** MUST calculate and display completion percentage
- **FR-5.7** MUST update progress in real-time as challenges are completed
- **FR-5.8** MUST provide progress reset functionality with confirmation
- **FR-5.9** MUST break streaks if no completion yesterday or today

**Technical Details:**

```typescript
interface ProgressState {
	completed: Record<string, boolean>; // Challenge ID -> completed
	points: number; // Total points earned
	streak: number; // Consecutive days
	lastCompletedDate: string | null; // ISO date string
	attempts: number; // Total query runs
}
```

**Streak Logic:**

- Increment streak when challenge completed on new day
- Reset streak if last completion was before yesterday
- Maintain streak if completion today or yesterday

### FR-6: Code Editor

**Business Need:** Users need a professional SQL editing experience.

**Core Requirements:**

- **FR-6.1** MUST provide syntax highlighting for SQL
- **FR-6.2** MUST support keyboard shortcuts (Cmd/Ctrl+Enter to run)
- **FR-6.3** MUST display line numbers for reference
- **FR-6.4** MUST use monospace font for code clarity
- **FR-6.5** MUST support multi-line queries
- **FR-6.6** MUST provide SQL autocomplete suggestions
- **FR-6.7** MUST support standard editor operations (undo, redo, select all)
- **FR-6.8** MUST use dark theme for reduced eye strain
- **FR-6.9** MUST handle tabs and indentation intelligently
- **FR-6.10** MUST resize to accommodate query length

**Technical Implementation:**

- CodeMirror 6 for editor functionality
- `@codemirror/lang-sql` for SQL language support
- `@codemirror/autocomplete` for completions
- `@codemirror/theme-one-dark` for dark theme
- Custom key bindings for execution

### FR-7: Schema Explorer

**Business Need:** Users need easy reference to database structure while writing queries.

**Core Requirements:**

- **FR-7.1** MUST display all tables in current database
- **FR-7.2** MUST show column names for each table
- **FR-7.3** MUST organize schema by table
- **FR-7.4** MUST remain visible while editing queries
- **FR-7.5** MUST update when switching databases
- **FR-7.6** MUST provide table descriptions where available
- **FR-7.7** MUST be collapsible to maximize screen space

**Schema Information:**

```typescript
interface SchemaCatalogEntry {
	table: string;
	description?: string;
	columns: string[];
}
```

### FR-8: Query History

**Business Need:** Users need to review past attempts and learn from iterations.

**Core Requirements:**

- **FR-8.1** MUST record every query execution
- **FR-8.2** MUST store up to 50 most recent queries per user
- **FR-8.3** MUST display timestamp for each query
- **FR-8.4** MUST indicate success/failure status
- **FR-8.5** MUST show challenge context for each query
- **FR-8.6** MUST allow loading previous queries back into editor
- **FR-8.7** MUST filter history by current challenge
- **FR-8.8** MUST persist history to localStorage
- **FR-8.9** MUST format timestamps in human-readable form

**History Entry Structure:**

```typescript
interface HistoryEntry {
	id: string; // Unique identifier
	sql: string; // Query text
	timestamp: string; // ISO timestamp
	success: boolean; // Validation result
	challengeId: string; // Associated challenge
}
```

### FR-9: Playground Mode

**Business Need:** Users need a space for free-form experimentation without validation pressure.

**Core Requirements:**

- **FR-9.1** MUST provide unrestricted SQL query interface
- **FR-9.2** MUST allow database switching (employees, e-commerce, movies)
- **FR-9.3** MUST execute any valid PostgreSQL query
- **FR-9.4** MUST display results without validation
- **FR-9.5** MUST support both read and write operations
- **FR-9.6** MUST show execution time
- **FR-9.7** MUST handle errors gracefully
- **FR-9.8** MUST reset database state on demand
- **FR-9.9** MUST allow CSV export of results

**Use Cases:**

- Testing query syntax before applying to challenge
- Exploring database relationships
- Practicing concepts outside challenges
- Experimenting with advanced PostgreSQL features

### FR-10: Concept Filtering

**Business Need:** Users need to focus practice on specific SQL topics.

**Core Requirements:**

- **FR-10.1** MUST tag all challenges with relevant SQL concepts
- **FR-10.2** MUST provide concept filter UI
- **FR-10.3** MUST support filtering by multiple concepts simultaneously
- **FR-10.4** MUST show challenge count for each concept
- **FR-10.5** MUST update challenge list dynamically when filters change
- **FR-10.6** MUST persist filter selections across sessions
- **FR-10.7** MUST provide clear indication when filters are active
- **FR-10.8** MUST allow easy filter clearing

**Supported Concepts:**

- SELECT basics
- WHERE clause
- JOIN operations (INNER, LEFT, RIGHT, FULL)
- GROUP BY aggregation
- HAVING clause
- Subqueries
- Common Table Expressions (CTEs)
- Window functions
- CASE expressions
- Date/time functions
- String functions
- DISTINCT
- ORDER BY
- LIMIT/OFFSET

### FR-11: Data Export

**Business Need:** Users need to extract query results for external analysis or reporting.

**Core Requirements:**

- **FR-11.1** MUST export query results to CSV format
- **FR-11.2** MUST include column headers in export
- **FR-11.3** MUST properly escape special characters (quotes, commas, newlines)
- **FR-11.4** MUST generate downloadable file
- **FR-11.5** MUST name files descriptively (e.g., `sql-dojo-results-2025-12-10.csv`)
- **FR-11.6** MUST handle empty result sets gracefully
- **FR-11.7** MUST preserve data types in string representation
- **FR-11.8** MUST work for both challenge and playground results

**CSV Format:**

- RFC 4180 compliant
- UTF-8 encoding
- Comma delimiters
- Double-quote escaping

### FR-12: Results Display

**Business Need:** Users need clear, readable presentation of query results.

**Core Requirements:**

- **FR-12.1** MUST display results in tabular format
- **FR-12.2** MUST show column headers with clear labels
- **FR-12.3** MUST handle large result sets with scrolling
- **FR-12.4** MUST indicate row count
- **FR-12.5** MUST format NULL values distinctly
- **FR-12.6** MUST preserve column alignment
- **FR-12.7** MUST handle wide tables with horizontal scrolling
- **FR-12.8** MUST show "No results" message for empty sets
- **FR-12.9** MUST display execution time
- **FR-12.10** MUST show validation status (matches/doesn't match expected)

**Table Features:**

- Responsive design
- Zebra striping for readability
- Fixed header on scroll
- Monospace font for data
- Distinct styling for expected vs actual results

---

## Non-Functional Requirements

### NFR-1: Performance

**Business Need:** Users need instant feedback to maintain engagement and learning flow.

**Core Requirements:**

- **NFR-1.1** MUST load initial page within 2 seconds on 3G connection
- **NFR-1.2** MUST initialize PGlite database within 2 seconds
- **NFR-1.3** MUST execute typical queries within 500ms
- **NFR-1.4** MUST render results within 100ms
- **NFR-1.5** MUST respond to user interactions within 100ms
- **NFR-1.6** MUST debounce localStorage writes to prevent performance degradation
- **NFR-1.7** MUST pool PGlite instances to avoid repeated initialization
- **NFR-1.8** MUST execute validation queries in parallel
- **NFR-1.9** MUST stream AI hints without blocking UI

**Performance Targets:**

- Time to Interactive (TTI): < 3 seconds
- First Contentful Paint (FCP): < 1.5 seconds
- Cumulative Layout Shift (CLS): < 0.1
- Time to First Query Result: < 3 seconds total

**Optimization Strategies:**

- Code splitting for editor and PGlite
- Lazy loading of non-critical components
- Instance pooling (2 per database type)
- Debounced persistence (500ms delay)
- Parallel query execution

### NFR-2: Accessibility

**Business Need:** Platform must be usable by everyone, including users with disabilities.

**Core Requirements:**

- **NFR-2.1** MUST meet WCAG 2.1 AA standards
- **NFR-2.2** MUST support full keyboard navigation
- **NFR-2.3** MUST provide ARIA labels for all interactive elements
- **NFR-2.4** MUST maintain color contrast ratio of at least 4.5:1
- **NFR-2.5** MUST work with screen readers (NVDA, JAWS, VoiceOver)
- **NFR-2.6** MUST provide text alternatives for visual content
- **NFR-2.7** MUST use semantic HTML elements
- **NFR-2.8** MUST indicate focus states clearly
- **NFR-2.9** MUST provide skip links for navigation
- **NFR-2.10** MUST announce dynamic content changes via live regions

**Keyboard Shortcuts:**

- `Cmd/Ctrl+Enter`: Execute query
- `Tab`: Navigate between elements
- `Enter`: Activate buttons
- `Escape`: Close modals/dialogs
- `Arrow keys`: Navigate lists

**Screen Reader Support:**

- Proper heading hierarchy (h1 → h2 → h3)
- Form labels associated with inputs
- Button labels describe action
- Status messages announced
- Progress updates communicated

### NFR-3: Usability

**Business Need:** Users should accomplish goals with minimal friction and cognitive load.

**Core Requirements:**

- **NFR-3.1** MUST enable first query execution within 2 minutes of landing
- **NFR-3.2** MUST provide clear error messages with actionable guidance
- **NFR-3.3** MUST show loading states for async operations
- **NFR-3.4** MUST use consistent terminology throughout
- **NFR-3.5** MUST provide contextual help and examples
- **NFR-3.6** MUST group related functionality logically
- **NFR-3.7** MUST use familiar UI patterns and conventions
- **NFR-3.8** MUST minimize required user inputs
- **NFR-3.9** MUST provide confirmation for destructive actions
- **NFR-3.10** MUST maintain context when switching between challenges

**UX Principles:**

- Progressive disclosure (advanced features hidden initially)
- Immediate feedback (no delayed responses)
- Forgiving design (easy undo/retry)
- Consistency (same patterns throughout)
- Recognition over recall (visible options)

### NFR-4: Security

**Business Need:** User data and platform integrity must be protected.

**Core Requirements:**

- **NFR-4.1** MUST validate all API inputs with Zod schemas
- **NFR-4.2** MUST sanitize user queries to prevent XSS
- **NFR-4.3** MUST store API keys securely (server-side only)
- **NFR-4.4** MUST use HTTPS for all external requests
- **NFR-4.5** MUST not expose sensitive data in client-side code
- **NFR-4.6** MUST implement rate limiting on AI hint endpoint
- **NFR-4.7** MUST not execute arbitrary code outside PGlite sandbox
- **NFR-4.8** MUST validate environment variables on server startup
- **NFR-4.9** MUST exclude sensitive files from version control

**Security Considerations:**

- PGlite runs in WASM sandbox (isolated from system)
- LocalStorage contains only user progress (no sensitive data)
- API key never sent to client
- SQL queries isolated to browser context
- No server-side query execution (eliminates SQL injection risk)

**Content Security Policy:**

```
default-src 'self';
script-src 'self' 'wasm-unsafe-eval';
style-src 'self' 'unsafe-inline';
connect-src 'self' https://api.anthropic.com;
```

### NFR-5: Reliability

**Business Need:** Platform must function consistently across sessions and environments.

**Core Requirements:**

- **NFR-5.1** MUST handle network failures gracefully
- **NFR-5.2** MUST persist user data reliably to localStorage
- **NFR-5.3** MUST recover from database initialization failures
- **NFR-5.4** MUST validate stored data on load
- **NFR-5.5** MUST handle localStorage quota exceeded
- **NFR-5.6** MUST provide fallback when localStorage unavailable
- **NFR-5.7** MUST handle browser crashes without data loss
- **NFR-5.8** MUST validate challenge data integrity
- **NFR-5.9** MUST handle PGlite errors without crashing app

**Error Recovery:**

- Automatic retry for transient failures
- Clear error messages with recovery steps
- Fallback to default state when data corrupted
- Graceful degradation when features unavailable

**Data Persistence:**

- Debounced writes (500ms) to prevent excessive I/O
- Validation on read to detect corruption
- Automatic cleanup of old history entries
- Version checking for schema migrations

### NFR-6: Maintainability

**Business Need:** Codebase must remain easy to understand, modify, and extend.

**Core Requirements:**

- **NFR-6.1** MUST use TypeScript strict mode
- **NFR-6.2** MUST document all public functions with JSDoc
- **NFR-6.3** MUST maintain test coverage above 70%
- **NFR-6.4** MUST follow consistent code style (enforced by Prettier)
- **NFR-6.5** MUST separate concerns (components, stores, logic, data)
- **NFR-6.6** MUST avoid components exceeding 150 lines
- **NFR-6.7** MUST use descriptive variable and function names
- **NFR-6.8** MUST keep cyclomatic complexity below 10 per function
- **NFR-6.9** MUST provide comprehensive README documentation
- **NFR-6.10** MUST include contributing guidelines

**Code Quality Standards:**

- ESLint for linting
- Prettier for formatting
- TypeScript for type safety
- Vitest for unit testing
- Playwright for E2E testing

**Architecture Principles:**

- Component modularity (< 150 lines each)
- Single responsibility principle
- Clear separation of concerns
- Minimal prop drilling (use stores)
- Reusable utilities

### NFR-7: Compatibility

**Business Need:** Platform must work across diverse devices and browsers.

**Core Requirements:**

- **NFR-7.1** MUST support Chrome, Firefox, Safari, Edge (latest 2 versions)
- **NFR-7.2** MUST function on desktop (1024px+ width)
- **NFR-7.3** MUST function on tablet (768px - 1023px width)
- **NFR-7.4** MUST provide mobile-optimized experience (320px - 767px width)
- **NFR-7.5** MUST support WebAssembly (required for PGlite)
- **NFR-7.6** MUST handle browsers without localStorage
- **NFR-7.7** MUST detect and communicate unsupported browsers
- **NFR-7.8** MUST work without JavaScript frameworks on client (progressive enhancement)

**Browser Requirements:**

- WebAssembly support (for PGlite)
- ES2020+ JavaScript support
- LocalStorage API
- Fetch API for network requests
- CSS Grid and Flexbox

**Responsive Breakpoints:**

- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

### NFR-8: Testability

**Business Need:** Application quality must be verifiable through automated testing.

**Core Requirements:**

- **NFR-8.1** MUST include unit tests for all utility functions
- **NFR-8.2** MUST include component tests for complex components
- **NFR-8.3** MUST include E2E tests for critical user flows
- **NFR-8.4** MUST achieve > 70% code coverage
- **NFR-8.5** MUST run tests in CI/CD pipeline
- **NFR-8.6** MUST complete test suite in under 5 minutes
- **NFR-8.7** MUST provide test reports and coverage metrics
- **NFR-8.8** MUST mock external dependencies (AI API, localStorage)

**Testing Strategy:**

- Unit tests: Vitest for logic functions
- Component tests: Testing Library + Vitest
- E2E tests: Playwright for user flows
- Visual tests: Manual review (future: automated)

**Critical Test Scenarios:**

- Query execution and validation
- Progress tracking and persistence
- Challenge completion flow
- Hint request and streaming
- Error handling and recovery
- Export functionality

---

## Technical Architecture

### Tech Stack

**Frontend Framework:**

- SvelteKit 2.48+ (full-stack framework)
- Svelte 5.43+ (UI framework with runes)

**Styling:**

- UnoCSS 66.5+ (atomic CSS, Tailwind-compatible)
- Custom CSS for component-specific styles

**Database:**

- PGlite 0.3.14+ (PostgreSQL WASM)
- In-browser, zero-config

**Code Editor:**

- CodeMirror 6.38+
- SQL language support
- Autocomplete
- One Dark theme

**AI Integration:**

- Vercel AI SDK 5.0+
- Anthropic Claude 3.5 Sonnet
- Streaming responses

**Type Safety:**

- TypeScript 5.9+ (strict mode)
- Zod 4.1+ for runtime validation

**Testing:**

- Vitest 4.0+ (unit/component tests)
- Playwright 1.57+ (E2E tests)
- Testing Library 5.2+ (component testing)

**Development:**

- Vite 7.2+ (build tool)
- ESLint 9+ (linting)
- Prettier 3.6+ (formatting)

### Data Models

**Challenges:**

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
```

**Progress:**

```typescript
interface ProgressState {
	completed: Record<string, boolean>;
	points: number;
	streak: number;
	lastCompletedDate: string | null;
	attempts: number;
}
```

**Query History:**

```typescript
interface HistoryEntry {
	id: string;
	sql: string;
	timestamp: string;
	success: boolean;
	challengeId: string;
}
```

**Query Results:**

```typescript
interface TableResult {
	fields: string[];
	rows: Record<string, unknown>[];
}

interface RunOutcome {
	ok: boolean;
	matches?: boolean;
	actual?: TableResult;
	expected?: TableResult;
	error?: string;
	durationMs?: number;
}
```

### Database Schemas

**Employees Database:**

```sql
departments (dept_no, dept_name)
employees (emp_no, first_name, last_name, hire_date, salary)
dept_manager (dept_no, emp_no, from_date, to_date)
dept_emp (dept_no, emp_no, from_date, to_date)
salaries (emp_no, salary, from_date, to_date)
```

**E-commerce Database:**

```sql
customers (customer_id, name, email, join_date)
products (product_id, name, category, price, stock)
orders (order_id, customer_id, order_date, total)
order_items (order_item_id, order_id, product_id, quantity, price)
```

**Movies Database:**

```sql
movies (movie_id, title, year, rating, revenue)
actors (actor_id, name, birth_year)
directors (director_id, name, birth_year)
movie_actors (movie_id, actor_id, character_name)
```

### API Endpoints

**POST /api/hint**

- Purpose: Generate AI-powered hints for challenges
- Request body:
  ```typescript
  {
  	challengeTitle: string;
  	prompt: string;
  	userQuery: string;
  	schemaInfo: string;
  }
  ```
- Response: Server-Sent Events (streaming text)
- Authentication: Server-side API key validation
- Rate limiting: Recommended (future enhancement)

### State Management

**Svelte 5 Stores:**

- `progressStore`: Global progress tracking
- `queryHistoryStore`: Query execution history

**Component State:**

- Local runes for UI state
- Props for parent-child communication
- Event dispatching for child-parent communication

### File Structure

```
src/
├── lib/
│   ├── components/          # UI components
│   │   ├── ChallengeSelector.svelte
│   │   ├── ChallengeEditor.svelte
│   │   ├── ConceptFilter.svelte
│   │   ├── Editor.svelte
│   │   ├── Playground.svelte
│   │   ├── ProgressDashboard.svelte
│   │   ├── QueryHistory.svelte
│   │   ├── ResultsTable.svelte
│   │   └── SchemaExplorer.svelte
│   │
│   ├── stores/              # Global state
│   │   ├── progressStore.svelte.ts
│   │   └── queryHistoryStore.svelte.ts
│   │
│   ├── logic/               # Business logic
│   │   └── runner.ts        # SQL execution & validation
│   │
│   ├── data/                # Static data
│   │   └── challenges.ts    # Challenge definitions & seeds
│   │
│   ├── utils/               # Utilities
│   │   └── index.ts         # Helper functions
│   │
│   └── types.ts             # TypeScript types
│
├── routes/
│   ├── +page.svelte         # Main application
│   ├── +layout.svelte       # Root layout
│   └── api/hint/+server.ts  # AI hint endpoint
│
└── app.html                 # HTML shell

tests/
├── e2e/                     # Playwright E2E tests
└── *.test.ts                # Unit tests (co-located)
```

---

## Dependencies

### Core Dependencies

| Package              | Version  | Purpose               |
| -------------------- | -------- | --------------------- |
| svelte               | ^5.43.8  | UI framework          |
| @sveltejs/kit        | ^2.48.5  | Full-stack framework  |
| @electric-sql/pglite | ^0.3.14  | PostgreSQL WASM       |
| @codemirror/view     | ^6.38.8  | Code editor core      |
| @codemirror/lang-sql | ^6.10.0  | SQL syntax support    |
| @ai-sdk/anthropic    | ^2.0.53  | Anthropic integration |
| ai                   | ^5.0.108 | AI SDK core           |
| unocss               | ^66.5.10 | Utility CSS           |
| zod                  | ^4.1.13  | Schema validation     |
| typescript           | ^5.9.3   | Type system           |

### Development Dependencies

| Package                 | Version | Purpose           |
| ----------------------- | ------- | ----------------- |
| vitest                  | ^4.0.15 | Unit testing      |
| @playwright/test        | ^1.57.0 | E2E testing       |
| eslint                  | ^9.39.1 | Linting           |
| prettier                | ^3.6.2  | Code formatting   |
| @testing-library/svelte | ^5.2.9  | Component testing |

### External Services

**Anthropic API:**

- Endpoint: `https://api.anthropic.com`
- Model: Claude 3.5 Sonnet
- Purpose: AI hint generation
- Required: Optional (graceful degradation)

---

## Environment Configuration

### Environment Variables

| Variable            | Required | Description                    | Default |
| ------------------- | -------- | ------------------------------ | ------- |
| `ANTHROPIC_API_KEY` | No       | Anthropic API key for AI hints | -       |

### Configuration Files

**.env.example:**

```
ANTHROPIC_API_KEY=your_api_key_here
```

**svelte.config.js:**

- Adapter configuration
- Preprocessor setup

**vite.config.ts:**

- Build configuration
- Plugin setup

**unocss.config.ts:**

- CSS utility configuration
- Preset setup

---

## Deployment Requirements

### Production Environment

**Platform:** Vercel (recommended), Netlify, Node.js server, or static hosting

**Build Process:**

```bash
npm install
npm run build
```

**Build Output:**

- `.svelte-kit/output` - Server and client bundles
- Adapter-specific output structure

**Environment Variables:**

- Set `ANTHROPIC_API_KEY` in deployment platform
- Required for AI hints feature

### Performance Requirements

**Bundle Size:**

- Initial JS: < 200KB gzipped
- PGlite WASM: ~2MB (lazy loaded)
- Total transfer: < 3MB

**Caching Strategy:**

- Static assets: 1 year cache
- API responses: No cache (dynamic)
- PGlite WASM: 1 month cache

### Monitoring

**Recommended Metrics:**

- Page load time (Target: < 2s)
- Time to interactive (Target: < 3s)
- Query execution time (Target: < 500ms)
- Error rate (Target: < 1%)
- API hint success rate (Target: > 95%)

---

## Constraints and Assumptions

### Technical Constraints

1. **Browser Requirements**: WebAssembly support mandatory (PGlite dependency)
2. **Client-Side Only**: All SQL execution happens in browser
3. **PostgreSQL Syntax**: Must use PostgreSQL-compatible SQL
4. **LocalStorage Limits**: ~5-10MB quota (sufficient for progress data)
5. **API Dependency**: AI hints require Anthropic API access

### Business Constraints

1. **Free Access**: No authentication or payment required
2. **English Only**: All content in English
3. **No Mobile App**: Web-only (mobile responsive)
4. **No Collaboration**: Single-user experience
5. **No Server Database**: No persistent server-side data storage

### Assumptions

1. Users have modern browsers (last 2 years)
2. Users have basic SQL knowledge or willingness to learn
3. Users have stable internet for initial load
4. Challenges remain static (no user-generated content)
5. LocalStorage available and functional
6. Users accept client-side data storage

---

## Future Enhancements (Out of Scope)

The following features are not included in current requirements but may be considered for future versions:

### Phase 2 Features

1. **User Accounts & Authentication**
   - Sync progress across devices
   - Leaderboards and social features
   - Achievement badges
   - Persistent cloud storage

2. **Advanced Learning Features**
   - Query explanation ("Explain this SQL")
   - Execution plan visualization
   - Performance optimization hints
   - Query formatter
   - Syntax error highlighting with line markers

3. **Content Expansion**
   - 50+ additional challenges
   - Additional databases (analytics, SaaS)
   - Custom challenge creation
   - Video tutorials
   - Written lessons integrated with challenges

4. **Collaboration Features**
   - Challenge sharing
   - Team competitions
   - Peer review
   - Discussion forums

5. **Customization**
   - Light/dark theme toggle
   - Editor themes and fonts
   - Keyboard shortcut customization
   - Challenge difficulty adjustment

### Phase 3 Features

1. **Advanced Analytics**
   - Learning path recommendations
   - Skill gap analysis
   - Time-to-completion metrics
   - Common error patterns

2. **Integration**
   - VS Code extension
   - API for external platforms
   - LMS integration (Canvas, Moodle)
   - SSO support

3. **Monetization** (if needed)
   - Premium challenges
   - Certification program
   - Corporate training licenses
   - Ad-free experience

---

## Acceptance Criteria

The project meets requirements when:

**Core Functionality:**

1. ✅ User can complete a SQL challenge end-to-end within 2 minutes of landing
2. ✅ Query results are validated accurately against expected output
3. ✅ Progress persists across browser sessions
4. ✅ AI hints provide helpful guidance without giving away answers
5. ✅ All 30+ challenges load and execute correctly

**User Experience:** 6. ✅ Code editor provides syntax highlighting and keyboard shortcuts 7. ✅ Schema explorer shows all tables and columns for current database 8. ✅ Query history tracks all executions with timestamps 9. ✅ Playground mode allows free-form SQL experimentation 10. ✅ CSV export generates valid downloadable files

**Technical Quality:** 11. ✅ All TypeScript strict mode checks pass 12. ✅ Test coverage exceeds 70% 13. ✅ All E2E tests pass on Chrome, Firefox, Safari 14. ✅ Page loads in under 2 seconds on 3G 15. ✅ Queries execute in under 500ms

**Accessibility:** 16. ✅ WCAG 2.1 AA compliance verified 17. ✅ Full keyboard navigation functional 18. ✅ Screen reader announces all dynamic content 19. ✅ Color contrast meets 4.5:1 minimum

**Documentation:** 20. ✅ README provides complete setup instructions 21. ✅ CONTRIBUTING guide explains development workflow 22. ✅ All public functions have JSDoc comments 23. ✅ Environment variables documented

**Deployment:** 24. ✅ Application builds without errors 25. ✅ Deployed to Vercel with AI hints functional

---

## Document Metadata

- **Version:** 1.0.0
- **Last Updated:** 2025-12-10
- **Project:** SQL Dojo
- **Status:** Active Development
- **Maintained By:** SQL Dojo Team
