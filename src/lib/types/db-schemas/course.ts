import * as mongoose from 'mongoose';

export const courseSchema = new mongoose.Schema(
    // course array in every semester{
    {
        /** Array of semesters indexed by 0 this course is taken in */
        semesters: [Number],

        fullname: String,
        shortname: String,
        // optional
        customname: String,
        ects: Number,

        /** Optional multisemester property that defines how many semester successors this course has. Treated as 1 semester if not set */
        multisemester: Number,

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
    }
);