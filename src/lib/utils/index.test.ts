import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { debounce, throttle, isYesterday, getTodayString } from './index';

describe('debounce', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should delay function execution', () => {
		const func = vi.fn();
		const debounced = debounce(func, 100);

		debounced('test');
		expect(func).not.toHaveBeenCalled();

		vi.advanceTimersByTime(100);
		expect(func).toHaveBeenCalledWith('test');
	});

	it('should cancel previous calls', () => {
		const func = vi.fn();
		const debounced = debounce(func, 100);

		debounced('first');
		debounced('second');
		debounced('third');

		vi.advanceTimersByTime(100);
		expect(func).toHaveBeenCalledTimes(1);
		expect(func).toHaveBeenCalledWith('third');
	});
});

describe('throttle', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('should limit function calls', () => {
		const func = vi.fn();
		const throttled = throttle(func, 100);

		throttled('first');
		throttled('second');
		throttled('third');

		expect(func).toHaveBeenCalledTimes(1);
		expect(func).toHaveBeenCalledWith('first');

		vi.advanceTimersByTime(100);
		expect(func).toHaveBeenCalledTimes(2);
		expect(func).toHaveBeenCalledWith('third');
	});
});

describe('isYesterday', () => {
	it('should return true for yesterday', () => {
		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		expect(isYesterday(yesterday.toISOString())).toBe(true);
	});

	it('should return false for today', () => {
		expect(isYesterday(getTodayString())).toBe(false);
	});

	it('should return false for null', () => {
		expect(isYesterday(null)).toBe(false);
	});

	it('should return false for two days ago', () => {
		const twoDaysAgo = new Date();
		twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
		expect(isYesterday(twoDaysAgo.toISOString())).toBe(false);
	});
});

describe('getTodayString', () => {
	it('should return ISO date string', () => {
		const today = getTodayString();
		expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
	});
});
