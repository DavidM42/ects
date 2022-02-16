import { Schema } from 'mongoose';

import { courseSchema } from './course';

export const sessionSaveSchema = new Schema({
    // TODO sort here in same order as in SaveData interface
    universityId: String,
    degrees: [String],
    lang: String,
    createdAt: Date,
    updatedAt: Date,

    /** Number of semesters shown in grid */
    semesters: Number,

    curriculum: [courseSchema]
});


/* Failed attempts but found better way
// Duplicate the ID field.
Id tomfoolery needed thx https://stackoverflow.com/a/14048580
// sessionSaveSchema.virtual('id').get(function(){
//     return this._id.toHexString();
// });

// // Ensure virtual fields are serialised.
// sessionSaveSchema.set('toJSON', {
//     virtuals: true
// });


// not really needed to disable auto indexing for now
// and do work to manually index
// , { autoIndex: false });
*/