import mongoose, { Schema } from 'mongoose';


const imageSchema = new mongoose.Schema({

    idCloud: {
        type: String,
        required: [true, 'Id is required'],
        unique: true
    },
    url: {
        type: String,
        required: [true, 'URL is required'],
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
});


imageSchema.set('toJSON', {
    virtuals: true,
    versionKey: false
    // transform: function (doc, ret, options) {
    //     delete ret._id;
    // },
})



export const ImageModel = mongoose.model('Image', imageSchema);

