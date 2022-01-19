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
	import { browser } from '$app/env';

	// dynamic theming in the browser dark and light according to browser preference
	import 'carbon-components-svelte/css/all.css';

	import { themeChoice } from '$lib/themeChoice';
	themeChoice();

	import { Button, ClickableTile, Dropdown } from 'carbon-components-svelte';
	import { onMount } from 'svelte';

	import type { Degree } from '$lib/types/degree';
	import { SessionRemembering } from '$lib/sessionRemembering';
	import Footer from '$lib/components/Footer.svelte';

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
		} catch (e) {
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

	const onDegreeSelected = (
		event: CustomEvent<{ selectedId: string; selectedIndex: number; selectedItem: any }>
	) => {
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
		})
			.then(async (res) => {
				if (res.ok) {
					window.location.href = `/${await res.text()}`;
				} else {
					console.error(res);
				}
			})
			.catch((e) => {
				console.error(e);
			});
	};
</script>

<h1>{import.meta.env.VITE_APP_DOMAIN}</h1>

<!-- TODO i18n for title -->
<div id="interaction-container">
	<h2>Start from default</h2>

	<div class="fresh-start">
		<Dropdown
			size="xl"
			titleText="Degree"
			selectedIndex={0}
			items={degreeOptions}
			on:select={onDegreeSelected}
		/>
		<!-- <div id="startBtn"> -->
		<!-- <Button href={optionHref}>Start</Button> -->
		<div class="button-wrapper">
			<Button on:click={startSession}>Start</Button>
		</div>
		<!-- </div> -->
	</div>

	<!-- only render previous session display client side. Depends on saved sessions in client localstorage -->
	{#if browser && SessionRemembering.get().length > 0}
		<h2>Or continue with</h2>
		{#each SessionRemembering.get() as session}
			<ClickableTile href="/{session.id}">
				<div class="info-row">
					<span>Session:</span>
					<span class="seesionid">{session.id}</span>
				</div>
				<div class="info-row">
					<span>Created on:</span>
					<span class="date">{session.createdAt.toLocaleDateString()} {session.createdAt.toLocaleTimeString()}</span>
				</div>
			</ClickableTile>
		{/each}
	{/if}
</div>

<Footer fixed={true}/>

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

		h2 {
			margin-bottom: 10px;
		}

		> div {
			margin-bottom: 25px;
		}

		.fresh-start {
			display: flex;
			margin-top: 10px;

			.button-wrapper {
				display: flex;
				justify-content: flex-end;
				align-items: flex-end;
			}
		}

		.info-row {
			display: flex;
			justify-content: space-between;
			margin-bottom: 5px;

			font-size: 1.1em;
		}
	}
</style>
