<script lang="ts">
	export let saveData;

    function getRelationLegendItems() {
        if (!saveData?.curriculum) {
            return [];
        }

        const relationsWDuplicates = new Array<{color: string, name: string}>();

        saveData.curriculum.forEach(course => {
            if (course.relation) {
                relationsWDuplicates.push(course.relation);
            }
        });
        // thx https://stackoverflow.com/a/58429784
        const uniqueRelations = [...new Map(relationsWDuplicates.map(item => [item.color, item])).values()];

        return uniqueRelations;
    }

</script>

<div class="legend-row">
		{#each getRelationLegendItems() as item }
			<div class="relation" style="border: 5px solid {item.color };">
                <div class="name">{item.name}</div>
			</div>
		{/each}
</div>

<style lang="scss">
	.legend-row {
		display: flex;
		flex-direction: row;
		justify-content: center;

		margin: 1px 0px;

		height: 40px;

        .relation {
            margin: 2px;
            padding: 5px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 1.25em;
            background-color: var(--lt-color-background-default);
            color: var(--lt-color-text-default);
        }

	}
</style>
