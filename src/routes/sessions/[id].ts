import type { EndpointOutput, Request } from '@sveltejs/kit';

import { SessionSave } from '$lib/db';
import type { Degree } from '$lib/types/degree';

export async function get({ params }: Request): Promise<EndpointOutput> {
    try {
        const saveData = await SessionSave.findById(params.id);

        if (saveData) {
            return {
                body: JSON.stringify(saveData)
            };
        } else {
            return {
                status: 404,
                body: `Could not find ${params.id} session`
            };
        }
    } catch (e) {
        console.error(e);
        return {
            status: 500,
            body: `Could not load session ${params.id}`
        };
    }
}

export async function put( request : Request): Promise<EndpointOutput> {
    try {
        const data: Degree = request.body as unknown as Degree;

        const res = await SessionSave.findByIdAndUpdate(request.params.id, {
            degree: data.degree,
			lang: data.lang,
			curriculum: data.curriculum,
            updatedAt: new Date()
        });
    
        if (res) {
            return {
                body: "updated"
            };
        } else {
            return {
                status: 401,
                body: `Could not find ${request.params.id} session`
            };
        }
    } catch (e) {
        console.error(e);
        return {
            status: 500,
            body: `Could not update session ${request.params.id}`
        };
    }
}

// TODO test this endpoint
export async function del( request : Request): Promise<EndpointOutput> {
    try {
        const res = await SessionSave.findByIdAndDelete(request.params.id);
    
        if (res) {
            return {
                body: "deleted"
            };
        } else {
            return {
                status: 401,
                body: `Could not find ${request.params.id} session`
            };
        }
    } catch (e) {
        console.error(e);
        return {
            status: 500,
            body: `Could not delete session ${request.params.id}`
        };
    }
}