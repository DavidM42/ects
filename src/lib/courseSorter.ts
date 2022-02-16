import type { Course } from "./types/interfaces/course";

/**
 * Sort predicate for course objects. Sorts by multi course criteria then alphabetically by short name
 */
export function courseSortPredicate(a: Course, b: Course): number {
    if (a.semesters.length > 1 || b.semesters.length > 1) {
        const semestersDifference = b.semesters.length - a.semesters.length;
        if (semestersDifference === 0) {
            return a.shortname.localeCompare(b.shortname);
        }
        return semestersDifference;
    }
    return a.shortname.localeCompare(b.shortname);
}