import { z } from 'zod';

/**
 * Security Service for handling security-related utilities
 * Provides input sanitization, validation, and security checks
 */
export class SecurityService {
    private static instance: SecurityService;

    private constructor() {
        // Private constructor for singleton pattern
    }

    /**
     * Get singleton instance
     */
    public static getInstance(): SecurityService {
        if (!SecurityService.instance) {
            SecurityService.instance = new SecurityService();
        }
        return SecurityService.instance;
    }

    /**
     * Sanitize HTML content to prevent XSS attacks
     */
    public sanitizeHTML(html: string): string {
        if (!html) return html;
        
        return html
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Sanitize SQL query for display (does not make it safe for execution)
     */
    public sanitizeSQLForDisplay(sql: string): string {
        if (!sql) return sql;
        
        // Basic SQL sanitization for display purposes
        return sql
            .replace(/--/g, '&#45;&#45;') // Comment sanitization
            .replace(/\/\*/g, '&#47;&#42;') // Block comment start
            .replace(/\*\//g, '&#42;&#47;') // Block comment end
            .replace(/;/g, '&#59;'); // Semicolon sanitization
    }

    /**
     * Validate and sanitize localStorage data
     */
    public validateLocalStorageData<T extends z.ZodTypeAny>(
        data: unknown,
        schema: T
    ): { success: true; data: z.infer<T> } | { success: false; error: string } {
        try {
            if (!data) {
                return { success: false, error: 'No data provided' };
            }

            // Parse JSON if it's a string
            const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
            
            // Validate with Zod schema
            const validation = schema.safeParse(parsedData);
            
            if (!validation.success) {
                return { 
                    success: false,
                    error: `Data validation failed: ${validation.error.issues.map(e => e.message).join(', ')}`
                };
            }

            return { success: true, data: validation.data };
            
        } catch (err) {
            return { 
                success: false,
                error: err instanceof Error ? err.message : 'Invalid data format'
            };
        }
    }

    /**
     * Generate a secure random token
     */
    public generateSecureToken(length: number = 32): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        
        return result;
    }

    /**
     * Check if a string contains potentially dangerous content
     */
    public containsDangerousContent(input: string): boolean {
        if (!input) return false;
        
        const dangerousPatterns = [
            /<script.*?>.*?<\/script>/i, // Script tags
            /javascript:/i, // JavaScript protocol
            /onerror\s*=/i, // Event handlers
            /onload\s*=/i,
            /onclick\s*=/i,
            /eval\s*\(/i, // eval function
            /document\.cookie/i, // Cookie access
            /window\.location/i // Location manipulation
        ];
        
        return dangerousPatterns.some(pattern => pattern.test(input));
    }

    /**
     * Get Content Security Policy header
     */
    public getContentSecurityPolicy(): string {
        return (
            "default-src 'self'; " +
            "script-src 'self' 'wasm-unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "connect-src 'self' https://api.anthropic.com; " +
            "img-src 'self' data:; " +
            "font-src 'self'; " +
            "object-src 'none'; " +
            "base-uri 'self'; " +
            "form-action 'self'"
        );
    }

    /**
     * Get all security headers for HTTP responses
     */
    public getAllSecurityHeaders(): Record<string, string> {
        return {
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Content-Security-Policy': this.getContentSecurityPolicy(),
            'Referrer-Policy': 'strict-origin-when-cross-origin',
            'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        };
    }
}