import mongoose, { Schema } from 'mongoose';


const departmentSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Name is required'],
    },
});


departmentSchema.set('toJSON', {
    virtuals: true,
    versionKey: false
})



export const DepartmentModel = mongoose.model('Department', departmentSchema);

