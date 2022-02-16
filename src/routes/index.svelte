<script lang="ts" context="module">
	import type { UniversityOptionInterface } from '$lib/types/interfaces/universityOption';
	// export const prerender = true;

	type DropdownOption = {
		id: string;
		text: string;
	};

	export async function load({ fetch }) {
		const url = `/universities/options`;
		const res = await fetch(url);

		const receivedOptions = (await res.json()) as Array<UniversityOptionInterface>;

		/* preparing options for dropdown */
		const remappedOptions: Array<DropdownOption> = [];
		for (let option of receivedOptions) {
			remappedOptions.push({
				id: option.degreeCollectionKey,
				// TODO add support for other languages and not always use default de
				text: `${option.fullNames['de']}`
			});
		}

		if (res.ok) {
			return {
				props: {
					universityOptions: remappedOptions
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

	import { onMount } from 'svelte';

	import {
		Button,
		ClickableTile,
		Dropdown,
		DropdownSkeleton,
		MultiSelect,
		SkeletonPlaceholder,
	} from 'carbon-components-svelte';

	import { SessionRemembering } from '$lib/sessionRemembering';
	import Footer from '$lib/components/Footer.svelte';
	import type { MultiSelectItem } from 'carbon-components-svelte/types/MultiSelect/MultiSelect.svelte';

	export let universityOptions: Array<DropdownOption>;
	let selectedUniversity: DropdownOption = universityOptions[0];

	let degreeOptions: DropdownOption[];
	let degreeOptionsLoading = false;
	let selectedDegress: DropdownOption[] = [];

	const loadDegreeOptions = async () => {
		degreeOptionsLoading = true;
		try {
			const json = await (await fetch(`/degrees/${selectedUniversity.id}/options`)).json();
			degreeOptions = json.map((option) => ({
				id: option.id,
				text: `${option.degree} (${option.lang}) - ${option.ects ? option.ects : '?'} ECTS`
			}));
			console.log(degreeOptions);
			degreeOptionsLoading = false;
		} catch (e) {
			console.error(e);
		}
	};

	onMount(() => {
		loadDegreeOptions();
	});

	const onUniversitySelected = async (
		event: CustomEvent<{ selectedId: string; selectedIndex: number; selectedItem: any }>
	) => {
		const selectedOption = event.detail.selectedItem;

		selectedUniversity = selectedOption;
		loadDegreeOptions();
	};

	const onDegreesSelected = async (e: CustomEvent<{ selectedIds: string[]; selected: MultiSelectItem[]; unselected: MultiSelectItem[]; }>) => {
		selectedDegress = e.detail.selected;
	};

	const startSession = async () => {
		if (!selectedDegress || selectedDegress.length === 0) {
			alert('Please select at least one degree');
			return;
		}

		// TODO or transfer this stuff via post body instead of url?
		fetch(`/sessions/create-${selectedUniversity.id}-${JSON.stringify(selectedDegress.map(r => r.id))}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: '{}'
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

<svelte:head>
	<title>ects.wuel.de - Study planning and progress tracking</title>
	<meta
		name="description"
		content="Plan your studies at University of Würzburg and track you progress at achieving your degree"
	/>
</svelte:head>

<h1>{import.meta.env.VITE_APP_DOMAIN}</h1>

<!-- TODO i18n for title -->
<div id="interaction-container">
	<h2>Start from default</h2>

	<Dropdown
		size="xl"
		titleText="University"
		selectedIndex={0}
		items={universityOptions}
		on:select={onUniversitySelected}
	/>

	<div class="degree-select-wrapper">
		<!-- {#if degreeOptionsLoading} -->
			<!-- <DropdownSkeleton inline="true" /> -->
		<!-- {:else} -->
		<!-- TODO create skeleton that has same size as multiselect -->
			<MultiSelect
				size="xl"
				titleText="Degree(s)"
				items={degreeOptions}
				on:select={onDegreesSelected}
			/>
		<!-- {/if} -->
	</div>

	<div class="button-wrapper">
		<Button on:click={startSession}>Start</Button>
	</div>

	<div class="fresh-start">
		<!-- <div id="startBtn"> -->
		<!-- <Button href={optionHref}>Start</Button> -->

		<!-- </div> -->
	</div>

	<!-- only render previous session display client side. Depends on saved sessions in client localstorage -->
	{#if browser && SessionRemembering.get().length > 0}
		<h2>Or continue with</h2>
		{#each SessionRemembering.get() as session}
			<div class="tile-container">
				<ClickableTile href="/{session.id}">
					<!-- could display university name but retrieve from linked id not worth it -->
					<div class="info-row">
						<span>Degree:</span>
						<span class="date">{session.degrees?.join(' & ')}</span>
					</div>
					<div class="info-row">
						<span>Progress:</span>
						<span class="date"
							>{session.passedEcts}/{session.ectsSum} ECTS | Ø{session.meanGrade}</span
						>
					</div>
					<div class="info-row">
						<span>Session:</span>
						<span class="seesionid">{session.id}</span>
					</div>
					<div class="info-row">
						<span>Upated on:</span>
						<!-- i18n auto insert en/de or others -->
						<span class="date"
							>{session.updatedAt.toLocaleDateString('de')}
							{session.updatedAt.toLocaleTimeString('de')}</span
						>
					</div>
				</ClickableTile>
			</div>
		{/each}
	{/if}
</div>

<Footer fixed={true} />

<style lang="scss">
	// TODO somehow global layout or style
	// general styles
	h1 {
		font-size: 3rem;
		margin-top: 50px;
		margin-bottom: 25px;
	}

	#interaction-container {
		width: 80vw;
		max-width: 90vw;

		h2 {
			margin-bottom: 10px;
		}

		> div {
			margin-bottom: 25px;
		}

		.degree-select-wrapper,.button-wrapper {
			margin-top: 10px;
		}

		/*
		.fresh-start {
			display: flex;
			margin-top: 10px;

			.degree-select-wrapper {
				flex-grow: 1;
			}

			.button-wrapper {
				display: flex;
				justify-content: flex-end;
				align-items: flex-end;
			}
		}
		*/

		.tile-container {
			margin: 5px 0px;

			.info-row {
				display: flex;
				justify-content: space-between;
				margin-bottom: 5px;

				font-size: 1.1em;
			}
		}
	}
</style>
