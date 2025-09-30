import mongoose, { Schema } from 'mongoose';


const BrandSchema = new mongoose.Schema({

    name: {
        type: String,
    },
    code: {
        type: String,
    }
});


BrandSchema.set('toJSON', {
    virtuals: false,
    versionKey: false
})



export const BrandModel = mongoose.model('Brand', BrandSchema);

