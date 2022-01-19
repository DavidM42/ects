import type { EndpointOutput } from '@sveltejs/kit';

import { SessionSave } from '$lib/db';
import type { Degree } from '$lib/types/degree';

export async function post({ params, request }): Promise<EndpointOutput> {
    try {
        const data: Degree = (await request.json()) as Degree;
    
		const res = await new SessionSave({
			degree: data.degree,
			lang: data.lang,
			curriculum: data.curriculum,
            createdAt: new Date(),
            updatedAt: new Date()
		}).save();

        if (res) {
            return {
                body: res.id
            };
        }
    } catch (e) {
        console.error(e);
        return {
            status: 500,
            body: `Could not create sessionSave`
        };
    }
}