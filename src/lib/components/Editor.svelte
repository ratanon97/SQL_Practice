<script lang="ts">
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
	let view = $state<EditorView | null>(null);

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
				value = newValue;
				onValueChange?.(newValue);
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

	$effect(() => {
		if (!container) return;

		view?.destroy();
		const state = EditorState.create({
			doc: value,
			extensions: buildExtensions()
		});

		view = new EditorView({
			state,
			parent: container
		});

		return () => view?.destroy();
	});

	$effect(() => {
		if (!view) return;
		const currentDoc = view.state.doc.toString();
		if (value !== currentDoc) {
			view.dispatch({
				changes: { from: 0, to: currentDoc.length, insert: value }
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
