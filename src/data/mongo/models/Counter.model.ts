import mongoose, { Schema } from 'mongoose';

const counterSchema = new Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 }
});

export const CounterModel = mongoose.model("Counter", counterSchema);