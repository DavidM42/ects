
import type { UniversityOptionInterface } from '$lib/types/interfaces/universityOption';
import type { EndpointOutput } from '@sveltejs/kit';

import { UniversityOption } from '$lib/db';

export async function get(): Promise<EndpointOutput> {
    try {
        const allUniversityOptions: UniversityOptionInterface[] = await UniversityOption.find({});

        return {
            body: JSON.stringify(allUniversityOptions)
        };

    } catch(e) {
        console.error(e);
        return {
            body: "internal error at listing degrees",
            status: 500
        };
    }

}