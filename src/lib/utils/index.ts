import type { TableResult } from '$lib/types';

/**
 * Creates a debounced function that delays invoking func until after wait milliseconds
 * have elapsed since the last time the debounced function was invoked.
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay
 * @returns The debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return function executedFunction(...args: Parameters<T>) {
		const later = () => {
			timeout = null;
			func(...args);
		};

		if (timeout !== null) {
			clearTimeout(timeout);
		}
		timeout = setTimeout(later, wait);
	};
}

/**
 * Converts a TableResult to CSV format
 * @param result The table result to convert
 * @param filename The filename for the downloaded CSV
 */
export function exportToCSV(
	result: TableResult | null,
	filename: string = 'query-result.csv'
): void {
	if (!result || !result.rows.length) {
		alert('No data to export');
		return;
	}

	const headers = result.fields;
	const rows = result.rows;

	// Escape CSV values
	const escapeCSV = (value: unknown): string => {
		if (value === null || value === undefined) return '';
		const str = String(value);
		if (str.includes(',') || str.includes('"') || str.includes('\n')) {
			return `"${str.replace(/"/g, '""')}"`;
		}
		return str;
	};

	// Build CSV content
	const csvContent = [
		headers.join(','),
		...rows.map((row) => headers.map((header) => escapeCSV(row[header])).join(','))
	].join('\n');

	// Create download
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);

	link.setAttribute('href', url);
	link.setAttribute('download', filename);
	link.style.visibility = 'hidden';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

/**
 * Formats a date string to a readable format
 * @param dateString ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string | null): string {
	if (!dateString) return 'Never';
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

/**
 * Checks if a date is yesterday
 * @param dateString ISO date string
 * @returns True if the date is yesterday
 */
export function isYesterday(dateString: string | null): boolean {
	if (!dateString) return false;
	const d = new Date(dateString);
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	return d.toISOString().slice(0, 10) === yesterday.toISOString().slice(0, 10);
}

/**
 * Gets today's date as ISO string (YYYY-MM-DD)
 * @returns Today's date string
 */
export function getTodayString(): string {
	return new Date().toISOString().slice(0, 10);
}

/**
 * Throttle function - ensures a function is called at most once per wait period
 * @param func The function to throttle
 * @param wait The wait period in milliseconds
 * @returns The throttled function
 */
export function throttle<T extends (...args: any[]) => any>(
	func: T,
	wait: number
): (...args: Parameters<T>) => void {
	let isThrottled = false;
	let savedArgs: Parameters<T> | null = null;

	return function wrapper(...args: Parameters<T>) {
		if (isThrottled) {
			savedArgs = args;
			return;
		}

		func(...args);
		isThrottled = true;

		setTimeout(() => {
			isThrottled = false;
			if (savedArgs) {
				wrapper(...savedArgs);
				savedArgs = null;
			}
		}, wait);
	};
}
