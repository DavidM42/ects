import { browser } from "$app/env";

export function themeChoice(): void {
    if (browser) {
		const wantsDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
		document.documentElement.setAttribute("theme", wantsDarkMode ? "g100" : "white");

		window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
			const wantsDarkMode = event.matches;
			document.documentElement.setAttribute("theme", wantsDarkMode ? "g100" : "white");
		});
	}
}