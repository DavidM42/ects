<!-- then at some fix index.svelte to create new sessions too -->
<script lang="ts" context="module">
	export async function load({ params, fetch }) {
		const url = `/sessions/${params.id}`;
		const res = await fetch(url);

		if (res.ok) {
			const json: Degree = await res.json();

			return {
				props: {
					saveData: json
				}
			};
		}

		return {
			status: res.status,
			error: new Error(`Could not find session ${params.id}.\nAre you sure it exists?`)
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/env';

	import 'carbon-components-svelte/css/white.css';
	import { Button, Modal, ProgressBar } from 'carbon-components-svelte';

	import Semester from '$lib/components/Semester.svelte';
	import RelationLegend from '$lib/components/RelationLegend.svelte';
	import type { Degree } from '$lib/types/degree';

	export let saveData: Degree;
	// console.log(saveData);

	let changedSinceLastSaveTime = false;
	let saving = false;

	let openedDeleteModal = false;

	let ectsSum: number;

	const calcDegreeEcts = () => {
		ectsSum = 0;
		saveData.curriculum.forEach((semester) => {
			semester.forEach((course) => {
				ectsSum += course.ects;
			});
		});
	};
	calcDegreeEcts();

	/**
	 * Listener to warn users from leaving with non saved changes
	 */
	const autoSaveListener = (e) => {
		const confirmationMessage =
			'Es sieht so aus, als hätten Sie etwas bearbeitet. Wenn Sie die Seite vor dem Speichern verlassen, gehen Ihre Änderungen verloren.';
		(e || window.event).returnValue = confirmationMessage; //Gecko + IE

		// invoke autoSave to be on the save side soon
		autoSave();

		return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
	};

	const onUpdatedSemester = (semesterIndex, newData) => {
		saveData.curriculum[semesterIndex] = newData;
		changedSinceLastSaveTime = true;
		
		// TODO activate again when finishing and failing and so on is implemented for modules to calc progress 
		// calcDegreeEcts();

		window.addEventListener('beforeunload', autoSaveListener);
	};

	// TODO ui feedback that it is saving and when?
	/**
	 * Calls itself once every minute and if any change was recorded saves it to mongodb
	 */
	const autoSave = () => {
		if (changedSinceLastSaveTime) {
			saving = true;
			console.log('Saving');

			fetch(`/sessions/${saveData._id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(saveData)
			})
				.then(async (res) => {
					if (res.ok) {
						console.log('Saved');
					} else {
						console.error(res);
					}
				})
				.catch((e) => {
					console.error(e);
				})
				.finally(() => {
					changedSinceLastSaveTime = false;
					saving = false;
					window.removeEventListener('beforeunload', autoSaveListener);
				});
		}

		// check for edits and save once a minute
		setTimeout(autoSave, 60 * 1000);
		// setTimeout(autoSave, 5 * 1000);
	};
	autoSave();

	const deleteSession = (event: any) => {
		fetch(`/sessions/${saveData._id}`, {
			method: 'DELETE'
		})
			.then(async (res) => {
				if (res.ok) {
					console.log('Deleted');
					window.location.href = '/';
				} else {
					console.error(res);
				}
			})
			.catch((e) => {
				console.error(e);
			});
	};

	onMount(async () => {
		if (browser) {
			// thx for import tip to https://github.com/sveltejs/kit/issues/905#issuecomment-816389084
			const plsRotate = (await import('pleaserotate.js')).default;
			// remind user to rotate to landscape on mobile because useless otherwise
			const options = {
				message: "Please Rotate Your Device",
				subMessage: "Plan is too wide for portrait mode",
				allowClickBypass: false
			}
			plsRotate.start(options);
		}
	});

	// setTimeout(() => console.log(saveData), 10000);
</script>

<h1>{ import.meta.env.VITE_APP_DOMAIN }</h1>
<h3>{saveData.degree} - <span class="number">{ectsSum}</span> ects</h3>

<div class="grid">
	<RelationLegend {saveData} />

	<!-- Modal to confirm deletion -->
	<Modal
		danger
		bind:open={openedDeleteModal}
		modalHeading="Delete all"
		primaryButtonText="Delete"
		secondaryButtonText="Cancel"
		on:click:button--secondary={() => (openedDeleteModal = false)}
		on:submit={deleteSession}
	>
		<p>Deleting your personal plan is permanent and cannot be undone.</p>
	</Modal>

	{#if saveData?.curriculum}
		{#each saveData.curriculum as semester, i}
			<!-- Two way binding input data but also always update saveData on changes out here -->
			<Semester
				semesterIndex={i}
				items={saveData.curriculum[i]}
				on:updated={(e) => onUpdatedSemester(i, e.detail)}
			/>
		{/each}
	{/if}

	<div id="interaction-container">
		<div id="save-status-container" on:click={() => autoSave()}>
			{#if saving}
				<ProgressBar helperText="Saving..." />
			{:else if changedSinceLastSaveTime}
				<ProgressBar value={100} helperText="Unsaved changes" />
			{:else}
				<ProgressBar value={0} helperText="Changes saved" />
			{/if}
		</div>
		<div id="button-container">
			<Button kind="danger" on:click={() => (openedDeleteModal = true)}>Delete</Button>
			<!-- TODO share button? -->
		</div>
	</div>

<!-- /div.container -->
</div>

<style lang="scss">
	h1 {
		font-size: 2.4rem;
		margin-top: 15px;
		margin-bottom: 5px;
	}

	h3 {
		font-size: 1.5rem;
		margin-bottom: 5px;

		.number {
			font-size: 1.05em;
			font-weight: 700;
		}
	}

	div#interaction-container {
		display: flex;
		flex-direction: row;
		margin-bottom: 10px;

		div#save-status-container {
			cursor: pointer;
			flex-grow: 1;
			margin-right: 10px;
		}
	}

	.grid {
		display: flex;
		flex-direction: column;
		width: 95%;
	}
</style>
