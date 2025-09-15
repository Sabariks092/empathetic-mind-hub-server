// models/Journal.js
import mongoose from "mongoose";

const journalSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    mood: {
      type: String,
      required: true,
    },
    stressLevel: {
      type: Number,
      min: 1,
      max: 10,
      required: true,
    },
    highlights: {
      type: String,
    },
    reflections: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Journal", journalSchema);
