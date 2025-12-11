import { debounce } from '$lib/utils';
import { SecurityService } from '$lib/services/securityService';
import { z } from 'zod';

export interface QueryHistoryEntry {
	id: string;
	sql: string;
	timestamp: number;
	challengeId?: string;
	success?: boolean;
}

const STORAGE_KEY = 'sql-query-history';
const MAX_HISTORY_ITEMS = 50;

// Zod schema for query history entry validation
const QueryHistoryEntrySchema = z.object({
	id: z.string(),
	sql: z.string(),
	timestamp: z.number(),
	challengeId: z.string().optional(),
	success: z.boolean().optional()
});

// Zod schema for query history array validation
const QueryHistorySchema = z.array(QueryHistoryEntrySchema);

/**
 * Query history store managing SQL query history
 * Automatically persists to localStorage with debouncing
 * Enhanced with data validation and security
 */
class QueryHistoryStore {
	private _history = $state<QueryHistoryEntry[]>([]);
	private saveToStorage = debounce((data: QueryHistoryEntry[]) => {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
		}
	}, 500);
	private securityService = SecurityService.getInstance();

	constructor() {
		// Load from localStorage on initialization with validation
		if (typeof localStorage !== 'undefined') {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) {
				try {
					const validation = this.securityService.validateLocalStorageData(saved, QueryHistorySchema);
					if (validation.success) {
						// Sanitize SQL content for display
						this._history = validation.data.map(entry => ({
							...entry,
							sql: this.securityService.sanitizeSQLForDisplay(entry.sql)
						}));
					} else {
						console.error('Invalid query history data format:', validation.error);
						this._history = [];
					}
				} catch (error) {
					console.error('Failed to load query history from localStorage:', error);
					this._history = [];
				}
			}
		}

		// Set up auto-save effect using $effect.root for module-level usage
		$effect.root(() => {
			$effect(() => {
				this.saveToStorage(this._history);
			});
		});
	}

	get history(): QueryHistoryEntry[] {
		return this._history;
	}

	/**
	 * Add a query to the history
	 * @param sql The SQL query
	 * @param challengeId Optional challenge ID
	 * @param success Whether the query succeeded
	 */
	addQuery(sql: string, challengeId?: string, success?: boolean): void {
		// Sanitize SQL for display and check for dangerous content
		const sanitizedSql = this.securityService.sanitizeSQLForDisplay(sql.trim());
		
		// Check for dangerous content
		if (this.securityService.containsDangerousContent(sql)) {
			console.warn('Potentially dangerous SQL content detected, sanitizing for display');
		}

		const entry: QueryHistoryEntry = {
			id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
			sql: sanitizedSql,
			timestamp: Date.now(),
			challengeId,
			success
		};

		// Add to beginning and limit size
		this._history = [entry, ...this._history].slice(0, MAX_HISTORY_ITEMS);
	}

	/**
	 * Clear all query history
	 */
	clear(): void {
		this._history = [];
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	/**
	 * Get history for a specific challenge
	 * @param challengeId The challenge ID
	 * @returns Array of queries for that challenge
	 */
	getForChallenge(challengeId: string): QueryHistoryEntry[] {
		return this._history.filter((entry) => entry.challengeId === challengeId);
	}

	/**
	 * Remove a specific history entry
	 * @param id The entry ID to remove
	 */
	removeEntry(id: string): void {
		this._history = this._history.filter((entry) => entry.id !== id);
	}
}

// Export singleton instance
export const queryHistoryStore = new QueryHistoryStore();
