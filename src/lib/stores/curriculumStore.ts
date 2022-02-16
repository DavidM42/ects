import { writable } from "svelte/store";

import type { Course } from "$lib/types/interfaces/course";

/** Curriculum as subscribtabale store */
export const curriculum = writable<Course[]>();