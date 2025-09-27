import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  createPost,
  getPosts,
  getPostById,
  getPostsByAuthor,
  likePost,
  addComment,
  replyToComment,
  likeComment,
  reportPost,
  deletePost,
  getForums,
  likeReply,
  deleteComment,
  deleteReply,
  getSavedPostsByUser,
  toggleSavePost,
} from "../Controllers/CommunityPostConteoller.js";

const router = express.Router();

// Posts
router.post("/", authMiddleware, createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.get("/author/:authorId", getPostsByAuthor);
router.delete("/:id", authMiddleware, deletePost);

// Likes / Saves
router.post("/:id/like", authMiddleware, likePost);

// ----------------- SAVE -----------------
router.put("/:id/save", authMiddleware, toggleSavePost);
router.get("/user/saved-posts/:userId", authMiddleware, getSavedPostsByUser);

// Comments
    router.post("/:id/comments", authMiddleware, addComment);
    router.delete("/:postId/comments/:commentId", authMiddleware, deleteComment);
    router.post("/:id/comments/:commentId/replies", authMiddleware, replyToComment);
    router.delete("/:postId/comments/:commentId/replies/:replyId", authMiddleware, deleteReply);

// Comment like
router.post("/:id/comments/:commentId/like", authMiddleware, likeComment);

// Reply like
router.post(
  "/:id/comments/:commentId/replies/:replyId/like",
  authMiddleware,
  likeReply
);


// Reports
router.post("/:id/report", authMiddleware, reportPost);

// Forums
router.get("/forums", getForums);

export default router;
