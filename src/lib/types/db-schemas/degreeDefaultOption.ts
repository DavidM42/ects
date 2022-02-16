import { Schema } from "mongoose";

import { courseSchema } from "./course";

export const degreeOptionSchema = new Schema({
    degree: String,
    lang: String,
    ects: Number,

    curriculum: [courseSchema]
});