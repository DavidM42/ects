import type { EndpointOutput } from '@sveltejs/kit';

import mongoose from "mongoose";

import { MongoosePromise, SessionSave } from '$lib/db';
import type { DegreeDefault } from '$lib/types/interfaces/degreeDefault';
import { degreeOptionSchema } from '$lib/types/db-schemas/degreeDefault';

async function getDegreeDefault(universityKey: string, degreeId: string) {
    const universityCollection = `degrees-${universityKey}`;

    // first check if collection actually exists before requesting it like that
    const collectionCursor = (await MongoosePromise).connection.db.listCollections({ name: universityCollection });

    for await (const cursor of collectionCursor) {
        if (cursor.name) {
            const DegreeDefaults = mongoose.model(universityCollection, degreeOptionSchema, universityCollection);

            try {
                const degreeDefault = await DegreeDefaults.findById(degreeId);
                if (degreeDefault) {
                    return degreeDefault;
                }
            } catch (e) {
                console.error(e);
            }
        }
    }
}

export async function post({ params, request }): Promise<EndpointOutput> {
    try {
        const university = params.university;
        const degreeKeys: string[] = JSON.parse(params.degreeKeys);

        // array of all full degree defaults selected
        const degreeDefaultData: DegreeDefault[] = [];

        // combined 2D array of all degree defaults selected
        const combinedCurriculums = [];

        // array of all degree names selected
        const degreeNames = [];

        // combine all selected degrees
        for (const degreeId of degreeKeys) {
            try {
                const json = await getDegreeDefault(university, degreeId);
                degreeDefaultData.push(json);
                degreeNames.push(json.degree);
                combinedCurriculums.push(...json.curriculum);
            } catch (e) {
                console.error(e);
            }
        }

	    // initially set max semester to max semester in combinedCurriculums + 1 (since length one more and not 0 indexed)
        let maxSemester = 0;
            combinedCurriculums.forEach((item) => {
                const maxThisCourseSemester = Math.max(...item.semesters);
                if (maxThisCourseSemester > maxSemester) {
                    maxSemester = maxThisCourseSemester + 1;
                }
        });

        const res = await new SessionSave({
            universityId: university,
            degrees: degreeNames,
            lang: degreeDefaultData[0].lang,
            curriculum: combinedCurriculums,
            createdAt: new Date(),
            updatedAt: new Date(),
            semesters: maxSemester
        }).save();

        if (res) {
            return {
                body: res.id
            };
        }
        // TODO somehow task that deletes all saved automatically after some time if NO MANUAL CHANGE HAS EVER BEEN MADE
    } catch (e) {
        console.error(e);
        return {
            status: 500,
            body: `Could not create sessionSave`
        };
    }
}