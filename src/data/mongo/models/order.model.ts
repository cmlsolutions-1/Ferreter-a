import mongoose, { Schema } from 'mongoose';

const appliedOfferSchema = new Schema(
  {
    offerId: { type: Schema.Types.ObjectId, ref: "Offer" },
    name: { type: String, required: true },
    percentage: { type: Number, required: true },
    typePackage: { type: String, enum: ["master", "inner"], required: true },
    minimumQuantity: { type: Number, required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product" },
  },
  { _id: false } 
);


const orderSchema = new mongoose.Schema({

    subTotal: {
        type: Number,
    },
    tax: {
        type: Number,
    },
    total: {
        type: Number,
    },
    discounts: { type: Number },
    isPaid: {
        type: Boolean
    },
    paymendDate: {
        type: Date,
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    updatedDate: {
        type: Date
    },
    idClient: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    idSalesPerson: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
      offers: [appliedOfferSchema]
});


orderSchema.set('toJSON', {
    virtuals: true,
    versionKey: false
    // transform: function (doc, ret, options) {
    //     delete ret._id;
    // },
})


export const OrderModel = mongoose.model('Order', orderSchema);

