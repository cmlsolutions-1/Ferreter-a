import mongoose, { Schema } from 'mongoose';


const countrySchema = new mongoose.Schema({

    id: {
        type: String,
        required: [true, 'Id is required'],
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
});


countrySchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret, options) {
        delete ret._id;
    },
})



export const CountryModel = mongoose.model('Country', countrySchema);

