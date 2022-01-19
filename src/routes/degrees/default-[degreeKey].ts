
import type { EndpointOutput } from '@sveltejs/kit';

import { DegreeDefaults } from '$lib/db';

export async function get({params}): Promise<EndpointOutput> {
    try {
        const degreeDefault = await DegreeDefaults.findById(params.degreeKey);

        if (degreeDefault) {
            return {
                body: JSON.stringify(degreeDefault),
            };
        }
        return {
            body: "not found",
            status: 404
        };
    } catch(e) {
        console.error(e);
        return {
            body: "database lookup failed",
            status: 500
        };
    }

}