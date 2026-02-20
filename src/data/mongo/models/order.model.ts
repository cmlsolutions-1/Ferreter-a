import mongoose, { Schema } from 'mongoose';
import { CounterModel } from './Counter.model';

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

    orderNumber: {
        type: String,
        unique: true
    },

    subTotal: {
        type: Number,
    },
    tax: {
        type: Number,
    },
    total: {
        type: Number,
    },
    addres: {
        type: String,
        required: false,
        default: ""
    },
    discounts: { type: Number },
    isPaid: {
        type: Boolean
    },
    isCanceled: {

        type: Boolean,
        required: false,
        default: true
    },

    reasonCancellation : {
        type: String,
        required: false,
        default: ""
    },
    paymendDate: {
        type: Date,
    },
    syscafeOrder : {
        type: String,
        default: ""
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
    offers: [appliedOfferSchema], 
});


orderSchema.set('toJSON', {
    virtuals: true,
    versionKey: false
    // transform: function (doc, ret, options) {
    //     delete ret._id;
    // },
});

orderSchema.pre("save", async function (next) {
  if (this.orderNumber) return next();

  const counter = await CounterModel.findOneAndUpdate(
    { name: "order" },
    { $inc: { value: 1 } },
    { upsert: true, new: true }
  );

  const numero = counter.value.toString().padStart(6, "0");
  this.orderNumber = `PE-${numero}`;

  next();
});


export const OrderModel = mongoose.model('Order', orderSchema);

