export type Difficulty = 'beginner' | 'intermediate' | 'advanced';
export type SampleDatabase = 'employees' | 'ecommerce' | 'movies';

export interface Challenge {
	id: string;
	title: string;
	prompt: string;
	difficulty: Difficulty;
	points: number;
	database: SampleDatabase;
	starterSQL: string;
	solutionSQL: string;
	concepts: string[];
}

export interface TableResult {
	fields: string[];
	rows: Record<string, unknown>[];
}

export type RunOutcome =
	| {
			ok: true;
			matches: boolean;
			actual: TableResult;
			expected: TableResult;
			durationMs: number;
	  }
	| { ok: false; error: string };

export interface PlaygroundResult {
	sql: string;
	result: TableResult | null;
	error?: string;
	durationMs?: number;
}

export interface ProgressState {
	completed: Record<string, boolean>;
	points: number;
	streak: number;
	lastCompletedDate: string | null;
	attempts: number;
}

export interface SchemaCatalogEntry {
	table: string;
	description?: string;
	columns: string[];
}
