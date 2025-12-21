<script lang="ts">
	import '@unocss/reset/tailwind.css';
	import 'virtual:uno.css';
	import '@fontsource-variable/space-grotesk';
	import '@fontsource-variable/jetbrains-mono';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content="#0b1220" />
	<title>SQL Dojo · Interactive SQL Practice</title>
</svelte:head>

<div class="min-h-screen bg-bg text-slate-100 font-display">
	<div class="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
		<div class="absolute -left-40 top-10 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl"></div>
		<div class="absolute right-0 top-32 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl"></div>
		<div
			class="absolute bottom-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-400/10 blur-3xl"
		></div>
	</div>
	<main class="relative max-w-7xl mx-auto px-6 py-10 md:py-14">{@render children()}</main>
</div>
