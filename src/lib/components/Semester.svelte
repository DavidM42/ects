<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import { dndzone } from 'svelte-dnd-action';

	// thx https://github.com/isaacHagoel/svelte-dnd-action#overriding-the-item-id-key-name
	// needed because of mongoDB auto id using _id not id for modules
	import {overrideItemIdKeyNameBeforeInitialisingDndZones} from "svelte-dnd-action";
	overrideItemIdKeyNameBeforeInitialisingDndZones("_id");

	import { flip } from 'svelte/animate';
	const flipDurationMs = 200;

	export let semesterIndex: number;
	export let items = [];

	let ectsSum: number;

	const calcSemesterEcts = () => {
		ectsSum = 0;
		items.forEach((item) => {
			ectsSum += item.ects;
		});
	};
	calcSemesterEcts();

	function handleSort(e) {
		items = e.detail.items;
        calcSemesterEcts();
        dispatch('updated', items);
	}

    const dispatch = createEventDispatcher();
</script>

<div class="semester">
	<div class="semester-info">
		<div>Semester <span class="number">{semesterIndex + 1}</span></div>
		<div><span class="number">{ectsSum}</span> ECTS</div>
	</div>
	<!-- TODO make clickable to mark as done, failed, todo and so on -->
	<div
		class="module-container"
		use:dndzone={{ items, flipDurationMs }}
		on:consider={handleSort}
		on:finalize={handleSort}
	>
		{#each items as item (item._id)}
			<div class="module" animate:flip={{ duration: flipDurationMs }} style="border: 5px solid {item.relation?.color || '#ececec'};">
                <div class="shortname">{item.shortname}</div>
                <div class="fullname">{item.fullname}</div>
                <div class="ects">{item.ects}</div>
                <div class="types">{`(${item.types.join(',')})`}</div>
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
				// defined 100px width on desktop
				width: 100px;
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

		.semester-info {
			// positioning of info
			text-align: center;
			display: flex;
			justify-content: space-evenly;
			align-items: center;
			flex-direction: column;

			border-radius: 10px;
			background-color: #ececec;

			margin: 5px 0px;

            .number {
                font-size: 1.2em;
                font-weight: 700;
            }
		}
	}

	.module-container {
		display: flex;
		flex-direction: row;
		justify-content: flex-start;

		color: #3077c6;

		.module {
			// positioning of info
			display: flex;
			justify-content: center;
			align-items: center;
			flex-direction: column;
            text-align: center;

			// TODO dynamically
			// background-color: azure;
			// border: 1px solid red;

            margin: 5px;
            border-radius: 5px 0px;
            background-color: #fff;

            // space between rows of info
            div {
                margin: 3px 0px;
            }

            /* Info types styling */
            .shortname {
                font-size: 1.5em;
            }

            .fullname {
                font-size: 0.7em;
                max-width: 80%;
                text-overflow: none;
                max-height: 30%;
                overflow: hidden;
            }

            .ects {
                font-weight: 600;
            }

            .types {
                font-size: 0.8em;
            }
		}
	}
</style>
