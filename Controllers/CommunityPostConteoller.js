import CommunityPost from "../Models/CommunityPostModel.js";
import mongoose from "mongoose";

// ----------------- CREATE POST -----------------
export const createPost = async (req, res) => {
  try {
    const { title, content, forum, tags, author } = req.body;

    // Validate required fields
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: "Title & content are required" });
    }

    if (!author || !author.id) {
      return res.status(400).json({ error: "Author info is required" });
    }

    const post = new CommunityPost({
      title: title.trim(),
      content: content.trim(),
      forum: forum || "general",
      tags: Array.isArray(tags) ? tags : [],
      author: {
        id: author.id,
        name: author.name || "Unknown",
        profileImage: author.profileImage || "",
      },
    });

    await post.save();
    return res.status(201).json({ post });
  } catch (err) {
    console.error("createPost error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// ----------------- FETCH POSTS -----------------
export const getPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find().sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ error: "Invalid ID" });

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });

    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getPostsByAuthor = async (req, res) => {
  try {
    const posts = await CommunityPost.find({
      "author.id": req.params.authorId,
    }).sort({ createdAt: -1 });
    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ----------------- LIKE / SAVE -----------------
export const likePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    if (post.likes.includes(req.user.id)) {
      post.likes.pull(req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const toggleSavePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const alreadySaved = post.savedBy.some(
      (s) => s.savedBy && s.savedBy.toString() === userId.toString()
    );

    if (alreadySaved) {
      post.savedBy = post.savedBy.filter(
        (s) => s.savedBy && s.savedBy.toString() !== userId.toString()
      );
    } else {
      post.savedBy.push({
        post: post._id,
        savedBy: new mongoose.Types.ObjectId(userId),
        savedAt: new Date(),
      });
    }

    await post.save();
    res.json({ saved: !alreadySaved, savedDetails: post.savedBy });
  } catch (err) {
    console.error("toggleSavePost error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// ----------------- GET ALL SAVED POSTS BY USER -----------------
export const getSavedPostsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Find posts where savedBy array contains this user
    const savedPosts = await CommunityPost.find({
      "savedBy.savedBy": userId,
    })
      .populate("author.id", "name profileImage")
      .sort({ createdAt: -1 });

    res.json(savedPosts);
  } catch (err) {
    console.error("getSavedPostsByUser error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ----------------- COMMENTS -----------------

// Add a comment
export const addComment = async (req, res) => {
  try {
    const { content, name, profileImage, userId } = req.body;

    if (!content || !userId)
      return res.status(400).json({ error: "Content & userId required" });

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const newComment = {
      userId,
      name,
      profileImage,
      content,
      likes: [],
      replies: [],
    };

    post.comments.push(newComment);
    await post.save();

    res.status(201).json(post.comments[post.comments.length - 1]);
  } catch (err) {
    console.error("addComment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Reply to a comment
export const replyToComment = async (req, res) => {
  try {
    const { content, userId, name, profileImage } = req.body;

    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const newReply = {
      userId,
      name,
      profileImage,
      content,
      likes: [],
    };

    comment.replies.push(newReply);
    await post.save();

    res.status(201).json(comment.replies[comment.replies.length - 1]);
  } catch (err) {
    console.error("replyToComment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};


// Like a comment
export const likeComment = async (req, res) => {
  try {
    const { id: postId, commentId } = req.params;
    const post = await CommunityPost.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const userId = req.user.id;

    // Initialize likes array if undefined
    if (!Array.isArray(comment.likes)) comment.likes = [];

    if (comment.likes.includes(userId)) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await post.save();
    res.json({ likes: comment.likes.length, liked: comment.likes.includes(userId) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Like a reply
export const likeReply = async (req, res) => {
  try {
    const { id: postId, commentId, replyId } = req.params;
    const post = await CommunityPost.findById(postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const reply = comment.replies.id(replyId);
    if (!reply) return res.status(404).json({ error: "Reply not found" });

    const userId = req.user.id;

    if (!Array.isArray(reply.likes)) reply.likes = [];

    if (reply.likes.includes(userId)) {
      reply.likes.pull(userId);
    } else {
      reply.likes.push(userId);
    }

    await post.save();
    res.json({ likes: reply.likes.length, liked: reply.likes.includes(userId) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    if (
      String(comment.userId) !== String(req.user.id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Remove comment from comments array
    const commentIndex = post.comments.findIndex(
      (c) => String(c._id) === String(req.params.commentId)
    );
    if (commentIndex === -1)
      return res.status(404).json({ message: "Comment not found" });

    // Remove the comment
    post.comments.splice(commentIndex, 1);
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    console.error("deleteComment error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a reply
export const deleteReply = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ error: "Reply not found" });

    if (
      String(reply.userId) !== String(req.user.id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Remove comment from comments array
    const replyIndex = comment.replies.findIndex(
      (r) => String(r._id) === String(req.params.replyId)
    );
    if (replyIndex === -1)
      return res.status(404).json({ message: "Comment not found" });

    // Remove the comment
    comment.replies.splice(replyIndex, 1);
    await post.save();

    res.status(200).json({ message: "Reply deleted successfully" });
  } catch (err) {
    console.error("deleteReply error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ----------------- REPORT -----------------
export const reportPost = async (req, res) => {
  try {
    const { tag, other } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });

    post.reports.push({ tag, other, reporter: req.user.id });
    await post.save();

    res.json({ message: "Report submitted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ----------------- DELETE -----------------
export const deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Not found" });

    if (
      post.author.id.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await post.deleteOne();
    res.json({ message: "Post deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

export const getForums = async (req, res) => {
  try {
    const forums = await CommunityPost.distinct("forum"); // all unique forum names
    res.json({ forums });
  } catch (err) {
    console.error("getForums", err);
    res.status(500).json({ error: "Server error" });
  }
};
