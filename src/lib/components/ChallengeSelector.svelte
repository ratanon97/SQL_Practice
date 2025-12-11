<script lang="ts">
	import type { Challenge, Difficulty } from '$lib/types';
	import { progressStore } from '$lib/stores/progressStore.svelte';

	interface Props {
		challenges: Challenge[];
		selectedId: string;
		selectedDifficulty: Difficulty;
		onSelect: (id: string) => void;
		onDifficultyChange: (difficulty: Difficulty) => void;
	}

	let { challenges, selectedId, selectedDifficulty, onSelect, onDifficultyChange }: Props =
		$props();

	const difficulties: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

	const filteredChallenges = $derived(
		challenges.filter((challenge) => challenge.difficulty === selectedDifficulty)
	);
</script>

<div class="space-y-4">
	<!-- Difficulty selector -->
	<div class="flex flex-wrap items-center gap-3 justify-between">
		<div class="flex gap-2" role="tablist" aria-label="Difficulty levels">
			{#each difficulties as difficulty (difficulty)}
				<button
					role="tab"
					aria-selected={difficulty === selectedDifficulty}
					aria-controls="challenge-list"
					class={`btn ${difficulty === selectedDifficulty ? 'btn-primary shadow-lg shadow-cyan-500/30' : 'btn-ghost'}`}
					onclick={() => onDifficultyChange(difficulty)}
				>
					{difficulty}
				</button>
			{/each}
		</div>
		<div class="text-sm text-slate-400">
			<span class="text-cyan-300 font-semibold">{filteredChallenges[0]?.database || 'N/A'}</span>
			dataset •
			{filteredChallenges.length} challenges
		</div>
	</div>

	<!-- Challenge grid -->
	<div id="challenge-list" role="tabpanel" class="grid md:grid-cols-2 gap-3">
		{#each filteredChallenges as challenge (challenge.id)}
			<button
				class={`card p-4 text-left transition-all duration-200 hover:border-emerald-400/60 hover:-translate-y-0.5 ${selectedId === challenge.id ? 'border-emerald-400/60 shadow-emerald-500/20 bg-emerald-400/5' : 'border-white/10'}`}
				onclick={() => onSelect(challenge.id)}
				aria-pressed={selectedId === challenge.id}
				aria-label={`${challenge.title} - ${challenge.difficulty} difficulty, ${challenge.points} points${progressStore.isCompleted(challenge.id) ? ', completed' : ''}`}
			>
				<div class="flex items-start justify-between gap-2">
					<div>
						<p class="text-xs uppercase tracking-[0.15em] text-slate-400">
							{challenge.database} • {challenge.difficulty}
						</p>
						<h3 class="font-semibold text-lg leading-tight mt-1">{challenge.title}</h3>
					</div>
					<div class="flex flex-col items-end gap-1 text-xs text-slate-300">
						<span class="px-2 py-1 rounded-full bg-white/5 border border-white/10">
							{challenge.points} pts
						</span>
						{#if progressStore.isCompleted(challenge.id)}
							<span class="text-emerald-300" aria-label="Completed">✓ done</span>
						{/if}
					</div>
				</div>
				<p class="text-slate-300 text-sm mt-2">{challenge.prompt}</p>
				<div class="flex flex-wrap gap-2 mt-3">
					{#each challenge.concepts as concept (concept)}
						<span
							class="text-[11px] px-2 py-1 rounded-full bg-white/5 text-slate-300 border border-white/5"
						>
							{concept}
						</span>
					{/each}
				</div>
			</button>
		{/each}
	</div>
</div>
