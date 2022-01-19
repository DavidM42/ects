<script context="module">
	/** @type {import('@sveltejs/kit').ErrorLoad} */
	export function load({ error, status }) {
		return {
			props: {
				status: status,
                errorMsg: error.message
			}
		};
	}
</script>

<script lang="ts">
    import { statusCodeTextSubsetLookup } from '$lib/types/statusCodes';

    export let errorMsg: string;
    export let status: number;

</script>

<h1>{ import.meta.env.VITE_APP_DOMAIN }</h1>
<h2>{status} - {statusCodeTextSubsetLookup(status)}</h2>
<h3>{errorMsg}</h3>

<style lang="scss">
	h1 {
		font-size: 2.5rem;
		margin-top: 20px;
		margin-bottom: 25px;
	}
</style>
