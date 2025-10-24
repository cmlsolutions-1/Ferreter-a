import mongoose, { Schema } from 'mongoose';


const citySchema = new mongoose.Schema({

    department: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    }
});


citySchema.set('toJSON', {
    virtuals: true,
    versionKey: false
    // transform: function (doc, ret, options) {
    //     delete ret._id;
    // },
})



export const CityModel = mongoose.model('City', citySchema);

