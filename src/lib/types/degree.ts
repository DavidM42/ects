export interface Course {
    /**String representation of mongodb auto generated object id, also needed for drag and drop identification */
    _id: string,

    fullname: string,
    shortname: string,
    customname?: string,
    ects: number,

    /**Possible relation to something e.g. maths type, computer science or psychology themed,... */
    relation?: {
        name: string,
        /**Color to show relation with in UI (expected hex code leading with # e.g. #333) */
        color: string
    },

    // TODO standardize typing which options exist
    // but maybe can not be predicted and not important
    types?: string[],

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

export interface Degree {
    _id: string,
    degree: string,
    lang: string,
    curriculum: [
        Course[]
    ]
}