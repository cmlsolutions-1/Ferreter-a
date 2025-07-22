import mongoose, { Schema } from 'mongoose';


const orderItemSchema = new mongoose.Schema({

    id: {
        type: String,
        required: [true, 'Id is required'],
        unique: true
    },
    quantity: {
        type: Number,
    },
    price: {
        type: Number,
    },

    idProduct: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    idOrder: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    }
});


orderItemSchema.set('toJSON', {
    virtuals: true,
    versionKey: false
    // transform: function (doc, ret, options) {
    //     delete ret._id;
    // },
})



export const OrderItemModel = mongoose.model('OrderItem', orderItemSchema);