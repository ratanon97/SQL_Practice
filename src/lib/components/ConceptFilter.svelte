<script lang="ts">
	import type { Challenge } from '$lib/types';

	interface Props {
		challenges: Challenge[];
		selectedConcepts: string[];
		onConceptToggle: (concept: string) => void;
		onClearFilter: () => void;
	}

	let { challenges, selectedConcepts, onConceptToggle, onClearFilter }: Props = $props();

	// Extract all unique concepts from challenges
	const allConcepts = $derived(Array.from(new Set(challenges.flatMap((c) => c.concepts))).sort());

	let searchTerm = $state('');

	const filteredConcepts = $derived(
		allConcepts.filter((concept) => concept.toLowerCase().includes(searchTerm.toLowerCase()))
	);
</script>

<div class="space-y-3">
	<!-- Search input -->
	<div class="relative">
		<input
			type="search"
			placeholder="Filter by concept (e.g., JOIN, GROUP BY)..."
			bind:value={searchTerm}
			class="w-full px-3 py-2 text-sm bg-soft border border-white/10 rounded-lg focus:outline-none focus:border-cyan-400/40"
			aria-label="Search SQL concepts"
		/>
	</div>

	<!-- Selected concepts -->
	{#if selectedConcepts.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each selectedConcepts as concept (concept)}
				<button
					class="px-2 py-1 text-xs rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/40 hover:bg-cyan-400/30"
					onclick={() => onConceptToggle(concept)}
					aria-label="Remove {concept} filter"
				>
					{concept} ✕
				</button>
			{/each}
			<button
				class="px-2 py-1 text-xs rounded-full bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
				onclick={onClearFilter}
				aria-label="Clear all concept filters"
			>
				Clear all
			</button>
		</div>
	{/if}

	<!-- Available concepts -->
	{#if filteredConcepts.length > 0}
		<div class="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 -m-2">
			{#each filteredConcepts as concept (concept)}
				{#if !selectedConcepts.includes(concept)}
					<button
						class="px-2 py-1 text-xs rounded-full bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:border-cyan-400/40"
						onclick={() => onConceptToggle(concept)}
						aria-label="Filter by {concept}"
					>
						{concept}
					</button>
				{/if}
			{/each}
		</div>
	{:else if searchTerm}
		<p class="text-xs text-slate-400 text-center py-2">No concepts match "{searchTerm}"</p>
	{/if}
</div>
