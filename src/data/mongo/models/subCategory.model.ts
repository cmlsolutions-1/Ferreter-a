import mongoose, { Schema } from 'mongoose';


const SubcategorySchema = new mongoose.Schema({

    name: {
        type: String,

    },
    code: {
        type: String,
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

