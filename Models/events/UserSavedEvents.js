import mongoose from "mongoose";
const { Schema, model } = mongoose;

const SavedEventSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  savedAt: { type: Date, default: Date.now },
}, { timestamps: false });

SavedEventSchema.index({ event: 1, user: 1 }, { unique: true });

export default model("events-saved-user", SavedEventSchema);
