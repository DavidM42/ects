import { browser, dev } from "$app/env";
import type { CarbonTheme } from 'carbon-components-svelte/types/Theme/Theme.svelte';

export function themeChoice(): CarbonTheme {
	// disabled for ssr and on npm run dev because is slow in hmr without build compile
    if (browser && !dev) {
		const wantsDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
		document.documentElement.setAttribute("theme", wantsDarkMode ? "g100" : "white");

		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
			const wantsDarkMode = event.matches;
			document.documentElement.setAttribute("theme", wantsDarkMode ? "g100" : "white");
		});
        return wantsDarkMode ? "g100" : "white";
	}
    return null;
}