import mongoose, { Schema } from 'mongoose';


const ContainerProductSchema = new mongoose.Schema({

    id: {
        type: String,
        required: [true, 'Id is required'],
        unique: true
    },
    idProduct: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    idContainer: {
        type: Schema.Types.ObjectId,
        ref: 'Container',
        required: true
    }
});


ContainerProductSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret, options) {
        delete ret._id;
    },
})



export const SubCategoryModel = mongoose.model('SubCategory', ContainerProductSchema);