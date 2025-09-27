import mongoose from "mongoose";

const ReplySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    profileImage: { type: String }, // new field
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { _id: true }
);

const CommentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    profileImage: { type: String }, // new field
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [ReplySchema],
  },
  { _id: true }
);

const savedPostSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: "CommunityPost" },
    savedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    forum: { type: String, default: "general" },
    tags: [String],

    author: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, default: "Anonymous" },
      profileImage: {type:String}
    },

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    savedBy: [savedPostSchema],
    comments: [CommentSchema],

    reports: [
      {
        tag: String,
        other: String,
        reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("CommunityPost", PostSchema);
