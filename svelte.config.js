import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Vercel adapter for optimal deployment
		adapter: adapter({
			// Enable Edge Runtime for serverless functions
			runtime: 'nodejs20.x',
			// Optimize for production
			split: true
		})
	}
};

export default config;
