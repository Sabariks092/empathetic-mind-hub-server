import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    profileImage: { type: String },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },

    // Additional profile fields
    age: { type: Number },
    address: { type: String },
    area: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
