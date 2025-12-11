import type { PlaygroundResult, SampleDatabase } from '$lib/types';
import { runPlayground } from '$lib/logic/runner';
import { queryHistoryStore } from '$lib/stores/queryHistoryStore.svelte';
import { SecurityService } from '$lib/services/securityService';

/**
 * Custom hook for playground-related logic
 * Encapsulates business logic for playground execution
 */
export function usePlaygroundLogic() {
    const securityService = SecurityService.getInstance();

    /**
     * Runs a playground query
     */
    async function runPlaygroundQuery(
        playgroundDb: SampleDatabase,
        playgroundSQL: string,
        setIsPlayRunning: (value: boolean) => void,
        setPlaygroundResult: (value: PlaygroundResult | null) => void
    ): Promise<void> {
        setIsPlayRunning(true);
        setPlaygroundResult(null);
        
        // Sanitize SQL input
        const sanitizedSQL = securityService.sanitizeHTML(playgroundSQL);
        
        // Check for dangerous content
        if (securityService.containsDangerousContent(playgroundSQL)) {
            console.warn('Potentially dangerous SQL content detected in playground');
            setPlaygroundResult({
                sql: playgroundSQL,
                result: null,
                error: 'Query contains potentially dangerous content and was blocked for security reasons.'
            });
            setIsPlayRunning(false);
            return;
        }

        try {
            const result = await runPlayground(playgroundDb, sanitizedSQL);
            setPlaygroundResult(result);

            // Add to history
            queryHistoryStore.addQuery(playgroundSQL, undefined, !result.error);
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            setPlaygroundResult({
                sql: playgroundSQL,
                result: null,
                error: message
            });
        } finally {
            setIsPlayRunning(false);
        }
    }

    /**
     * Handles database switching in playground
     */
    function handleDatabaseSwitch(
        database: SampleDatabase,
        setPlaygroundDb: (value: SampleDatabase) => void,
        setPlaygroundSQL: (value: string) => void
    ): void {
        setPlaygroundDb(database);
        // Set a default query for the selected database
        const defaultQueries: Record<SampleDatabase, string> = {
            employees: 'SELECT * FROM employees LIMIT 5;',
            ecommerce: 'SELECT * FROM customers LIMIT 5;',
            movies: 'SELECT * FROM movies LIMIT 5;'
        };
        setPlaygroundSQL(defaultQueries[database] || 'SELECT * FROM employees LIMIT 5;');
    }

    return {
        runPlaygroundQuery,
        handleDatabaseSwitch
    };
}