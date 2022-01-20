<script lang="ts">
	// ibm carbon theming
	import { Theme } from 'carbon-components-svelte';
	import 'carbon-components-svelte/css/all.css';

	import { themeChoice } from '$lib/themeChoice';
	// initialize theme fitting for browser preference
	let theme = themeChoice();
</script>

<Theme bind:theme />

<div class="content">
    <slot></slot>
</div>

<style lang="scss">
	// general styles
	div.content {
		width: 100%;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>