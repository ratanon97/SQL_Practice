<script lang="ts">
	import Editor from '$lib/components/Editor.svelte';
	import ResultsTable from '$lib/components/ResultsTable.svelte';
	import type { Challenge, RunOutcome } from '$lib/types';
	import { exportToCSV } from '$lib/utils';

	interface Props {
		challenge: Challenge;
		sql: string;
		runResult: RunOutcome | null;
		isRunning: boolean;
		isHintLoading: boolean;
		hintText: string;
		onRun: () => void;
		onReset: () => void;
		onHintRequest: () => void;
		onSqlChange?: (value: string) => void;
	}

	let {
		challenge,
		sql,
		runResult,
		isRunning,
		isHintLoading,
		hintText,
		onRun,
		onReset,
		onHintRequest,
		onSqlChange
	}: Props = $props();

	const handleExportActual = () => {
		if (runResult?.ok) {
			exportToCSV(runResult.actual, `${challenge.id}-result.csv`);
		}
	};
</script>

<div class="card p-5 border-white/10 space-y-4">
	<!-- Header -->
	<div class="flex items-center justify-between gap-3">
		<div>
			<p class="text-xs uppercase tracking-[0.15em] text-slate-400">Challenge</p>
			<h2 class="text-xl font-semibold">{challenge.title}</h2>
			<p class="text-slate-300 text-sm">{challenge.prompt}</p>
		</div>
		<div class="flex gap-2">
			<button
				class="btn btn-ghost"
				onclick={onReset}
				aria-label="Reset SQL query to starter template"
			>
				Reset
			</button>
			<button
				class="btn btn-primary"
				onclick={onRun}
				disabled={isRunning}
				aria-label={isRunning ? 'Running query' : 'Run and validate SQL query'}
			>
				{isRunning ? 'Running…' : 'Run & Validate'}
			</button>
		</div>
	</div>

	<!-- Editor -->
	<Editor value={sql} height="320px" {onRun} onValueChange={onSqlChange} />

	<!-- Actions and status -->
	<div class="flex flex-wrap gap-3 items-center">
		<button
			class="btn btn-ghost"
			onclick={onHintRequest}
			disabled={isHintLoading}
			aria-label={isHintLoading ? 'Loading hint from Claude' : 'Ask Claude for a hint'}
		>
			{isHintLoading ? 'Loading hint…' : 'Ask Claude for a hint'}
		</button>
		{#if runResult?.ok}
			<span
				class={`px-3 py-1 rounded-full text-sm ${
					runResult.matches
						? 'bg-emerald-400/10 text-emerald-200 border border-emerald-400/40'
						: 'bg-amber-400/10 text-amber-200 border border-amber-400/40'
				}`}
				role="status"
				aria-live="polite"
			>
				{runResult.matches ? 'Validation passed ✓' : 'Result differs from expected'}
			</span>
			<span class="text-xs text-slate-400" aria-label="Query execution time"
				>{runResult.durationMs} ms</span
			>
			{#if runResult.actual.rows.length > 0}
				<button
					class="btn btn-ghost text-xs"
					onclick={handleExportActual}
					aria-label="Export your results to CSV"
				>
					Export CSV
				</button>
			{/if}
		{/if}
		{#if runResult && !runResult.ok}
			<span class="text-rose-300 text-sm" role="alert">Error: {runResult.error}</span>
		{/if}
	</div>

	<!-- Hint display -->
	{#if hintText}
		<div
			class="rounded-lg border border-cyan-400/40 bg-cyan-400/5 p-3 text-sm text-slate-100"
			role="region"
			aria-label="AI hint"
		>
			<h4 class="font-semibold text-cyan-200 mb-1">Claude hint</h4>
			<p>{hintText}</p>
		</div>
	{/if}
</div>

<!-- Results comparison -->
<div class="grid md:grid-cols-2 gap-4">
	<ResultsTable
		title="Your query result"
		result={runResult && runResult.ok ? runResult.actual : null}
		accent={runResult?.ok ? runResult.matches : false}
	/>
	<ResultsTable
		title="Expected result"
		result={runResult && runResult.ok ? runResult.expected : null}
		accent={false}
	/>
</div>
