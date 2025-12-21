<script lang="ts">
	import { untrack } from 'svelte';
	import { autocompletion } from '@codemirror/autocomplete';
	import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
	import { defaultHighlightStyle, syntaxHighlighting } from '@codemirror/language';
	import { sql } from '@codemirror/lang-sql';
	import { EditorState, type Extension, Prec } from '@codemirror/state';
	import {
		EditorView,
		drawSelection,
		highlightActiveLine,
		keymap,
		placeholder as cmPlaceholder
	} from '@codemirror/view';
	import { oneDark } from '@codemirror/theme-one-dark';

	let {
		value = $bindable(''),
		placeholder = 'SELECT * FROM ...',
		readOnly = false,
		height = '360px',
		onRun,
		onValueChange
	} = $props<{
		value: string;
		placeholder?: string;
		readOnly?: boolean;
		height?: string;
		onRun?: () => void;
		onValueChange?: (value: string) => void;
	}>();

	let container = $state<HTMLElement | null>(null);
	let view: EditorView | null = null;
	// Use a plain variable (not reactive) to track sync state
	let isSyncingFromEditor = false;

	const baseExtensions: Extension[] = [
		sql(),
		oneDark,
		history(),
		drawSelection(),
		highlightActiveLine(),
		autocompletion(),
		syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
		EditorView.lineWrapping,
		EditorState.tabSize.of(2)
	];

	const buildExtensions = () => {
		const changeListener = EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				const newValue = update.state.doc.toString();
				// Set flag to prevent sync effect from running
				isSyncingFromEditor = true;
				value = newValue;
				onValueChange?.(newValue);
				// Reset flag after microtask
				queueMicrotask(() => {
					isSyncingFromEditor = false;
				});
			}
		});

		const runBinding = onRun
			? [
					{
						key: 'Mod-Enter',
						run: () => {
							onRun?.();
							return true;
						}
					}
				]
			: [];

		return [
			...baseExtensions,
			changeListener,
			EditorView.editable.of(!readOnly),
			cmPlaceholder(placeholder),
			keymap.of([...runBinding, ...defaultKeymap, indentWithTab, ...historyKeymap]),
			Prec.low(EditorView.theme({ '&': { fontFamily: '"JetBrains Mono Variable", monospace' } }))
		];
	};

	// Effect to create/recreate the editor when container is available
	$effect(() => {
		if (!container) return;

		// Read value once for initialization
		const initialValue = untrack(() => value);

		view?.destroy();
		const state = EditorState.create({
			doc: initialValue,
			extensions: buildExtensions()
		});

		view = new EditorView({
			state,
			parent: container
		});

		return () => {
			view?.destroy();
			view = null;
		};
	});

	// Effect to sync external value changes to the editor
	$effect(() => {
		// Read value to create dependency
		const currentValue = value;

		// Skip if this change came from the editor itself
		if (isSyncingFromEditor) return;
		if (!view) return;

		const currentDoc = view.state.doc.toString();
		if (currentValue !== currentDoc) {
			view.dispatch({
				changes: { from: 0, to: currentDoc.length, insert: currentValue }
			});
		}
	});
</script>

<div
	class="rounded-xl border border-white/10 bg-soft/80 shadow-inner shadow-black/50 overflow-hidden"
>
	<div
		class="code-editor h-full w-full text-sm"
		style={`height: ${height};`}
		bind:this={container}
		aria-label="SQL editor"
	></div>
</div>
