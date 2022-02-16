import type { EndpointOutput } from '@sveltejs/kit';

import { SessionSave } from '$lib/db';
import type { SaveData } from '$lib/types/interfaces/SaveData';

export async function get({ params }): Promise<EndpointOutput> {
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

export async function put({ params, request }): Promise<EndpointOutput> {
    try {
        const data: SaveData = (await request.json()) as SaveData;

        const res = await SessionSave.findByIdAndUpdate(params.id, {
            degrees: data.degrees,
			lang: data.lang,
            universityId: data.universityId,
            semesters: data.semesters,
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
                body: `Could not find ${params.id} session`
            };
        }
    } catch (e) {
        console.error(e);
        return {
            status: 500,
            body: `Could not update session ${params.id}`
        };
    }
}

export async function del({ params }): Promise<EndpointOutput> {
    try {
        const res = await SessionSave.findByIdAndDelete(params.id);
    
        if (res) {
            return {
                body: "deleted"
            };
        } else {
            return {
                status: 401,
                body: `Could not find ${params.id} session`
            };
        }
    } catch (e) {
        console.error(e);
        return {
            status: 500,
            body: `Could not delete session ${params.id}`
        };
    }
}