import type { Course } from "./course";

export interface DegreeDefault {
    degrees: string[],
    lang: string,
    curriculum: Course[]
};