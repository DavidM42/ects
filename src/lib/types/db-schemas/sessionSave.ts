import { Schema } from 'mongoose';

import { curriculumSchema } from './curriculum';

export const sessionSaveSchema = new Schema({
    universityId: String,
    degrees: [String],
    lang: String,
    createdAt: Date,
    updatedAt: Date,

    curriculum: curriculumSchema
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