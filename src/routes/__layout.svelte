<script lang="ts">
    import Attribution from "$lib/components/Attribution.svelte";
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
	@media only screen and (min-width: 1150px) {
		// desktop 

	}
	@media only screen and (max-width: 1149px) {
		// mobile phone narrow
	}
</style>