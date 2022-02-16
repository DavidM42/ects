import { Schema } from "mongoose";

export interface UniversityOptionInterface {
    degreeCollectionKey: string,
    fullNames: {
        [key: string]: string
    }
}

export const universityOptionSchema = new Schema({
    degreeCollectionKey: String,
    fullNames: {
        de: String,
        en: String
    },
});