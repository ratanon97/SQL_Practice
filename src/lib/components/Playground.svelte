<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import ResultsTable from '$lib/components/ResultsTable.svelte';
	import type { SampleDatabase, PlaygroundResult } from '$lib/types';
	import { exportToCSV } from '$lib/utils';

	interface Props {
		database: SampleDatabase;
		sql: string;
		result: PlaygroundResult | null;
		isRunning: boolean;
		onDatabaseChange: (db: SampleDatabase) => void;
		onRun: () => void;
		onSqlChange?: (value: string) => void;
	}

	let { database, sql, result, isRunning, onDatabaseChange, onRun, onSqlChange }: Props = $props();

	const handleExport = () => {
		if (result?.result) {
			exportToCSV(result.result, `playground-${database}-result.csv`);
		}
	};
</script>

<div class="card border-white/10 p-5 space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between">
		<div>
			<p class="text-xs uppercase tracking-[0.2em] text-slate-400">Playground</p>
			<h3 class="text-lg font-semibold">Free SQL practice</h3>
		</div>
		<select
			class="bg-soft border border-white/10 rounded-lg px-3 py-2 text-sm"
			bind:value={database}
			onchange={() => onDatabaseChange(database)}
			aria-label="Select playground database"
		>
			<option value="employees">Employees</option>
			<option value="ecommerce">E-commerce</option>
			<option value="movies">Movies</option>
		</select>
	</div>

	<!-- Editor -->
	<Editor value={sql} height="220px" {onRun} onValueChange={onSqlChange} />

	<!-- Actions -->
	<div class="flex justify-between items-center flex-wrap gap-3">
		<div class="flex gap-2">
			<button
				class="btn btn-primary"
				onclick={onRun}
				disabled={isRunning}
				aria-label={isRunning ? 'Running query' : 'Run SQL query in playground'}
			>
				{isRunning ? 'Running…' : 'Run in playground'}
			</button>
			{#if result?.result && result.result.rows.length > 0}
				<button
					class="btn btn-ghost"
					onclick={handleExport}
					aria-label="Export playground results to CSV"
				>
					Export CSV
				</button>
			{/if}
		</div>
		<span class="text-xs text-slate-400">Database resets on every run</span>
	</div>

	<!-- Results -->
	<ResultsTable title="Playground result" result={result?.result ?? null} />

	<!-- Error display -->
	{#if result?.error}
		<p class="text-rose-300 text-sm" role="alert">Error: {result.error}</p>
	{/if}
</div>
