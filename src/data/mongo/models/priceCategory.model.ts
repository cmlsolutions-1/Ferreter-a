import mongoose, { Schema } from 'mongoose';


const priceCategorySchema = new mongoose.Schema({
    code: {
        type: String,
        required: [true, 'Code is required'],
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
});


priceCategorySchema.set('toJSON', {
    versionKey: false
})



export const PriceCategoryModel = mongoose.model('PriceCategory', priceCategorySchema);

