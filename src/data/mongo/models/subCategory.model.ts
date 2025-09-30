import mongoose, { Schema } from 'mongoose';


const SubcategorySchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Name is required'],
    },
    idCategory: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    }


});


SubcategorySchema.set('toJSON', {
    virtuals: false,
    versionKey: false
    // transform: function (doc, ret, options) {
    //     delete ret._id;
    // },
})



export const SubCategoryModel = mongoose.model('SubCategory', SubcategorySchema);

