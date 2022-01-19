<script lang="ts" context="module">
	import type { DefaultDegreeOptions } from '$lib/types/degreeOptions';

	type DropdownOption = {
		id: string;
		text: string;
	};

	export async function load({ fetch }) {
		const url = `/degrees/options`;
		const res = await fetch(url);

		const receivedOptions = (await res.json()) as Array<DefaultDegreeOptions>;

		/* preparing options for dropdown */
		const remappedOptions: Array<DropdownOption> = [];
		for (let option of receivedOptions) {
			remappedOptions.push({
				id: option.id,
				text: `${option.degree} - (${option.lang})`
			});
		}

		if (res.ok) {
			return {
				props: {
					degreeOptions: remappedOptions
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not load ${url}`)
		};
	}
</script>

<script lang="ts">
	import { prefetch } from '$app/navigation';

	// dynamic theming in the browser dark and light according to browser preference
	import "carbon-components-svelte/css/all.css";

	import { themeChoice } from '$lib/themeChoice';
	themeChoice();

	import { Button, Dropdown } from 'carbon-components-svelte';
	import { onMount } from 'svelte';

	import type { Degree } from '$lib/types/degree';

	export let degreeOptions: Array<DropdownOption>;

	let defaultData: Degree;

	/**
	 * Update defaultData saved because key changed
	 * @param key Key/Filename of default definition
	 */
	const updateDefaultData = async (key: string) => {
		try {
			const json = await (await fetch(`/degrees/default-${key}.json`)).json();
			defaultData = json;
		} catch(e) {
			console.error(e);
		}
	};

	// TODO remove?
	// let optionHref = `/degrees/default-${degreeOptions[0].id}`;
	
	onMount(() => {
		// This initial load is not part of load on ssr because not essential to first render
		// but then has to be in onMount to actually happen on client after initialisation
		updateDefaultData(degreeOptions[0].id);
	});

	const onDegreeSelected = (event: CustomEvent<{ selectedId: string; selectedIndex: number; selectedItem: any }>) => {
		const selectedOption = event.detail.selectedItem;
		
		updateDefaultData(selectedOption.id);
		// prefetch the selected degree so when user clicks starts it be fast
		// optionHref = `/degrees/default-${event.detail.selectedItem.id}`;
		// prefetch(optionHref);
	};

	const startSession = () => {
		fetch('/sessions/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(defaultData)
		}).then(async res => {
			if (res.ok) {
				window.location.href = `/${await res.text()}`;
			} else {
				console.error(res);
			}
		}).catch(e => {
			console.error(e);
		});
	}
</script>

<h1>{ import.meta.env.VITE_APP_DOMAIN }</h1>

<!-- TODO i18n for title -->
<div id="interaction-container">
		<Dropdown
		size="xl"
		titleText="Studiengang"
		selectedIndex={0}
		items={degreeOptions}
		on:select={onDegreeSelected}
	/>
	<div id="startBtn">
		<!-- <Button href={optionHref}>Start</Button> -->
		<Button on:click={startSession}>Start</Button>
	</div>
</div>


<style lang="scss">
	// TODO somehow global layout or style
	// general styles
	h1 {
		font-size: 3rem;
		margin-top: 50px;
		margin-bottom: 25px;
	}

	#interaction-container {
		width: 500px;
		max-width: 90vw;
	}

	#startBtn {
		margin-top: 15px;
	}
</style>
