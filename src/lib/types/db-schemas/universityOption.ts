import { Schema } from "mongoose";

export const universityOptionSchema = new Schema({
    degreeCollectionKey: String,
    fullNames: {
        de: String,
        en: String
    },
});