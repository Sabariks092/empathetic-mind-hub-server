import mongoose from "mongoose";

const { Schema } = mongoose;

// Comment Schema
const CommentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    name: { type: String },
    email: { type: String },
    profileImage: { type: String },
    blogId: { type: Schema.Types.ObjectId, ref: "Therapists-Blog" },
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
    blogId: { type: Schema.Types.ObjectId, ref: "Therapists-Blog" },
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
    blogId: { type: Schema.Types.ObjectId, ref: "Therapists-Blog" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ✅ Reference Link Schema (NEW)
const ReferenceLinkSchema = new Schema(
  {
    title: { type: String, required: true },
    link: { type: String, required: true },
  },
  { _id: false }
);

// Blog Schema
const BlogSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true },
    content: { type: String, required: true },

    // ✅ Updated to store array of objects
    referenceLinks: { type: [ReferenceLinkSchema], default: [] },

    // Images
    bannerImage: { type: String },
    supportedImage1: { type: String },
    supportedImage2: { type: String },

    // Categories
    categories: { type: [String], default: [] },

    // Approval workflow
    isApproved: { type: Boolean, default: false },
    approvedBy: {
      id: { type: Schema.Types.ObjectId, ref: "User" },
      name: { type: String },
    },
    approvedAt: { type: Date },

    // Author info
    author: {
      id: { type: Schema.Types.ObjectId, required: true, ref: "User" },
      name: { type: String, required: true },
    },

    // Relations
    comments: { type: [CommentSchema], default: [] },
    likes: { type: [LikeSchema], default: [] },
    saves: { type: [SaveSchema], default: [] },
  },
  { timestamps: true }
);

// Indexes
BlogSchema.index({ isApproved: 1, createdAt: -1 });
BlogSchema.index({ "author.id": 1 });

const Blog = mongoose.model("Therapists-Blog", BlogSchema);
export default Blog;
