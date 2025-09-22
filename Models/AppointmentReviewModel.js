import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    appointmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Appointment",
      required: true,
    },
    appointmentMode: {
      type: String,
      enum: ["Online", "Offline"],
      default: "Offlinex",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: { type: String, required: true },
    userMail: { type: String, required: true },

    therapistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Therapist",
      required: true,
    },
    therapistName: { type: String, required: true },
    therapistMail: { type: String, required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    reviewText: { type: String, required: true },
    reviewDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Review = mongoose.model("bookings-Review", reviewSchema);
export default Review;
