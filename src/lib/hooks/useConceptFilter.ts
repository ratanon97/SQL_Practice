import type { Challenge } from '$lib/types';

/**
 * Custom hook for concept filtering logic
 * Encapsulates logic for managing and applying concept filters
 */
export function useConceptFilter() {

    /**
     * Gets all unique concepts from challenges
     */
    function getAllConcepts(challenges: Challenge[]): string[] {
        const conceptsSet = new Set<string>();
        challenges.forEach(challenge => {
            challenge.concepts.forEach(concept => conceptsSet.add(concept));
        });
        return Array.from(conceptsSet).sort();
    }

    /**
     * Gets concept counts for each concept
     */
    function getConceptCounts(challenges: Challenge[]): Record<string, number> {
        const counts: Record<string, number> = {};
        challenges.forEach(challenge => {
            challenge.concepts.forEach(concept => {
                counts[concept] = (counts[concept] || 0) + 1;
            });
        });
        return counts;
    }

    /**
     * Handles concept toggle
     */
    function handleConceptToggle(
        concept: string,
        selectedConcepts: string[],
        setSelectedConcepts: (value: string[]) => void
    ): void {
        if (selectedConcepts.includes(concept)) {
            setSelectedConcepts(selectedConcepts.filter((c) => c !== concept));
        } else {
            setSelectedConcepts([...selectedConcepts, concept]);
        }
    }

    /**
     * Clears all concept filters
     */
    function handleClearConceptFilter(
        setSelectedConcepts: (value: string[]) => void
    ): void {
        setSelectedConcepts([]);
    }

    /**
     * Checks if a concept is currently selected
     */
    function isConceptSelected(
        concept: string,
        selectedConcepts: string[]
    ): boolean {
        return selectedConcepts.includes(concept);
    }

    return {
        getAllConcepts,
        getConceptCounts,
        handleConceptToggle,
        handleClearConceptFilter,
        isConceptSelected
    };
}