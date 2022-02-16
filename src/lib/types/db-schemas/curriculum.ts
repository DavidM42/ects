import * as mongoose from 'mongoose';

export const curriculumSchema = [
    // semester array
    [
        new mongoose.Schema(
        // course array in every semester{
        {

            // _id is used as id param by dnd
            // it is very important to exist and be unique
            // is done in create university route loop
            // _id: mongoose.Types.Decimal128,
            _id: String,
            
            fullname: String,
            shortname: String,
            // optional
            customname: String,
            ects: Number,

            /** Optional multisemester property that defines how many semester successors this course has. Treated as 1 semester if not set */
            multisemester: Number,
            
            /** Optional for multisemester modules to know how far into multi semester they are */
            lastMultiSemesterId: Number,

            // optional
            relation: {
                name: String,
                color: String
            },

            /** What types this course includes, Vorlesung, Seminar, Übung, Tutorium and Praktikum */
            types: {
                V: Number || Boolean,
                S: Number || Boolean,
                UE: Number || Boolean,
                T: Number || Boolean,
                P: Number || Boolean,
            },

            state: {
                options: {
                    passable: Boolean,
                    gradeable: Boolean,
                },
                // optional
                result: {
                    grade: Number,
                    passed: Boolean,
                    forecast: Boolean
                }
            }
        }, {
            // disabling autoId for modules shema
            // manually increment every module at initial session creation
            _id: false
        })
    ]
];