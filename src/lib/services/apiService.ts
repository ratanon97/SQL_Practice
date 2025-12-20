import { z } from 'zod';

/**
 * API Service for handling all external API interactions
 * Provides security, validation, and error handling
 */
export class ApiService {
	private static instance: ApiService;
	private rateLimits: Map<string, { count: number; lastReset: number }> = new Map();
	private readonly MAX_REQUESTS = 10; // Max requests per minute
	private readonly RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

	private constructor() {
		// Private constructor for singleton pattern
	}

	/**
	 * Get singleton instance
	 */
	public static getInstance(): ApiService {
		if (!ApiService.instance) {
			ApiService.instance = new ApiService();
		}
		return ApiService.instance;
	}

	/**
	 * Check rate limit for a given endpoint and IP
	 */
	private checkRateLimit(endpoint: string, ip: string): boolean {
		const key = `${endpoint}:${ip}`;
		const now = Date.now();

		if (!this.rateLimits.has(key)) {
			this.rateLimits.set(key, { count: 0, lastReset: now });
			return true;
		}

		const limitData = this.rateLimits.get(key)!;

		// Reset count if window has passed
		if (now - limitData.lastReset > this.RATE_LIMIT_WINDOW) {
			limitData.count = 0;
			limitData.lastReset = now;
			return true;
		}

		// Check if limit exceeded
		if (limitData.count >= this.MAX_REQUESTS) {
			return false;
		}

		limitData.count++;
		return true;
	}

	/**
	 * Sanitize input to prevent XSS
	 */
	public sanitizeInput(input: string): string {
		if (!input) return input;

		return input
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;');
	}

	/**
	 * Validate and sanitize API request
	 */
	public async validateRequest<T extends z.ZodTypeAny>(
		request: Request,
		schema: T,
		endpoint: string
	): Promise<{ success: true; data: z.infer<T> } | { success: false; error: string }> {
		try {
			// Get client IP (in production, this would come from headers)
			const ip = request.headers.get('x-forwarded-for') || 'unknown';

			// Check rate limit
			if (!this.checkRateLimit(endpoint, ip)) {
				return {
					success: false,
					error: 'Rate limit exceeded. Please try again in a minute.'
				};
			}

			// Parse and validate request body
			const body = await request.json();
			const validation = schema.safeParse(body);

			if (!validation.success) {
				return {
					success: false,
					error: `Invalid request: ${validation.error.issues.map((e) => e.message).join(', ')}`
				};
			}

			return { success: true, data: validation.data };
		} catch (err) {
			return {
				success: false,
				error: err instanceof Error ? err.message : 'Invalid request format'
			};
		}
	}

	/**
	 * Get security headers for API responses
	 */
	public getSecurityHeaders(): Record<string, string> {
		return {
			'X-Content-Type-Options': 'nosniff',
			'X-Frame-Options': 'DENY',
			'X-XSS-Protection': '1; mode=block',
			'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
			'Content-Security-Policy':
				"default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; connect-src 'self' https://api.anthropic.com;"
		};
	}

	/**
	 * Clean up rate limit data (call periodically)
	 */
	public cleanupRateLimits() {
		const now = Date.now();
		for (const [key, value] of this.rateLimits.entries()) {
			if (now - value.lastReset > this.RATE_LIMIT_WINDOW) {
				this.rateLimits.delete(key);
			}
		}
	}
}
