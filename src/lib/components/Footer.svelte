<script lang="ts">
    export let fixed: boolean;
</script>

<footer class:fixed>
	<p>Built with ❤️ as <a target="_blank" href="https://github.com/DavidM42/ects/" rel="noreferrer">Open-Source-Software</a> by David</p>
</footer>


<style lang="scss">
	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 10px;

		&.fixed {
			position: fixed;
			bottom: 0;
			width: 100%;
		}

	}
	footer a {
		font-weight: bold;
        text-decoration: none;
	}
	@media (min-width: 480px) {
		footer {
			padding: 10px 0;
		}
	}
</style>