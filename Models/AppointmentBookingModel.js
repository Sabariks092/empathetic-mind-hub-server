import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  label: { type: String, required: true },
});

const bookingSchema = new mongoose.Schema(
  {
    user: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    therapist: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Therapist", required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    session: {
      consultationMode: {
        type: String,
        enum: ["Online", "Offline"],
        required: true,
      },
      date: { type: Date, required: true },
      timeSlots: [timeSlotSchema],
      startLabel: { type: String, required: true },
      endLabel: { type: String, required: true },
      durationMinutes: { type: Number, default: 60 },
    },
    notes: { type: String },

    // Workflow
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
      default: "Pending",
    },
    cancelledAt: { type: Date },
    cancelledBy: { type: String, enum: ["User", "Therapist", "Admin"] },
    rescheduledFrom: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },

    // Payment (optional now, but future-proof)
    price: { type: Number },
    currency: { type: String, default: "INR" },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    transactionId: { type: String },

    // Notifications
    reminderSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Booking", bookingSchema);
