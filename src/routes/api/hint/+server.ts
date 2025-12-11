import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import type { RequestHandler } from '@sveltejs/kit';
import { z } from 'zod';
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { ApiService } from '$lib/services/apiService';

const HintRequestSchema = z.object({
	prompt: z.string().min(1).max(1000),
	sql: z.string().min(1).max(10000),
	solution: z.string().min(1).max(10000)
});

/**
 * API endpoint for generating AI-powered SQL hints using Claude
 * Enhanced with rate limiting, input sanitization, and security headers
 * @returns Streaming text response with helpful hints
 */
export const POST: RequestHandler = async ({ request }) => {
	// Initialize API service
	const apiService = ApiService.getInstance();
	
	// Validate API key is configured
	if (!env.ANTHROPIC_API_KEY) {
		throw error(500, 'API key not configured. Please set ANTHROPIC_API_KEY environment variable.');
	}

	// Validate and sanitize request using API service
	const validationResult = await apiService.validateRequest(request, HintRequestSchema, 'hint');
	
	if (!validationResult.success) {
		throw error(400, validationResult.error);
	}

	const { prompt, sql, solution } = validationResult.data;

	// Sanitize inputs to prevent XSS
	const sanitizedPrompt = apiService.sanitizeInput(prompt);
	const sanitizedSql = apiService.sanitizeInput(sql);
	const sanitizedSolution = apiService.sanitizeInput(solution);

	const system =
		'You are a concise SQL mentor. Give short hints, avoid revealing full answers. Prefer pointing to relevant tables, columns, and functions. Keep it under 120 words.';

	try {
		const response = await streamText({
			model: anthropic('claude-3-5-sonnet-latest'),
			system,
			prompt: `Challenge: ${sanitizedPrompt}\n\nStudent SQL:\n${sanitizedSql}\n\nReference approach:\n${sanitizedSolution}\n\nGive a nudge without the full query.`,
			temperature: 0.3,
			maxOutputTokens: 300
		});

		// Apply security headers to response
		const headers = apiService.getSecurityHeaders();
		const streamResponse = response.toTextStreamResponse();
		
		// Add security headers to the response
		Object.entries(headers).forEach(([key, value]) => {
			streamResponse.headers.set(key, value);
		});

		return streamResponse;
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Unknown error';
		throw error(500, `Failed to generate hint: ${message}`);
	}
};
