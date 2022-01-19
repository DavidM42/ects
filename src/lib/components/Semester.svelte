<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { flip } from 'svelte/animate';

	import Reset16 from 'carbon-icons-svelte/lib/Reset16';
	import Edit16 from 'carbon-icons-svelte/lib/Edit16';
	import Delete20 from "carbon-icons-svelte/lib/Delete20";

	import { Tooltip } from 'carbon-components-svelte';

	import { dndzone } from 'svelte-dnd-action';

	// thx https://github.com/isaacHagoel/svelte-dnd-action#overriding-the-item-id-key-name
	// needed because of mongoDB auto id using _id not id for modules
	import { overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action';
	overrideItemIdKeyNameBeforeInitialisingDndZones('_id');

	import type { Course } from '$lib/types/degree';
	import EditModal from './EditModal.svelte';
	const flipDurationMs = 200;

	export let semesterIndex: number;
	export let items = [];

	/******* ECTS and grade calculation for semester ********/
	/** Combined ects of all courses you passed in this semester*/
	let passedEcts: number;
	let semesterEctsSum: number;
	let meanGrade: number;
	/**
	 * Calculate ects sum of passed and and all courses and calculate mean grade
	 */
	const calcSemesterValues = () => {
		passedEcts = 0;
		semesterEctsSum = 0;

		let gradedCourseEctsSum = 0;
		let weightedGradeSum = 0;

		items.forEach((item) => {
			const ects = item.ects;
			semesterEctsSum += ects;

			const hasGrade = item.state.result?.grade;
			if (item.state.result?.passed || (hasGrade && item.state.result.grade < 4.0)) {
				passedEcts += ects;
			}
			if (hasGrade) {
				gradedCourseEctsSum += ects;
				weightedGradeSum += ects * item.state.result.grade;
			}
		});
		// calculate mean grade this semester
		const exactMeanGrade = gradedCourseEctsSum ? weightedGradeSum / gradedCourseEctsSum : null;
		// rounded to 2 decimal places
		meanGrade = Math.round((exactMeanGrade + Number.EPSILON) * 100) / 100;
	};
	calcSemesterValues();

	/**** Resorting stuff handler for dnd lib *****/
	function handleSort(e) {
		items = e.detail.items;
		calcSemesterValues();
		dispatch('updated', items);
	}


	/********* Editing courses stuff *********/
	let courseToEdit: Course;
	let editModalShown = false;

	const startCourseEdit = (course) => {
		courseToEdit = course;
		editModalShown = true;
	};

	/** Finish course edit and apply new course over it*/
	const finishCourseEdit = (ev: CustomEvent<Course>) => {
		const courseIndex = items.findIndex((item) => item._id === ev.detail._id);
		items[courseIndex] = ev.detail; 
		courseToEdit = undefined;
		editModalShown = false;
		calcSemesterValues();
		dispatch('updated', items);
	}

	/** Reset a courses state like passed or grade */
	const resetCourseState = (ev: CustomEvent<Course>) => {
		const courseIndex = items.findIndex((item) => item._id === ev.detail._id);
		items[courseIndex].state.result = {};
		delete items[courseIndex].customname;

		courseToEdit = undefined;
		editModalShown = false;
		calcSemesterValues();
		dispatch('updated', items);
	}

	const dispatch = createEventDispatcher();
</script>

{#if editModalShown}
	<EditModal course={courseToEdit} on:mousedown={() => editModalShown = !editModalShown} on:close={() => editModalShown = false} on:update={finishCourseEdit} on:reset={resetCourseState}/>
{/if}

<div class="semester">
	<div class="semester-info">
		<div>Semester <span class="number">{semesterIndex + 1}</span></div>

		{#if meanGrade}
			<div>
				Ø<span class="number">{meanGrade}</span>
			</div>
		{/if}

		<div>
			<span class="number">{passedEcts}</span> /
			<span class="number">{semesterEctsSum}</span> ECTS
		</div>

		{#if !items || items.length === 0}
			<div class="semester-remove" on:click={() => dispatch('semesterDelete')}><Delete20 /></div>
		{/if}
	</div>
	<!-- TODO make clickable to mark as done, failed, todo and so on -->
	<div
		class="module-container"
		use:dndzone={{ items, flipDurationMs }}
		on:consider={handleSort}
		on:finalize={handleSort}
	>
		<!-- TODO abstract module into a seperate component with update function -->
		<!-- TODO and then rename it all course  -->
		{#each items as item, itemIndex (item._id)}
			<div
				class="module"
				on:dblclick={() => startCourseEdit(item)}
				animate:flip={{ duration: flipDurationMs }}
				style="--relation-color: {item.relation?.color || '#ececec'};"
				class:feedback--passed={item.state?.result?.passed || (item.state?.result?.grade <= 4.0 && item.state?.result?.grade > 0.0)}
				class:feedback--failed={item.state?.result?.passed === false || item.state?.result?.grade > 4.0}
				class:feedback--forecast={item.state?.result?.forecast}
			>
				<div class="shortname">{item.shortname}</div>

				<!-- show user given custom name if set else normal fullname -->
				{#if item.customname}
					<div class="fullname customname">{item.customname}</div>
				{:else}
					<div class="fullname">{item.fullname}</div>
				{/if}

				<div class="number-results-row">
					<span class="ects">{item.ects}</span> ects
					{#if item.state?.result?.grade}
						/ <span class="grade">{item.state.result.grade}</span>
					{/if}
				</div>

				{#if item.types && item.types.length > 0}
					<div class="types">{`(${item.types.join(',')})`}</div>
				{/if}

				<!-- on first element in first semester include tooltip how to double tap and use -->
				{#if semesterIndex === 0 && itemIndex === 0}
					<div class="help-tooltip">
						<Tooltip>
							<p id="tooltip-body">
								Double click course to edit
							</p>
						</Tooltip>
					</div>	
				{/if}

			</div>
		{/each}
	</div>
</div>

<style lang="scss">
	@media only screen and (min-width: 1150px) {
		// desktop
		.semester {
			flex-direction: row;

			// row only 120px on desktop because more horizontal space for text exists
			height: 120px;

			.semester-info {
				// defined 110px width on desktop
				width: 115px;
			}

			.module-container {
				// prevnt weird flex changes with semester-info on overflow cases
				// because container is not full row on desktop
				width: 95vw;

				.module {
					width: 10vw;
				}
			}
		}
	}

	@media only screen and (max-width: 1149px) {
		// mobile phone narrow

		.semester {
			flex-direction: column;
			// justify-content: center;

			.semester-info {
				// full width row on mobile
				width: 100%;
				padding: 5px 0px;

				div {
					margin: 2px 0px;
				}
			}

			.module-container {
				// taller rows on mobile for text lines
				height: 175px;

				.module {
					width: 20vw;
				}
			}
		}
	}

	.semester {
		display: flex;

		margin: 1px 0px;

		// if the relation coniditional var is missing
		--fallback-color: #ececec;

		.semester-info {
			text-align: center;
			display: flex;
			justify-content: space-evenly;
			align-items: center;
			flex-direction: column;

			border-radius: 10px;
			// always white text on black bg in light and dark theme
			background-color: var(--lt-color-text-default);
			color: var(--lt-color-background-default);

			margin: 5px 0px;

			.number {
				font-size: 1.2em;
				font-weight: 700;
			}
		}

		.semester-remove {
			cursor: pointer;
		}
	}

	.module-container {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;

		// inverted theme from rest to contrast
		color: var(--cds-ui-background, #ffffff);

		.module {
			// needed as anchor for tooltip absolute positioning later
			position: relative;

			display: flex;
			justify-content: space-between;
			align-items: center;
			flex-direction: column;
			text-align: center;

			// inverted theme from rest to contrast
			background-color: var(--cds-text-01, #161616);

			margin: 5px;
			border: 5px solid var(--relation-color, --fallback-color);
			border-radius: 5px 0px;

			/******************* Status feedback stuff ********************/
			&.feedback {
				&--failed {
					// TODO find way to only once define color
					background-color: rgba(255, 0, 0, 0.6);
					// first try out ux of bg-color probs
					// thx to https://stackoverflow.com/a/24084708
					// box-shadow: inset 0 0 0 1000px rgba(255,0,0,.45);
				}

				&--passed {
					background-color: rgba(0, 255, 0, 0.6);
				}

				&--forecast {
					background-color: rgba(208, 116, 245, 0.6);
				}
			}

			/******************* Info rows ********************************/
			// space between rows of info
			div {
				margin: 2px 0px;
			}

			/* Info types styling */
			.shortname {
				font-size: 1.5em;
			}

			.fullname {
				font-size: 0.7em;
				max-width: 90%;
				text-overflow: ellipsis;
				max-height: 35%;
				overflow: hidden;
				padding-bottom: 2px;

				&.customname {
					font-style: italic;
					// color: #3077c6
				}
			}

			.number-results-row {
				.ects, .grade {
					font-weight: 600;
				}
			}

			.types {
				font-size: 0.8em;
			}

			.help-tooltip {
				position: absolute;
				// -3px to compensate for margin of module-container
				bottom: -3px;
				right: 1px;
			}
		}
	}
</style>
