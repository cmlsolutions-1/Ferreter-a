import mongoose, { Schema } from 'mongoose';


const citySchema = new mongoose.Schema({

    id: {

        type: String,
        required: [true, 'Id is required'],
        unique: true
    },
    country: {
        type: Schema.Types.ObjectId,
        ref: 'Country',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    postalCode: {
        type: String,
        required: [true, 'PostalCode is required'],
    },
});


citySchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret, options) {
        delete ret._id;
    },
})



export const CityModel = mongoose.model('City', citySchema);

