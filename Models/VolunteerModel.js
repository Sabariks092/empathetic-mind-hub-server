import mongoose from "mongoose";

const VolunteerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
    },
    motivation: {
      type: String,
      required: true,
    },
    availability: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Volunteer", VolunteerSchema);
