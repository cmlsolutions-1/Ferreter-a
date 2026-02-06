import mongoose from "mongoose";


const SyncControlSchema = new mongoose.Schema({
  key: { type: String, unique: true, required: true },
  dateValue: { type: Date },
}, { timestamps: true });

export const SyncControlModel = mongoose.model("SyncControl", SyncControlSchema);