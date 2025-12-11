<script lang="ts">
	import { queryHistoryStore } from '$lib/stores/queryHistoryStore.svelte';
	import { formatDate } from '$lib/utils';

	interface Props {
		challengeId?: string;
		onLoadQuery: (sql: string) => void;
	}

	let { challengeId, onLoadQuery }: Props = $props();

	const history = $derived(
		challengeId
			? queryHistoryStore.getForChallenge(challengeId)
			: queryHistoryStore.history.slice(0, 10)
	);

	const handleClear = () => {
		if (confirm('Clear all query history?')) {
			queryHistoryStore.clear();
		}
	};

	const formatTimestamp = (timestamp: number) => {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return 'Just now';
		if (diffMins < 60) return `${diffMins}m ago`;
		if (diffHours < 24) return `${diffHours}h ago`;
		if (diffDays < 7) return `${diffDays}d ago`;
		return formatDate(date.toISOString());
	};
</script>

<div class="card border-white/10 p-5 space-y-3">
	<div class="flex items-center justify-between">
		<div>
			<p class="text-xs uppercase tracking-[0.2em] text-slate-400">History</p>
			<h3 class="text-lg font-semibold">Recent queries</h3>
		</div>
		{#if history.length > 0}
			<button
				class="text-xs text-slate-400 hover:text-slate-200"
				onclick={handleClear}
				aria-label="Clear all query history"
			>
				Clear
			</button>
		{/if}
	</div>

	{#if history.length === 0}
		<p class="text-sm text-slate-400 text-center py-4">No queries yet</p>
	{:else}
		<div class="space-y-2 max-h-96 overflow-y-auto" role="list" aria-label="Query history">
			{#each history as entry (entry.id)}
				<button
					class="w-full text-left p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
					onclick={() => onLoadQuery(entry.sql)}
					aria-label="Load query from {formatTimestamp(entry.timestamp)}"
				>
					<div class="flex items-start justify-between gap-2 mb-1">
						<span class="text-xs text-slate-400">{formatTimestamp(entry.timestamp)}</span>
						{#if entry.success !== undefined}
							<span class={entry.success ? 'text-emerald-300 text-xs' : 'text-rose-300 text-xs'}>
								{entry.success ? '✓' : '✗'}
							</span>
						{/if}
					</div>
					<code
						class="text-xs text-slate-200 block overflow-hidden text-ellipsis whitespace-nowrap"
					>
						{entry.sql}
					</code>
				</button>
			{/each}
		</div>
	{/if}
</div>
