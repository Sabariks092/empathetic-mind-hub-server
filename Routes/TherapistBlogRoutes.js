import express from "express";
import * as blogCtrl from "../Controllers/TherapistBlogController.js";
import { authMiddleware, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * BLOG CREATION & FETCH
 */
router.post("/", authMiddleware, requireRole("therapist"), blogCtrl.createBlog);
router.get("/therapist/:id", authMiddleware, requireRole("therapist"), blogCtrl.getTherapistBlogs);
router.get("/", blogCtrl.getApprovedBlogs);
router.get("/unapproved", authMiddleware, requireRole("admin"), blogCtrl.getUnapprovedBlogs);
router.get("/:id", blogCtrl.getBlogById);

/**
 * ADMIN ACTIONS
 */
router.put("/admin/approve/:id", authMiddleware, requireRole("admin"), blogCtrl.approveBlog);
router.delete("/admin/delete/:id", authMiddleware, requireRole("admin"), blogCtrl.deleteBlog);

/**
 * USER INTERACTIONS (COMMENTS, LIKES, SAVES)
 */
router.post("/:id/comments", authMiddleware, blogCtrl.addComment);
router.get("/:id/comments", blogCtrl.listComments);
router.put("/:id/like", authMiddleware, blogCtrl.toggleLike);
router.put("/:id/save", authMiddleware, blogCtrl.toggleSave);
router.get("/user/saved-blogs/:userId", authMiddleware, blogCtrl.getSavedBlogsByUser);

/**
 * DELETE BLOG (author or admin)
 */
router.delete("/:id", authMiddleware, blogCtrl.deleteBlog);

export default router;
