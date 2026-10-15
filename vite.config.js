import { defineConfig } from 'vite';

// base './' makes every built URL relative, so the site works at any address,
// including a GitHub Pages project path like https://<user>.github.io/<repo>/.
// cssTarget keeps color-mix(), cos() in calc(), @layer, svh/lvh and CSS nesting intact.
export default defineConfig({ base: './', build: { target: 'es2022', cssTarget: 'chrome111' } });
