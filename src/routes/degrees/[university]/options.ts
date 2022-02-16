
import type { EndpointOutput } from '@sveltejs/kit';
import mongoose from "mongoose";

import { MongoosePromise } from '$lib/db';
import type { DefaultDegreeOption } from '$lib/types/interfaces/degreeOptions';
import { degreeOptionSchema } from '$lib/types/db-schemas/degreeDefault';

export async function get({params}): Promise<EndpointOutput> {
    const universityCollection = `degrees-${params.university}`;

    // first check if collection actually exists before requesting it like that
    const collectionCursor = (await MongoosePromise).connection.db.listCollections({ name: universityCollection });

    for await (const cursor of collectionCursor ) {
        const DegreeDefaults = mongoose.model(universityCollection, degreeOptionSchema, universityCollection);

        try {
            const allDegreeDefaults = await DegreeDefaults.find({});
    
            const options: Array<DefaultDegreeOption> = [];
    
            for (const degreeDefault of allDegreeDefaults) {
                options.push({
                    degree: degreeDefault.degree,
                    lang: degreeDefault.lang,
                    id: degreeDefault._id,
                    ects: degreeDefault.ects
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

    return {
        body: "unknown university. Collection for it's degrees does not exist",
        status: 404
    };
}