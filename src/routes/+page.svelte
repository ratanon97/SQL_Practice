<script lang="ts">
	// Disable SSR for this page (required for PGlite browser database)
	export const ssr = false;

	import ChallengeSelector from '$lib/components/ChallengeSelector.svelte';
	import ChallengeEditor from '$lib/components/ChallengeEditor.svelte';
	import ProgressDashboard from '$lib/components/ProgressDashboard.svelte';
	import SchemaExplorer from '$lib/components/SchemaExplorer.svelte';
	import Playground from '$lib/components/Playground.svelte';
	import QueryHistory from '$lib/components/QueryHistory.svelte';
	import ConceptFilter from '$lib/components/ConceptFilter.svelte';
	import { challenges, schemaCatalog } from '$lib/data/challenges';
	import { progressStore } from '$lib/stores/progressStore.svelte';
	import { useChallengeLogic, usePlaygroundLogic, useConceptFilter } from '$lib/hooks';
	import type { Difficulty, PlaygroundResult, RunOutcome, SampleDatabase } from '$lib/types';

	// Initialize hooks
	const { handleRunChallenge, fetchHint, filterChallenges, resetChallengeSQL } =
		useChallengeLogic();
	const { runPlaygroundQuery: runPlayground, handleDatabaseSwitch } = usePlaygroundLogic();
	const { handleConceptToggle, handleClearConceptFilter } = useConceptFilter();

	// Challenge state
	let selectedDifficulty = $state<Difficulty>('beginner');
	let selectedChallengeId = $state(
		challenges.find((c) => c.difficulty === selectedDifficulty)?.id ?? challenges[0].id
	);
	let selectedConcepts = $state<string[]>([]);

	// Filter challenges by difficulty and concepts using hook
	const filteredChallenges = $derived(
		filterChallenges(challenges, selectedDifficulty, selectedConcepts)
	);

	// Ensure selected challenge is in filtered list
	$effect(() => {
		if (
			!filteredChallenges.find((c) => c.id === selectedChallengeId) &&
			filteredChallenges.length
		) {
			selectedChallengeId = filteredChallenges[0].id;
		}
	});

	const currentChallenge = $derived(
		challenges.find((challenge) => challenge.id === selectedChallengeId) ?? challenges[0]
	);

	// Challenge editor state
	let challengeSQL = $state('');
	let runResult = $state<RunOutcome | null>(null);
	let isRunning = $state(false);
	let isHintLoading = $state(false);
	let hintText = $state('');

	// Playground state
	let playgroundDb = $state<SampleDatabase>('employees');
	let playgroundSQL = $state('SELECT * FROM employees LIMIT 5;');
	let playgroundResult = $state<PlaygroundResult | null>(null);
	let isPlayRunning = $state(false);

	// UI state
	let showHistory = $state(false);

	// Reset SQL when challenge changes using hook
	$effect(() => {
		resetChallengeSQL(
			currentChallenge,
			(sql) => (challengeSQL = sql),
			(result) => (runResult = result),
			(text) => (hintText = text)
		);
	});

	const schema = $derived(schemaCatalog[currentChallenge?.database ?? 'employees']);

	const completionRate = $derived(progressStore.getCompletionRate(challenges.length));
	const progress = $derived(progressStore.state);

	/**
	 * Runs the current challenge and validates the result using hook
	 */
	const handleRun = async () => {
		await handleRunChallenge(
			currentChallenge,
			challengeSQL,
			(running) => (isRunning = running),
			(result) => (runResult = result),
			(text) => (hintText = text)
		);
	};

	/**
	 * Fetches an AI hint from Claude using hook
	 */
	const handleHint = async () => {
		await fetchHint(
			currentChallenge,
			challengeSQL,
			(loading) => (isHintLoading = loading),
			(text) => (hintText = text)
		);
	};

	/**
	 * Runs a playground query using hook
	 */
	const handlePlaygroundRun = async () => {
		await runPlayground(
			playgroundDb,
			playgroundSQL,
			(running) => (isPlayRunning = running),
			(result) => (playgroundResult = result)
		);
	};

	/**
	 * Handles database switching in playground using hook
	 */
	const handleDbSwitch = (database: SampleDatabase) => {
		handleDatabaseSwitch(
			database,
			(db) => (playgroundDb = db),
			(sql) => (playgroundSQL = sql)
		);
	};

	/**
	 * Handles concept filter toggle using hook
	 */
	const handleConceptToggleWrapper = (concept: string) => {
		handleConceptToggle(concept, selectedConcepts, (concepts) => (selectedConcepts = concepts));
	};

	/**
	 * Clears all concept filters using hook
	 */
	const handleClearConceptFilterWrapper = () => {
		handleClearConceptFilter((concepts) => (selectedConcepts = concepts));
	};

	/**
	 * Loads a query from history
	 */
	const handleLoadFromHistory = (sql: string) => {
		challengeSQL = sql;
		showHistory = false;
	};
</script>

<section class="space-y-10">
	<!-- Header -->
	<header class="card p-6 md:p-8 border-white/10">
		<div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
			<div class="space-y-3">
				<p class="text-sm uppercase tracking-[0.2em] text-cyan-300/80">SQL Dojo</p>
				<h1 class="text-3xl md:text-4xl font-semibold">
					Master SQL with interactive challenges & instant feedback
				</h1>
				<p class="text-slate-300 max-w-3xl">
					Three real-world databases, CodeMirror-powered editor, in-browser PostgreSQL (PGlite), and
					AI nudges from Claude to keep you moving.
				</p>
				<div class="flex flex-wrap gap-3 text-sm text-slate-300">
					<span class="px-3 py-1 rounded-full bg-white/5 border border-white/10"
						>30+ challenges</span
					>
					<span class="px-3 py-1 rounded-full bg-white/5 border border-white/10"
						>3 sample databases</span
					>
					<span class="px-3 py-1 rounded-full bg-white/5 border border-white/10"
						>Progress tracking</span
					>
					<span class="px-3 py-1 rounded-full bg-white/5 border border-white/10"
						>Playground mode</span
					>
				</div>
			</div>
			<div class="grid grid-cols-3 gap-3 w-full md:w-auto md:min-w-[320px]">
				<div class="card p-3 text-center">
					<div
						class="text-2xl font-semibold text-emerald-300"
						aria-label="{completionRate}% completed"
					>
						{completionRate}%
					</div>
					<div class="text-xs text-slate-400">Completion</div>
				</div>
				<div class="card p-3 text-center">
					<div class="text-2xl font-semibold text-cyan-300" aria-label="{progress.points} points">
						{progress.points}
					</div>
					<div class="text-xs text-slate-400">Points</div>
				</div>
				<div class="card p-3 text-center">
					<div class="text-2xl font-semibold text-amber-300">
						{progress.streak}<span aria-hidden="true">🔥</span>
						<span class="sr-only">day streak</span>
					</div>
					<div class="text-xs text-slate-400">Day streak</div>
				</div>
			</div>
		</div>
	</header>

	<!-- Main content grid -->
	<div class="grid lg:grid-cols-[1.4fr,1fr] gap-6">
		<!-- Left column: Challenges -->
		<section class="space-y-4">
			<!-- Concept filter -->
			<div class="card p-4 border-white/10">
				<ConceptFilter
					{challenges}
					{selectedConcepts}
					onConceptToggle={handleConceptToggleWrapper}
					onClearFilter={handleClearConceptFilterWrapper}
				/>
			</div>

			<!-- Challenge selector -->
			<ChallengeSelector
				challenges={filteredChallenges}
				selectedId={selectedChallengeId}
				{selectedDifficulty}
				onSelect={(id) => (selectedChallengeId = id)}
				onDifficultyChange={(difficulty) => (selectedDifficulty = difficulty)}
			/>

			<!-- Challenge editor -->
			<ChallengeEditor
				challenge={currentChallenge}
				sql={challengeSQL}
				{runResult}
				{isRunning}
				{isHintLoading}
				{hintText}
				onRun={handleRun}
				onReset={() => (challengeSQL = currentChallenge.starterSQL)}
				onSqlChange={(value) => (challengeSQL = value)}
				onHintRequest={handleHint}
			/>
		</section>

		<!-- Right column: Sidebar -->
		<aside class="space-y-4">
			<!-- Schema explorer -->
			<SchemaExplorer {schema} databaseName={currentChallenge.database} />

			<!-- Progress dashboard -->
			<ProgressDashboard totalChallenges={challenges.length} />

			<!-- Query history toggle -->
			<button
				class="w-full btn btn-ghost"
				onclick={() => (showHistory = !showHistory)}
				aria-expanded={showHistory}
				aria-controls="query-history"
			>
				{showHistory ? 'Hide' : 'Show'} Query History
			</button>

			<!-- Query history -->
			{#if showHistory}
				<div id="query-history">
					<QueryHistory challengeId={currentChallenge.id} onLoadQuery={handleLoadFromHistory} />
				</div>
			{/if}

			<!-- Playground -->
			<Playground
				database={playgroundDb}
				sql={playgroundSQL}
				result={playgroundResult}
				isRunning={isPlayRunning}
				onDatabaseChange={handleDbSwitch}
				onSqlChange={(value) => (playgroundSQL = value)}
				onRun={handlePlaygroundRun}
			/>
		</aside>
	</div>
</section>
