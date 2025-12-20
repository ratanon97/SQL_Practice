<script lang="ts">
	import type { SchemaCatalogEntry } from '$lib/types';

	interface Props {
		schema: SchemaCatalogEntry[];
		databaseName: string;
	}

	let { schema, databaseName }: Props = $props();
</script>

<div class="card border-white/10 p-5 space-y-3">
	<div class="flex items-center justify-between">
		<div>
			<p class="text-xs uppercase tracking-[0.2em] text-slate-400">Schema</p>
			<h3 class="text-lg font-semibold capitalize">{databaseName} DB</h3>
		</div>
		<span class="px-3 py-1 rounded-full bg-white/5 text-xs text-slate-300">
			PGlite in-browser
		</span>
	</div>

	<div class="space-y-3" role="list" aria-label="Database tables">
		{#each schema as table (table.table)}
			<div class="rounded-lg border border-white/10 bg-white/5 p-3" role="listitem">
				<div class="flex items-center justify-between gap-2">
					<h4 class="font-semibold text-slate-100">{table.table}</h4>
					<span class="text-[11px] px-2 py-1 rounded-full bg-white/5 text-slate-300">
						{table.columns.length} cols
					</span>
				</div>
				{#if table.description}
					<p class="text-xs text-slate-400 mt-1">{table.description}</p>
				{/if}
				<div class="flex flex-wrap gap-2 mt-2" role="list" aria-label="Table columns">
					{#each table.columns as col (col)}
						<span
							class="text-[11px] px-2 py-1 rounded-full bg-slate-900/60 border border-white/5 text-slate-200"
							role="listitem"
						>
							{col}
						</span>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
