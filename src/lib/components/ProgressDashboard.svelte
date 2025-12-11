<script lang="ts">
	import { progressStore } from '$lib/stores/progressStore.svelte';

	interface Props {
		totalChallenges: number;
	}

	let { totalChallenges }: Props = $props();

	const progress = $derived(progressStore.state);
	const completionRate = $derived(progressStore.getCompletionRate(totalChallenges));
	const completedCount = $derived(Object.keys(progress.completed).length);

	const handleReset = () => {
		if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
			progressStore.reset();
		}
	};
</script>

<div class="card border-white/10 p-5 space-y-3">
	<div class="flex items-center justify-between">
		<div>
			<p class="text-xs uppercase tracking-[0.2em] text-slate-400">Progress</p>
			<h3 class="text-lg font-semibold">Dashboard</h3>
		</div>
		<div class="text-xs text-slate-400">
			<span aria-label="{completedCount} of {totalChallenges} challenges completed">
				{completedCount} / {totalChallenges} done
			</span>
		</div>
	</div>

	<div class="space-y-2 text-sm text-slate-200">
		<div class="flex items-center justify-between">
			<span>Attempts</span>
			<span class="text-slate-300">{progress.attempts}</span>
		</div>
		<div class="flex items-center justify-between">
			<span>Streak</span>
			<span class="text-amber-200">
				{progress.streak}
				<span aria-hidden="true">🔥</span>
				<span class="sr-only">day{progress.streak !== 1 ? 's' : ''}</span>
			</span>
		</div>
		<div class="flex items-center justify-between">
			<span>Points</span>
			<span class="text-emerald-200 font-semibold">{progress.points}</span>
		</div>
		<div class="flex items-center justify-between">
			<span>Completion</span>
			<span class="text-cyan-200">{completionRate}%</span>
		</div>
	</div>

	<!-- Progress bar -->
	<div
		class="w-full h-2 rounded-full bg-white/5 overflow-hidden"
		role="progressbar"
		aria-valuenow={completionRate}
		aria-valuemin={0}
		aria-valuemax={100}
		aria-label="Overall completion progress"
	>
		<div
			class="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-500"
			style={`width: ${completionRate}%;`}
		></div>
	</div>

	<!-- Reset button -->
	<button
		class="btn btn-ghost w-full text-xs text-rose-300 hover:text-rose-200"
		onclick={handleReset}
		aria-label="Reset all progress"
	>
		Reset Progress
	</button>
</div>
