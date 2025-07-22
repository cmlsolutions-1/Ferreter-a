import mongoose, { Schema } from 'mongoose';


const containerSchema = new mongoose.Schema({

    id: {

        type: String,
        required: [true, 'Id is required'],
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    Date: {
        type: Date,
        default: Date.now,
        required: [true, 'Date is required']
    },
    state: {
        type: String,
        enum : ['Active', 'Inactive'],
        default : 'Active'
    }
});


containerSchema.set('toJSON', {
    virtuals: true,
    versionKey: false
    // transform: function (doc, ret, options) {
    //     delete ret._id;
    // },
})



export const ContainerModel = mongoose.model('Container', containerSchema);

