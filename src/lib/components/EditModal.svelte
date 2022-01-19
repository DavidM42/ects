<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import CloseFilled20 from 'carbon-icons-svelte/lib/CloseFilled20';
	import {
		Button,
		Checkbox,
		Form,
		FormGroup,
		NumberInput,
		TextInput
	} from 'carbon-components-svelte';

	import type { Course } from '$lib/types/degree';

	export let course: Course;

	// pre initialize the result empty object if not existing
	// so can be two way binded in form then
	if (!course.state) {
		course.state = {} as any;
	}
	if (!course.state.result) {
		course.state.result = {} as any;
	}

    onMount(() => {
        window.scrollTo(0, 0);
    });

	function closeModalViaEventDispatch() {
		dispatch('close');
	}

	/**
	 * Close modal on pressing escape key
	*/
	function keydownEscapeClose(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			// close modal and focus body to not have focus on some weird element
			document.body.focus();
			closeModalViaEventDispatch();
		}
	}

	const dispatch = createEventDispatcher();
</script>

<!-- good workaround idea from https://github.com/sveltejs/svelte/issues/3105#issuecomment-584037243 -->
<svelte:head>
    <style>
        body {
            overflow: hidden;
        }
    </style>
</svelte:head>

<!-- bind keyboard events to svelte body while modal is open to make sure to catch keyboardEvents no matter the current focus -->
<svelte:body on:keydown={keydownEscapeClose}></svelte:body>

<!-- use mousedown not click to prevent glitch while selecting and moving outside -->
<div on:mousedown|self class="modal">
	<div class="modal-body">
		<span class="close" on:click={() => dispatch('close')}><CloseFilled20 /></span>
		<div class="content-wrapper">
			<Form on:submit={() => dispatch('update', course)}>
				<FormGroup>
					<TextInput id="custom-nane" size="sm" labelText="Custom name" bind:value={course.customname} />
				</FormGroup>

				<FormGroup legendText="Status">
                    <Checkbox
                        id="forecast"
                        labelText="Forecast only"
                        bind:checked={course.state.result.forecast}
                    />
                    {#if !course.state?.options || (course.state.options.passable && !course.state.options.gradeable)}
                        <!-- checkbox shown if passable but not gradeable or no info about options -->
                        <Checkbox id="passed" labelText="Passed" bind:checked={course.state.result.passed} />
                    {/if}
                    {#if !course.state?.options || course.state.options.gradeable}
                        <!-- TODO are bounds correct for studying? -->
                        <!-- grade number input shown if gradeable or no info about options -->
                        <NumberInput
                            id="grade"
                            step={0.1}
                            max={5.0}
                            allowEmpty={true}
                            label="Grade"
                            size="sm"
                            bind:value={course.state.result.grade}
                        />                        
                    {/if}
				</FormGroup>
				<div id="button-container">
					<Button type="submit">Save</Button>
					<Button kind="danger" on:click={() => dispatch('reset', course)}>Reset</Button>
				</div>
			</Form>
		</div>
	</div>
</div>

<style lang="scss">
	// thx https://svelte.dev/repl/4624e3f0f3684ddcb2e2da10592f6df1?version=3.38.2
	// for inspiration
	.modal {
		background-color: rgba(0, 0, 0, 0.4);
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 100;
	}

	.modal-body {
		background-color: var(--cds-ui-background);
		border-radius: 5px;

		min-width: 500px;
		max-width: 95vw;

		.close {
			float: right;
			margin: 10px;
			cursor: pointer;
		}

		.content-wrapper {
			margin: 30px;

			div#button-container {
				display: flex;
				justify-content: space-between;
			}
		}
	}
</style>
