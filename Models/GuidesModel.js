import mongoose from "mongoose";

const { Schema } = mongoose;

// Comment Schema
const CommentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    name: { type: String },
    email: { type: String },
    profileImage: { type: String },
    guideId: { type: Schema.Types.ObjectId, ref: "Therapist-Guide" },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// Like Schema
const LikeSchema = new Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String },
    email: { type: String },
    guideId: { type: Schema.Types.ObjectId, ref: "Therapist-Guide" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// Save Schema
const SaveSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    name: { type: String, required: true },
    email: { type: String, required: true },
    profileImage: { type: String },
    guideId: { type: Schema.Types.ObjectId, ref: "Therapist-Guide" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// Step Schema
const StepSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  referenceLink: { type: String },
});

// Guide Schema
const GuideSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    metaTitle: { type: String, default: "" },
    metaDescription: { type: String, default: "" },
    description: { type: String, required: true },
    videoLink: { type: String },
    steps: { type: [StepSchema], default: [] },

    bannerImage: { type: String },
    supportedImage1: { type: String },
    supportedImage2: { type: String },

    category: { type: String, enum: ["Video Guide", "Habitual Development Guide"], default: "Video Guide" },
    tags: { type: [String], default: [] },

    isApproved: { type: Boolean, default: false },
    approvedBy: {
      id: { type: Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
    },
    approvedAt: { type: Date },

    author: {
      id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
      name: { type: String, required: true },
    },

    comments: { type: [CommentSchema], default: [] },
    likes: { type: [LikeSchema], default: [] },
    saves: { type: [SaveSchema], default: [] },
  },
  { timestamps: true }
);

GuideSchema.index({ isApproved: 1, createdAt: -1 });
GuideSchema.index({ "author.id": 1 });

const Guide = mongoose.model("Guide", GuideSchema);
export default Guide;
