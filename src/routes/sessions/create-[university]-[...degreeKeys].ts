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

        // TODO write unit test for this logic as it could corrupt the database 
        // combine all selected degrees
        for (const degreeId of degreeKeys) {
            try {
                const json = await getDegreeDefault(university, degreeId);
                degreeDefaultData.push(json);
                degreeNames.push(json.degree);

                /** Incrementing index for course IDs */
                let idIncrement = 0;

                console.warn('WTF');
                for (let semesterIndex = 0; semesterIndex < json.curriculum.length; semesterIndex++) {
                    const semester = json.curriculum[semesterIndex];

                    for (let courseInSemesterIndex = 0; courseInSemesterIndex < semester.length; courseInSemesterIndex++) {
                        if (!semester[courseInSemesterIndex]._id) {
                            // generate incrementing id for every module in semester if not yet set by multisemester insertion (or manually in json)
                            semester[courseInSemesterIndex]._id = idIncrement++;
                        }

                        /*
                            logic for multi semester modules
                            duplicating and marking
                        */
                        /*
                        if (semester[courseInSemesterIndex].multisemester && semester[courseInSemesterIndex].multisemester > 1) {
                            const lastMultiSemesterIndex = semester[courseInSemesterIndex].multisemester;
                            semester[courseInSemesterIndex].lastMultiSemesterId = `${semester[courseInSemesterIndex]._id}-multi-${lastMultiSemesterIndex}`;

                            if (lastMultiSemesterIndex > 9) {
                                const error = `${degreeId} has a multisemester module with more than 9 semesters. Which is not supported as of now.`;
                                console.error(error);
                                return {
                                    status: 400,
                                    body: error
                                };
                            }

                            for (let multiSemesterOffset = 1; multiSemesterOffset <= lastMultiSemesterIndex; multiSemesterOffset++) {
                                // Copy and edit course into successing semester
                                const copiedCourse = semester[courseInSemesterIndex];
                                // remove multisemester marking from copied course to not recurse loop
                                copiedCourse.multisemester = undefined;
                                delete copiedCourse.multisemester;
                                // set multi postfix in id with index
                                // copiedCourse._id = semester[courseInSemesterIndex]._id + 0.1 * multiSemesterOffset;
                                copiedCourse._id = semester[courseInSemesterIndex]._id + `-multi-${multiSemesterOffset}`;

                                // Append copied course into either same index in target semester or append at target semester end
                                if (json.curriculum[semesterIndex + multiSemesterOffset].length > courseInSemesterIndex) {
                                    json.curriculum[semesterIndex + multiSemesterOffset].splice(courseInSemesterIndex, 0, copiedCourse);
                                } else {
                                    json.curriculum[semesterIndex + multiSemesterOffset].push(copiedCourse);
                                }
                            }

                            // and also mark this first multisemester course as first multi but after copying it multiple times
                            semester[courseInSemesterIndex]._id = semester[courseInSemesterIndex]._id + '-multi-0';
                        }
                        */
                    }

                    // add modules into combined curriculum of all selected degrees
                    if (!combinedCurriculums[semesterIndex]) {
                        combinedCurriculums.push([]);
                    }
                    combinedCurriculums[semesterIndex].push(...semester);
                }
            } catch (e) {
                console.error(e);
            }
        }

        const res = await new SessionSave({
            universityId: university,
            degrees: degreeNames,
            lang: degreeDefaultData[0].lang,
            curriculum: combinedCurriculums,
            createdAt: new Date(),
            updatedAt: new Date()
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