import mongoose, { Schema } from 'mongoose';

const emailSchema = new Schema({
    EmailAddres: { type: String, required: true },
    IsPrincipal: { type: Boolean, required: true },
}, { _id: false });

const phoneSchema = new Schema({
    NumberPhone: { type: String, required: true },
    IsPrincipal: { type: Boolean, required: true },
    Indicative: { type: String, required: true },
}, { _id: false });



const userSchema = new mongoose.Schema({

    id: {
        type: String,
        required: [true, 'Id is required'],
        unique: true,
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    lastName: {
        type: String,
        required: [true, 'Title is required']
    },
    email: [emailSchema],

    emailVerified: {
        type: Boolean,
        default: false,
    },
    phone: [phoneSchema],
    addres: {
        type: [String],
        required: true
    },
    city: {
        type: Schema.Types.ObjectId,
        ref: 'City',
        required: true
    },

    password: {
        type: String,
        required: [true, 'Password is required']
    },
    role: {
        type: String,
        enum: ['Admin', 'SalesPerson', 'Client'],
        required: [true, 'Role is required'],
    },

    salesPerson: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    clients: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    priceCategory: {
        type: Schema.Types.ObjectId,
        ref: 'PriceCategory',
    },
    state: {
        type: String,
        enum : ['Active', 'Inactive'],
        default : 'Active'
    },
    emailValidated: {
        type: Boolean,
        default: false
    }

});


userSchema.set('toJSON', {
    virtuals: true,
    versionKey: false
    // transform: function (doc, ret, options) {
    //     delete ret._id;
    // },
})


export const UserModel = mongoose.model('User', userSchema);

