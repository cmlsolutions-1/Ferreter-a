import mongoose from 'mongoose';


const offerSchema = new mongoose.Schema({

    id: {
        type: String,
        required: [true, 'Id is required'],
        unique: true,
    },
    percentage: {
        type: Number,
        required: [true, 'percentage is required'],
    },
    minimumQuantity: {
        type: Number,
        required: [true, 'Minimum Quantity is required']
    },
    crationDate: {
        type: Date,
        default: Date.now,
    },
    startDate: {
        type: Date,
        required: [true, "start Date is required"]
    },
    endDate: {
        type: Date,
        required: [true, "end Date is required"]
    },
    finishDate: {
        type: Date,
    },
    typePackage: {
        type: String,
        enum: ['master', 'mount'],
        required: [true, 'type package is required'],
    },
    state: {
        type: String,
        enum : ['Active', 'Inactive'],
        default : 'Active'
    },
    isAll: {
        type: Boolean,
        required: [true, 'isAll is required']
    }

});


offerSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret, options) {
        delete ret._id;
    },
})


export const OfferModel = mongoose.model('Offer', offerSchema);

