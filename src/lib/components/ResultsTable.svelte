<script lang="ts">
	import type { TableResult } from '$lib/types';

	let {
		result,
		title = 'Result set',
		accent = false
	} = $props<{
		result: TableResult | null;
		title?: string;
		accent?: boolean;
	}>();

	const fields = $derived(
		result?.fields?.length ? result.fields : Object.keys(result?.rows?.[0] ?? {})
	);
</script>

<div
	class={`card p-4 space-y-3 ${accent ? 'border-emerald-400/50 shadow-emerald-500/20' : 'border-white/10'}`}
>
	<div class="flex items-center justify-between gap-2">
		<div class="text-sm uppercase tracking-[0.08em] text-slate-400">{title}</div>
		{#if result}
			<span class="text-xs text-slate-400">{result.rows.length} rows</span>
		{/if}
	</div>

	{#if !result}
		<p class="text-slate-400 text-sm">Run a query to see output.</p>
	{:else if !result.rows.length}
		<p class="text-slate-400 text-sm">No rows returned.</p>
	{:else}
		<div class="overflow-auto max-h-80 rounded-lg border border-white/5">
			<table class="w-full text-sm text-left border-collapse">
				<thead class="bg-white/5">
					<tr>
						{#each fields as field (field)}
							<th class="px-3 py-2 font-semibold text-slate-200">{field}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each result.rows as row, rowIndex (rowIndex)}
						<tr class={rowIndex % 2 === 0 ? 'bg-white/0' : 'bg-white/5'}>
							{#each fields as field (field)}
								<td class="px-3 py-2 text-slate-100 align-top">
									{#if row[field] === null}
										<span class="text-slate-500">NULL</span>
									{:else}
										{String(row[field])}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
