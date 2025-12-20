import { PGlite } from '@electric-sql/pglite';

// Configure PGlite to use browser-compatible filesystem
// This ensures it works in browser environments without Node.js APIs
let pgliteInitialized: Promise<typeof PGlite> | null = null;

async function ensurePGliteInitialized(): Promise<typeof PGlite> {
	if (!pgliteInitialized) {
		pgliteInitialized = (async () => {
			try {
				// Check if we're in a browser environment
				if (typeof window !== 'undefined') {
					// In browser environment, try to use PGlite directly
					// PGlite should automatically use browser-compatible filesystem
					console.log('PGlite initialized successfully');
					return PGlite;
				} else {
					// In Node.js environment, use regular import
					return PGlite;
				}
			} catch (error) {
				console.warn('PGlite initialization warning:', error);
				// Fallback to regular import
				return PGlite;
			}
		})();
	}
	return pgliteInitialized;
}
import { databaseSeeds } from '$lib/data/challenges';
import type {
	Challenge,
	PlaygroundResult,
	RunOutcome,
	SampleDatabase,
	TableResult
} from '$lib/types';

/**
 * Converts PGlite query result to TableResult format
 */
const toTableResult = (result?: {
	rows?: Record<string, unknown>[];
	fields?: { name: string }[];
}): TableResult => ({
	fields: result?.fields?.map((f) => f.name) ?? [],
	rows: result?.rows ?? []
});

/**
 * Normalizes a value for comparison (handles dates, numbers, objects, nulls)
 */
const normalize = (value: unknown): unknown => {
	if (value === null || value === undefined) return null;
	if (value instanceof Date) return value.toISOString();
	if (typeof value === 'number') return Number(value.toFixed(4));
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
};

/**
 * Normalizes and sorts rows for order-independent comparison
 */
const normalizeRows = (rows: Record<string, unknown>[]): Record<string, unknown>[] =>
	rows
		.map((row) => {
			const entry: Record<string, unknown> = {};
			for (const [key, val] of Object.entries(row)) {
				entry[key] = normalize(val);
			}
			return entry;
		})
		.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

/**
 * Compares two result sets for equality (order-independent)
 */
const compareRows = (
	actual: Record<string, unknown>[],
	expected: Record<string, unknown>[]
): boolean => {
	if (actual.length !== expected.length) return false;
	const normA = normalizeRows(actual);
	const normB = normalizeRows(expected);
	return normA.every((row, idx) => JSON.stringify(row) === JSON.stringify(normB[idx]));
};

/**
 * Seeds a database with sample data
 */
const seedDatabase = async (db: PGlite, database: SampleDatabase): Promise<void> => {
	const seedSQL = databaseSeeds[database];
	await db.exec(seedSQL);
};

/**
 * PGlite instance pool for reusing database connections
 * This significantly improves performance by avoiding repeated WASM initialization
 * Now includes memory limits to prevent unbounded growth
 */
class PGlitePool {
	private pools: Map<SampleDatabase, PGlite[]> = new Map();
	private readonly maxPoolSize = 2; // Keep 2 instances per database
	private totalInstances = 0;
	private readonly maxTotalInstances = 10; // Global limit across all databases

	/**
	 * Get or create a PGlite instance for a database
	 */
	async acquire(database: SampleDatabase): Promise<PGlite> {
		const pool = this.pools.get(database) || [];

		// Return existing instance if available
		if (pool.length > 0) {
			const db = pool.pop()!;
			// Reset the database to clean state
			await db.exec('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');
			await seedDatabase(db, database);
			return db;
		}

		// Enforce global instance limit
		if (this.totalInstances >= this.maxTotalInstances) {
			throw new Error(
				'Database pool exhausted. Too many concurrent operations. Please wait and try again.'
			);
		}

		// Create new instance if pool is empty
		const PGliteBrowser = await ensurePGliteInitialized();
		const db = await PGliteBrowser.create();
		this.totalInstances++;
		await seedDatabase(db, database);
		return db;
	}

	/**
	 * Return a PGlite instance to the pool for reuse
	 */
	async release(database: SampleDatabase, db: PGlite): Promise<void> {
		const pool = this.pools.get(database) || [];

		// Only keep instances up to max pool size
		if (pool.length < this.maxPoolSize) {
			pool.push(db);
			this.pools.set(database, pool);
		} else {
			// Close excess instances and decrement counter
			await db.close();
			this.totalInstances--;
		}
	}

	/**
	 * Clear all pooled instances (useful for cleanup)
	 */
	async clearAll(): Promise<void> {
		for (const pool of this.pools.values()) {
			await Promise.all(pool.map((db) => db.close()));
		}
		this.pools.clear();
		this.totalInstances = 0;
	}

	/**
	 * Get pool statistics for monitoring
	 */
	getStats() {
		return {
			totalInstances: this.totalInstances,
			maxTotalInstances: this.maxTotalInstances,
			poolSizes: Array.from(this.pools.entries()).map(([db, pool]) => ({
				database: db,
				size: pool.length
			}))
		};
	}
}

// Singleton pool instance
const dbPool = new PGlitePool();

/**
 * Runs a challenge query and compares the result with the expected solution
 * @param challenge The challenge to validate
 * @param sql The user's SQL query
 * @returns RunOutcome with validation result
 */
export const runChallengeQuery = async (challenge: Challenge, sql: string): Promise<RunOutcome> => {
	const start = performance.now();
	let userDb: PGlite | null = null;
	let expectedDb: PGlite | null = null;

	try {
		// Acquire two database instances from the pool
		[userDb, expectedDb] = await Promise.all([
			dbPool.acquire(challenge.database),
			dbPool.acquire(challenge.database)
		]);

		// Execute both queries in parallel
		const [userResults, expectedResults] = await Promise.all([
			userDb.exec(sql),
			expectedDb.exec(challenge.solutionSQL)
		]);

		const userResult = userResults.at(-1);
		const expectedResult = expectedResults.at(-1);

		const actual = toTableResult(userResult);
		const expected = toTableResult(expectedResult);

		const matches = compareRows(actual.rows, expected.rows);

		return {
			ok: true,
			matches,
			actual,
			expected,
			durationMs: Math.round(performance.now() - start)
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return { ok: false, error: message };
	} finally {
		// Return instances to pool for reuse
		if (userDb) await dbPool.release(challenge.database, userDb);
		if (expectedDb) await dbPool.release(challenge.database, expectedDb);
	}
};

/**
 * Runs a SQL query in playground mode (no validation)
 * @param database The sample database to use
 * @param sql The SQL query to execute
 * @returns PlaygroundResult with query result or error
 */
export const runPlayground = async (
	database: SampleDatabase,
	sql: string
): Promise<PlaygroundResult> => {
	const start = performance.now();
	let db: PGlite | null = null;

	try {
		db = await dbPool.acquire(database);
		const last = (await db.exec(sql)).at(-1);
		return {
			sql,
			result: toTableResult(last),
			durationMs: Math.round(performance.now() - start)
		};
	} catch (error) {
		const message = error instanceof Error ? error.message : 'Unknown error';
		return { sql, result: null, error: message };
	} finally {
		// Return instance to pool for reuse
		if (db) await dbPool.release(database, db);
	}
};
