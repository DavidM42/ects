import { Schema } from 'mongoose';

export const sessionSaveSchema = new Schema({
    degree: String,
    lang: String,
    createdAt: Date,
    updatedAt: Date,

    curriculum: [
        // semester array
        [
            // course array in every semester{
            {
                fullname: String,
                shortname: String,
                // optional
                customname: String,
                ects: Number,
                // optional
                relation: {
                    name: String,
                    color: String
                },
                types: [String],

                state: {
                    options: {
                        passable: Boolean,
                        gradeable: Boolean,
                    },
                    // optional
                    result: {
                        grade: Number,
                        passed: Boolean,
                        forecast: Boolean
                    }
                }
            }
        ]
    ]
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