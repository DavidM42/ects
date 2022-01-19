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
	import { browser, dev } from '$app/env';

	import { Button, CodeSnippet, Modal, ProgressBar } from 'carbon-components-svelte';

	import Semester from '$lib/components/Semester.svelte';
	import RelationLegend from '$lib/components/RelationLegend.svelte';
	import type { Course, Degree } from '$lib/types/degree';
	import { SessionRemembering } from '$lib/sessionRemembering';
	import Footer from '$lib/components/Footer.svelte';

	export let saveData: Degree;
	// console.log(saveData);

	let changedSinceLastSaveTime = false;
	let saving = false;

	let openedDeleteModal = false;

	/******* ECTS and grade calculation for whole degree ********/
	/** Combined ects of all courses you passed in degree*/
	let passedEcts: number;
	let degreeEctsSum: number;
	let meanGrade: number;
	/**
	 * Calculate ects sum of passed and and all courses and calculate mean grade
	 */
	const calcDegreeValues = () => {
		passedEcts = 0;
		degreeEctsSum = 0;

		let gradedCourseEctsSum = 0;
		let weightedGradeSum = 0;

		saveData.curriculum.forEach((semester) => {
			semester.forEach((item) => {
				const ects = item.ects;
				degreeEctsSum += ects;

				const hasGrade = item.state.result?.grade;
				if (item.state.result?.passed || (hasGrade && item.state.result.grade < 4.0)) {
					passedEcts += ects;
				}
				if (hasGrade) {
					gradedCourseEctsSum += ects;
					weightedGradeSum += ects * item.state.result.grade;
				}
			});
		});
		// calculate mean grade this semester
		const exactMeanGrade = gradedCourseEctsSum ? weightedGradeSum / gradedCourseEctsSum : null;
		// rounded to 2 decimal places
		meanGrade = Math.round((exactMeanGrade + Number.EPSILON) * 100) / 100;
	};
	calcDegreeValues();

	/**
	 * Listener to warn users from leaving with non saved changes
	 */
	const unsavedChangesCloseListener = (e) => {
		const confirmationMessage =
			'Es sieht so aus, als hätten Sie etwas bearbeitet. Wenn Sie die Seite vor dem Speichern verlassen, gehen Ihre Änderungen verloren.';
		(e || window.event).returnValue = confirmationMessage; //Gecko + IE

		// invoke autoSave to be on the save side soon
		autoSave();

		return confirmationMessage; //Gecko + Webkit, Safari, Chrome etc.
	};

	const onUpdatedSemester = (semesterIndex: number, newData: Course[]) => {
		saveData.curriculum[semesterIndex] = newData;
		changedSinceLastSaveTime = true;
		calcDegreeValues();

		// TODO activate again when finishing and failing and so on is implemented for modules to calc progress
		// calcDegreeEcts();

		window.addEventListener('beforeunload', unsavedChangesCloseListener);
	};

	// TODO ui feedback that it is saving and when?
	/**
	 * Calls itself once every minute and if any change was recorded saves it to mongodb
	 */
	const autoSave = async () => {
		if (changedSinceLastSaveTime) {
			saving = true;
			console.log('Saving');

			// update session storage
			SessionRemembering.addOrUpdate(saveData._id, saveData.degree, passedEcts, degreeEctsSum, meanGrade);

			// then update database via backend
			try {
				const res = await fetch(`/sessions/${saveData._id}`, {
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(saveData)
				});
				if (res.ok) {
					console.log('Saved');
				} else {
					console.error(res);
				}
			} catch (e) {
				console.error(e);
			}
			changedSinceLastSaveTime = false;
			saving = false;
			window.removeEventListener('beforeunload', unsavedChangesCloseListener);
		}

		// check for edits and save once a minute
		setTimeout(autoSave, 60 * 1000);
		// setTimeout(autoSave, 5 * 1000);
	};
	autoSave();

	const deleteSession = async () => {
		const id = saveData._id;
		try {
			const res = await fetch(`/sessions/${id}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				console.log('Deleted');
				SessionRemembering.remove(id);

				// don't warn user of unsaved changes anymore now
				window.removeEventListener('beforeunload', unsavedChangesCloseListener);
				window.location.href = '/';
			} else {
				console.error(res);
			}
		} catch (e) {
			console.error(e);
		}
	};

	/** Adds a new semester, saved and reload page. Reload needed because dnd zones can't be re initialized */
	const addSemester = async () => {
		saveData.curriculum.push([]);
		changedSinceLastSaveTime = true;
		await autoSave();
		window.location.reload();
	};

	/** Removes semester at position i */
	const removeSemester = async (i: number) => {
		saveData.curriculum.splice(i, 1);
		changedSinceLastSaveTime = true;
		await autoSave();
		window.location.reload();
	};

	/** Custom sharing action for url */
	const shareUrl = (text) => {
		if (navigator.share) {
			// native share on mobile devices in https context
			navigator.share({
				url: window.location.href,
			}).then(r => console.log('share invoked')).catch(e => console.warn(e));
		}
		else {
			// fallback copy to clipboard
			navigator.clipboard.writeText(window.location.href);
		}
	}

	onMount(async () => {
		if (browser) {
			SessionRemembering.addOrUpdate(saveData._id, saveData.degree, passedEcts, degreeEctsSum, meanGrade);

			// disable please rotate on dev server because hmr messes it up
			if (!dev) {
				// thx for import tip to https://github.com/sveltejs/kit/issues/905#issuecomment-816389084
				const plsRotate = (await import('pleaserotate.js')).default;
				// remind user to rotate to landscape on mobile because useless otherwise
				const options = {
					message: 'Please Rotate Your Device',
					subMessage: 'Plan is too wide for portrait mode',
					allowClickBypass: false
				};
				plsRotate.start(options);
				}
		}
	});

	// setTimeout(() => console.log(saveData), 10000);
</script>

<h1>{import.meta.env.VITE_APP_DOMAIN}</h1>
<h3>{saveData.degree}</h3>
<div id="stats-container">
	<div class="ects">
		<ProgressBar
			max={degreeEctsSum}
			value={passedEcts}
			labelText="Progress"
			helperText="{passedEcts} / {degreeEctsSum} ECTS"
		/>
	</div>
	<div class="grade">
		Ø<span class="number">{meanGrade}</span>
	</div>
</div>

<div class="grid">
	<div id="interaction-container">
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

		<div class="second-row">
			<div class="url-snippet">
				{#if browser}
					<CodeSnippet code={window.location.href} copy={shareUrl}/>
				{:else}
					<CodeSnippet skeleton={true}/>
				{/if}
			</div>
			<div id="save-status-container" on:click={() => autoSave()}>
				{#if saving}
					<ProgressBar helperText="Saving..." />
				{:else if changedSinceLastSaveTime}
					<ProgressBar value={100} helperText="Unsaved changes" />
				{:else}
					<ProgressBar value={0} helperText="Changes saved" />
				{/if}
			</div>
		</div>
	</div>

	<hr class="plan-seperator">

	<RelationLegend {saveData} />

	{#if saveData?.curriculum}
		{#each saveData.curriculum as semester, i}
			<!-- Two way binding input data but also always update saveData on changes out here -->
			<Semester
				semesterIndex={i}
				items={saveData.curriculum[i]}
				on:updated={(e) => onUpdatedSemester(i, e.detail)}
				on:semesterDelete={() => removeSemester(i)}
			/>
		{/each}
	{/if}

	<div id="button-container" class="first-row">
		<button on:click={addSemester}>Add semester</button>
		<button class="danger" on:click={() => (openedDeleteModal = true)}>Purge plan</button>
	</div>

	<!-- /div.container -->
</div>
<Footer fixed={false}/>

<style lang="scss">
	h1 {
		font-size: 2.4rem;
		margin-top: 15px;
		margin-bottom: 5px;
	}

	h3 {
		font-size: 1.5rem;
		margin-bottom: 5px;
	}

	div#stats-container {
		font-size: 1.3rem;
		text-align: center;

		display: flex;
		justify-content: center;
		align-items: center;

		div {
			margin: 2px 5px;
		}

		.number {
			font-size: 1.05em;
			font-weight: 700;
		}
	}

	div#interaction-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		margin-bottom: 10px;

		div {
			margin: 5px 0px;
		}

		div#save-status-container {
			cursor: pointer;
			flex-grow: 0.5;
			margin-right: 10px;
		}

		div.url-snippet {
				// should fit url and need defined size for skeleton in preload
				width: 450px;
		}
	}

	div#button-container {
		margin-top: 10px;
		width: 100%;
		display: flex;
		flex-direction: row;

		button {
			display: flex;
			flex-grow: 1;
			cursor: pointer;
			padding: 10px;

			// copied from carbon components button
			// but carbon components flex full size restyle did not work
			font-size: 1.1em;
			border-width: 1px;
			border-style: solid;
			border-color: transparent;

			color: var(--cds-text-04, #ffffff);
			background-color: var(--cds-hover-primary, #0353e9);

			&.danger {
				background-color: var(--cds-danger-01, #da1e28);
				color: var(--cds-text-04, #ffffff);
			}
		}
	}

	hr.plan-seperator {
		background-color: var(--lt-color-background-default);
		width: 100%;
		height: 2px;
	}

	.grid {
		display: flex;
		flex-direction: column;
		width: 95%;
	}
</style>
