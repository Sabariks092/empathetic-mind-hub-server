import mongoose from "mongoose";
const { Schema, model } = mongoose;

const RegistrationSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  email: String,
  phone: String,
  numPeople: { type: Number, default: 1 },
  status: { type: String, enum: ["registered", "cancelled"], default: "registered" },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

RegistrationSchema.index({ event: 1, user: 1 }, { unique: true }); // one registration per user per event

export default model("events-Registration", RegistrationSchema);
