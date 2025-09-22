import mongoose from "mongoose";
const { Schema, model } = mongoose;

// Review subdocument schema (embedded)
const ReviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
}, { _id: true }); // keep _id for each review

const EventSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  eventBanner: String,
  eventOrganizationLogo: String,
  category: String,
  price: { type: String, default: "Free" },
  venue: String,
  postedBy: String,
  facilitator: String,
  date: { type: Date, required: true },
  time: String,
  capacity: { type: String, default: 0 },
  registeredCount: { type: Number, default: 0 },
  tags: [String],

  // approval & lifecycle
  isApproved: { type: Boolean, default: false },
  status: { type: String, enum: ["pending", "approved", "cancelled"], default: "pending" },

  // optional: who created it
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: false },

  // embedded reviews
  reviews: [ReviewSchema],
}, { timestamps: true });

// Optional: ensure one review per user per event
EventSchema.index({ _id: 1, "reviews.user": 1 }, { unique: true });

export default model("Event", EventSchema);
