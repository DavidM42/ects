import { browser } from "$app/env";
import type { CarbonTheme } from 'carbon-components-svelte/types/Theme/Theme.svelte';

export function themeChoice(): CarbonTheme {
    if (browser) {
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