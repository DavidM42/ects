import type { Course } from "./course";

export interface SaveData {
    _id?: string,
    universityId: string,
    degrees: string[],
    lang: string,
    curriculum: Course[],

    /** Number of semesters shown in grid */
    semesters: number
}