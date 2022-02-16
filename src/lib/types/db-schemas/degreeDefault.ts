import { Schema } from "mongoose";

import { curriculumSchema } from "./curriculum";

export const degreeOptionSchema = new Schema({
    degree: String,
    lang: String,
    ects: Number,

    curriculum: curriculumSchema
});