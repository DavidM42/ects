
import type { DefaultDegreeOptions } from '$lib/types/degreeOptions';
import type { EndpointOutput } from '@sveltejs/kit';

import { DegreeDefaults } from '$lib/db';

export async function get(): Promise<EndpointOutput> {
    try {
        const allDegreeDefaults = await DegreeDefaults.find({});
        console.log(allDegreeDefaults);

        const options: Array<DefaultDegreeOptions> = [];

        for (const degreeDefault of allDegreeDefaults) {
            options.push({
                degree: degreeDefault.degree,
                lang: degreeDefault.lang,
                id: degreeDefault._id
            });
        }

        return {
            body: JSON.stringify(options)
        };

    } catch(e) {
        console.error(e);
        return {
            body: "internal error at listing degrees",
            status: 500
        };
    }

}