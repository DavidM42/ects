/**
 * What types this course includes, Vorlesung, Seminar, Übung, Tutorium and Praktikum.
 * (Lecture, Seminar, Exercise, Tutoring and Practical course)
 */
export interface CourseTypes {
    V: number | boolean,
    S: number | boolean,
    UE: number | boolean,
    T: number | boolean,
    P: number | boolean,
}

export interface Course {
    /**
     * Manually incremented id for course.
     * Decimals shows multisemester modules (max of 9 semesters for now (if more needed make it .01)).
     * Needed for drag and drop identification */
    _id: string,

    /** Array of semesters indexed by 0 this course is taken in */
    semesters: number[],

    fullname: string,
    shortname: string,
    customname?: string,
    ects: number,

    /** Optional multisemester property that defines how many semester successors this course has. Treated as 1 semester if not set */
    multisemester?: number,

    /** Optional for multisemester modules to know how far into multi semester they are */
    lastMultiSemesterId: number,

    /**Possible relation to something e.g. maths type, computer science or psychology themed,... */
    relation?: {
        name: string,
        /**Color to show relation with in UI (expected hex code leading with # e.g. #333) */
        color: string
    },

    types?: CourseTypes,

    state: {
        options: {
            /** Whether course can be passed */
            passable: boolean,
            /** Whether course can receive grade as result */
            gradeable: boolean,
        },

        result?: {
            grade: number,
            passed: boolean,
            /** If passed/grade values in result are only a forecast */
            forecast: boolean
        }
    }
}