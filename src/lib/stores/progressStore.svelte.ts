import type { Challenge, ProgressState } from '$lib/types';
import { debounce, isYesterday, getTodayString } from '$lib/utils';
import { SecurityService } from '$lib/services/securityService';
import { z } from 'zod';

const DEFAULT_PROGRESS: ProgressState = {
	completed: {},
	points: 0,
	streak: 0,
	lastCompletedDate: null,
	attempts: 0
};

const STORAGE_KEY = 'sql-progress';

// Zod schema for progress state validation
const ProgressStateSchema = z.object({
	completed: z.record(z.string(), z.boolean()),
	points: z.number().int().nonnegative(),
	streak: z.number().int().nonnegative(),
	lastCompletedDate: z.string().nullable(),
	attempts: z.number().int().nonnegative()
});

/**
 * Progress store managing user's learning progress
 * Automatically persists to localStorage with debouncing
 * Enhanced with data validation and security
 */
class ProgressStore {
	private _state = $state<ProgressState>(DEFAULT_PROGRESS);
	private saveToStorage = debounce((data: ProgressState) => {
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
					const validation = this.securityService.validateLocalStorageData(
						saved,
						ProgressStateSchema
					);
					if (validation.success) {
						this._state = { ...DEFAULT_PROGRESS, ...validation.data };
					} else {
						console.error('Invalid progress data format:', validation.error);
						// Reset to default if validation fails
						this.reset();
					}
				} catch (error) {
					console.error('Failed to load progress from localStorage:', error);
					this.reset();
				}
			}
		}

		// Set up auto-save effect using $effect.root for module-level usage
		$effect.root(() => {
			$effect(() => {
				this.saveToStorage(this._state);
			});
		});
	}

	get state(): ProgressState {
		return this._state;
	}

	/**
	 * Mark a challenge as completed and update points/streak
	 * @param challenge The challenge that was completed
	 */
	markCompletion(challenge: Challenge): void {
		const already = this._state.completed[challenge.id];
		const todayStr = getTodayString();

		const streak =
			this._state.lastCompletedDate === todayStr
				? this._state.streak
				: isYesterday(this._state.lastCompletedDate)
					? this._state.streak + 1
					: 1;

		this._state = {
			...this._state,
			completed: { ...this._state.completed, [challenge.id]: true },
			points: this._state.points + (already ? 5 : challenge.points),
			streak,
			lastCompletedDate: todayStr
		};
	}

	/**
	 * Increment the attempt counter
	 */
	incrementAttempts(): void {
		this._state = {
			...this._state,
			attempts: this._state.attempts + 1
		};
	}

	/**
	 * Reset all progress data
	 */
	reset(): void {
		this._state = { ...DEFAULT_PROGRESS };
		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem(STORAGE_KEY);
		}
	}

	/**
	 * Check if a challenge is completed
	 * @param challengeId The challenge ID to check
	 * @returns True if the challenge is completed
	 */
	isCompleted(challengeId: string): boolean {
		return !!this._state.completed[challengeId];
	}

	/**
	 * Get completion rate as a percentage
	 * @param totalChallenges Total number of challenges
	 * @returns Completion percentage (0-100)
	 */
	getCompletionRate(totalChallenges: number): number {
		if (totalChallenges === 0) return 0;
		return Math.round((Object.keys(this._state.completed).length / totalChallenges) * 100);
	}
}

// Export singleton instance
export const progressStore = new ProgressStore();
