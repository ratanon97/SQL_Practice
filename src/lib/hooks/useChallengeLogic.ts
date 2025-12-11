import type { Challenge, Difficulty, RunOutcome } from '$lib/types';
import { runChallengeQuery } from '$lib/logic/runner';
import { progressStore } from '$lib/stores/progressStore.svelte';
import { queryHistoryStore } from '$lib/stores/queryHistoryStore.svelte';
import { SecurityService } from '$lib/services/securityService';

/**
 * Custom hook for challenge-related logic
 * Encapsulates business logic for challenge execution and validation
 */
export function useChallengeLogic() {
    const securityService = SecurityService.getInstance();

    /**
     * Runs the current challenge and validates the result
     */
    async function handleRunChallenge(
        currentChallenge: Challenge,
        challengeSQL: string,
        setIsRunning: (value: boolean) => void,
        setRunResult: (value: RunOutcome | null) => void,
        setHintText: (value: string) => void
    ): Promise<void> {
        setIsRunning(true);
        setRunResult(null);
        setHintText('');

        // Check for dangerous content
        if (securityService.containsDangerousContent(challengeSQL)) {
            console.warn('Potentially dangerous SQL content detected');
            setRunResult({
                ok: false,
                error: 'Query contains potentially dangerous content and was blocked for security reasons.'
            });
            setIsRunning(false);
            return;
        }

        progressStore.incrementAttempts();

        try {
            const result = await runChallengeQuery(currentChallenge, challengeSQL);
            setRunResult(result);

            // Add to history
            queryHistoryStore.addQuery(
                challengeSQL,
                currentChallenge.id,
                result.ok ? result.matches : false
            );

            if (result.ok && result.matches) {
                progressStore.markCompletion(currentChallenge);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            setRunResult({ ok: false, error: message });
        } finally {
            setIsRunning(false);
        }
    }

    /**
     * Fetches an AI hint from Claude
     */
    async function fetchHint(
        currentChallenge: Challenge,
        challengeSQL: string,
        setIsHintLoading: (value: boolean) => void,
        setHintText: (value: string) => void
    ): Promise<void> {
        setIsHintLoading(true);
        setHintText('');
        
        try {
            const response = await fetch('/api/hint', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: currentChallenge.prompt,
                    sql: challengeSQL,
                    solution: currentChallenge.solutionSQL
                })
            });

            if (!response.ok || !response.body) {
                throw new Error('Unable to fetch hint. Check your API key configuration.');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let hintText = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                hintText += decoder.decode(value);
            }
            
            // Sanitize hint text
            setHintText(securityService.sanitizeHTML(hintText));
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to fetch hint';
            setHintText(message);
        } finally {
            setIsHintLoading(false);
        }
    }

    /**
     * Filters challenges by difficulty and concepts
     */
    function filterChallenges(
        challenges: Challenge[],
        selectedDifficulty: Difficulty,
        selectedConcepts: string[]
    ): Challenge[] {
        return challenges.filter((challenge) => {
            const matchesDifficulty = challenge.difficulty === selectedDifficulty;
            const matchesConcepts =
                selectedConcepts.length === 0 ||
                selectedConcepts.some((concept) => challenge.concepts.includes(concept));
            return matchesDifficulty && matchesConcepts;
        });
    }

    /**
     * Resets SQL when challenge changes
     */
    function resetChallengeSQL(
        currentChallenge: Challenge | undefined,
        setChallengeSQL: (value: string) => void,
        setRunResult: (value: RunOutcome | null) => void,
        setHintText: (value: string) => void
    ): void {
        if (currentChallenge) {
            setChallengeSQL(currentChallenge.starterSQL ?? '');
            setRunResult(null);
            setHintText('');
        }
    }

    return {
        handleRunChallenge,
        fetchHint,
        filterChallenges,
        resetChallengeSQL
    };
}