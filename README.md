# SQL Dojo — Interactive SQL Practice Platform

Modern SQL practice lab built with SvelteKit 2, Svelte 5 runes, UnoCSS, PGlite (PostgreSQL in WASM), CodeMirror 6, and Vercel AI SDK + Anthropic for streaming hints.

## Features

- **30+ SQL Challenges** across beginner, intermediate, and advanced difficulty levels
- **3 Real-World Databases** (employees, e-commerce, movies) with realistic schemas
- **In-Browser PostgreSQL** powered by PGlite (WASM) - no server required
- **AI-Powered Hints** from Claude 3.5 Sonnet to guide your learning
- **Progress Tracking** with points, streaks, and completion rates
- **Query History** to review and reload past attempts
- **Concept Filtering** to focus on specific SQL topics (JOINs, GROUP BY, etc.)
- **CSV Export** for query results
- **Playground Mode** for free-form SQL experimentation
- **Modern Code Editor** with CodeMirror 6, syntax highlighting, and Cmd/Ctrl+Enter shortcuts
- **Full Accessibility** with ARIA labels, keyboard navigation, and screen reader support

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (optional, for AI hints):

```bash
cp .env.example .env
```

4. Add your Anthropic API key to `.env`:

```
ANTHROPIC_API_KEY=your_api_key_here
```

Get your API key from [Anthropic Console](https://console.anthropic.com/)

5. Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

### Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Code Quality

- `npm run check` - Run TypeScript type checking
- `npm run lint` - Run ESLint and Prettier checks
- `npm run format` - Auto-format code with Prettier

### Testing

- `npm test` - Run unit tests with Vitest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate test coverage report
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run test:e2e:ui` - Run E2E tests with UI
- `npm run test:all` - Run all tests (unit + E2E)

## Architecture

### Tech Stack

- **Frontend Framework**: SvelteKit 2 + Svelte 5 (with runes)
- **Styling**: UnoCSS (Tailwind-compatible)
- **Database**: PGlite (PostgreSQL WASM)
- **Code Editor**: CodeMirror 6
- **AI Integration**: Vercel AI SDK + Anthropic Claude 3.5 Sonnet
- **Type Safety**: TypeScript 5.9 (strict mode)
- **Testing**: Vitest + Playwright + Testing Library

### Project Structure

```
src/
├── lib/
│   ├── components/          # Reusable UI components
│   │   ├── ChallengeSelector.svelte
│   │   ├── ChallengeEditor.svelte
│   │   ├── ProgressDashboard.svelte
│   │   ├── SchemaExplorer.svelte
│   │   ├── Playground.svelte
│   │   ├── QueryHistory.svelte
│   │   ├── ConceptFilter.svelte
│   │   ├── Editor.svelte
│   │   └── ResultsTable.svelte
│   │
│   ├── stores/              # Svelte 5 stores
│   │   ├── progressStore.svelte.ts
│   │   └── queryHistoryStore.svelte.ts
│   │
│   ├── logic/               # Business logic
│   │   └── runner.ts        # SQL execution & validation
│   │
│   ├── data/                # Static data
│   │   └── challenges.ts    # Challenge definitions & DB seeds
│   │
│   ├── utils/               # Utility functions
│   │   └── index.ts         # Helpers (debounce, CSV export, etc.)
│   │
│   └── types.ts             # TypeScript type definitions
│
├── routes/
│   ├── +page.svelte         # Main application page
│   ├── +layout.svelte       # Root layout
│   └── api/hint/+server.ts  # AI hint API endpoint
│
└── app.html                 # HTML shell

tests/
├── e2e/                     # Playwright E2E tests
└── ...                      # Unit tests co-located with source
```

### Key Improvements (Recently Implemented)

1. **Performance Optimization**
   - PGlite instance pooling to reduce WASM initialization overhead
   - Debounced localStorage writes to prevent performance issues
   - Parallel query execution for challenge validation

2. **Code Quality**
   - Modular component architecture (from 415-line monolith to focused components)
   - Centralized state management with Svelte 5 stores
   - Comprehensive JSDoc documentation
   - Input validation with Zod schemas

3. **User Experience**
   - Progress reset functionality
   - Concept-based filtering for challenges
   - Query history with timestamp tracking
   - CSV export for results
   - Enhanced accessibility (ARIA labels, keyboard navigation)
   - Better error messages and validation

4. **Developer Experience**
   - Full testing infrastructure (Vitest + Playwright)
   - Type-safe API endpoints
   - Utility functions with unit tests
   - Clear separation of concerns

## Environment Variables

| Variable            | Required | Description                    |
| ------------------- | -------- | ------------------------------ |
| `ANTHROPIC_API_KEY` | No\*     | Anthropic API key for AI hints |

\*The app works without the API key, but AI hints will not be available.

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project to Vercel
3. Add `ANTHROPIC_API_KEY` environment variable
4. Deploy

### Other Platforms

The app uses `adapter-auto` which automatically detects your deployment platform. For other platforms, you may need to install a specific adapter:

```bash
# For Node.js
npm install -D @sveltejs/adapter-node

# For static hosting
npm install -D @sveltejs/adapter-static
```

Update `svelte.config.js` to use your chosen adapter.

## Database Schemas

### Employees Database

- `departments` - Department information
- `employees` - Employee records with hire dates and salaries
- `dept_manager` - Department manager assignments
- `dept_emp` - Department employee assignments
- `salaries` - Salary history

### E-commerce Database

- `customers` - Customer profiles
- `products` - Product catalog
- `orders` - Order records
- `order_items` - Order line items

### Movies Database

- `movies` - Film catalog with ratings
- `actors` - Actor profiles
- `directors` - Director profiles
- `movie_actors` - Actor-movie relationships

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

MIT

## Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- Powered by [PGlite](https://github.com/electric-sql/pglite)
- AI hints by [Anthropic Claude](https://www.anthropic.com/)
- Styled with [UnoCSS](https://unocss.dev/)
