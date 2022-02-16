import { writable } from 'svelte/store';

// used by semester.svelte ---> bundle with it?

/** Semesters this course is in before dragging started */
export const beforeDragSemesters = writable<number[]>();

/** Semster in which the course drag started */
export const dragStartSemester = writable<number>();

/** Semsters in which the course drag produced changes */
export const dragAffectedSemesters = writable<number[]>();