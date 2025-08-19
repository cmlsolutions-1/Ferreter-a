import mongoose, { Schema } from 'mongoose';

const priceSchema = new Schema({
    PriceCategory: { type: Schema.Types.ObjectId, ref: 'PriceCategory', required: true },
    Value: { type: Number, required: true },
    PosValue: { type: Number, required: true },
}, { _id: false });

const packageSchema = new Schema({
    typePackage: { 
        type: String, 
        enum: ['Inner', 'Master'],
        required:true ,
    },
    Mount: { type: Number, required: true }
}, { _id: false });

// const stockSchema = new Schema({
//     Store: { type: String, required: true },
//     Mount: { type: Number, required: true },
// }, { _id: false });

const productSchema = new mongoose.Schema({

    reference: {
        type: String,
        required: [true, 'Reference is required'],
        unique: true,
    },
    code: {
        type: String,
        required: [true, 'Code is required'],
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    prices: [priceSchema],
    image: {
        type: Schema.Types.ObjectId,
        ref: 'Image',
        required: true
    },

    subCategory: {
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
    },
    package: {
        type: [packageSchema]
    },
    stock : {
        type: Number
    }

});


productSchema.set('toJSON', {
    virtuals: true,
    versionKey: false
    // transform: function (doc, ret, options) {
    //     delete ret._id;
    // },
})


export const ProductModel = mongoose.model('Product', productSchema);

