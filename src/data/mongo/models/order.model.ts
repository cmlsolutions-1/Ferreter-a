import mongoose, { Schema } from 'mongoose';


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
    }
});


orderSchema.set('toJSON', {
    virtuals: true,
    versionKey: false
    // transform: function (doc, ret, options) {
    //     delete ret._id;
    // },
})


export const OrderModel = mongoose.model('Order', orderSchema);

