import mongoose, { Schema } from 'mongoose';


const StockSchema = new mongoose.Schema({
    reference: {
        type: String,
        required: [true, 'reference is required'],
    },
    store: {
        type: String,
        required: [true, 'store is required'],
    },
    mount: {
        type: Number,
        required: [true, 'mount is required'],
    },
});


StockSchema.set('toJSON', {
    virtuals: true,
    versionKey: false
    // transform: function (doc, ret, options) {
    //     delete ret._id;
    // },
})



export const StockModel = mongoose.model('Stock', StockSchema);

