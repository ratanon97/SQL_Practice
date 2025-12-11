import {
	defineConfig,
	presetIcons,
	presetTypography,
	presetUno,
	transformerDirectives
} from 'unocss';

export default defineConfig({
	shortcuts: {
		card: 'rounded-xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg shadow-black/30',
		btn: 'inline-flex items-center gap-2 rounded-lg px-4 py-2 font-semibold transition-all duration-200',
		'btn-primary':
			'btn bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-900 hover:from-cyan-300 hover:to-emerald-300',
		'btn-ghost': 'btn border border-white/10 hover:border-white/20 hover:bg-white/5'
	},
	theme: {
		colors: {
			bg: '#0b1220',
			panel: '#111827',
			soft: '#1f2937',
			accent: '#22d3ee',
			glow: '#34d399'
		},
		fontFamily: {
			display: '"Space Grotesk Variable", "Inter", system-ui, -apple-system, sans-serif',
			mono: '"JetBrains Mono Variable", "SFMono-Regular", "Consolas", monospace'
		}
	},
	presets: [
		presetUno(),
		presetIcons({
			scale: 1.1,
			collections: {
				solar: () => import('@iconify-json/solar/icons.json').then((i) => i.default)
			}
		}),
		presetTypography()
	],
	transformers: [transformerDirectives()]
});
