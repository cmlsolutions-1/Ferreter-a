import mongoose, { Schema } from 'mongoose';


const offerProductSchema = new mongoose.Schema({

    id: {
        type: String,
        required: [true, 'Id is required'],
        unique: true
    },
    idOffer: {
        type: Schema.Types.ObjectId,
        ref: 'Offer',
        required: [true, 'Id offer is required'],
    },

    idProduct: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    }


});


offerProductSchema.set('toJSON', {
    virtuals: true,
    versionKey: false
    // transform: function (doc, ret, options) {
    //     delete ret._id;
    // },
})



export const offerProductModel = mongoose.model('OfferProduct', offerProductSchema);

