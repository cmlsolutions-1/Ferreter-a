import mongoose, { Schema } from 'mongoose';


const priceCategorySchema = new mongoose.Schema({

    id: {

        type: String,
        required: [true, 'Id is required'],
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
});


priceCategorySchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret, options) {
        delete ret._id;
    },
})



export const PriceCategoryModel = mongoose.model('PriceCategory', priceCategorySchema);

