import mongoose, { Schema } from 'mongoose';


const categorySchema = new mongoose.Schema({
    
    name: {
        type: String,
        required: [true, 'Name is required'],
    },
});


categorySchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret, options) {
        delete ret._id;
    },
})



export const CategoryModel = mongoose.model('Category', categorySchema);

