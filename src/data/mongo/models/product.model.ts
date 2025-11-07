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
        required: true,
    },
    Mount: { type: Number, required: true }
}, { _id: false });

const brandSchema = new Schema({
    code: { type: String },
    name: { type: String }
}, { _id: false });

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
    },

    subCategory: {
        type: Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
    },
    package: {
        type: [packageSchema]
    },
    stock: {
        type: Number,
        default: 0
    },
    brand: brandSchema,
    isActive: {
        type: Boolean,
        default: true
    },
    UpdateDate: {
        type: Date,
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

