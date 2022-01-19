<script lang="ts">
    // import Attribution from "$lib/components/Attribution.svelte";
</script>


<div class="content">
    <slot></slot>
</div>

<!-- disabled for now as interferred with ui/ux -->
<!-- <Attribution/> -->


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