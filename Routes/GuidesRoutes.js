import express from "express";
import * as guideCtrl from "../Controllers/GuidesController.js";
import { authMiddleware, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// CREATE & FETCH
router.post("/", authMiddleware, requireRole("therapist"), guideCtrl.createGuide);
router.get("/therapist/:id", authMiddleware, requireRole("therapist"), guideCtrl.getTherapistGuides);
router.get("/", guideCtrl.getApprovedGuides);
router.get("/unapproved", authMiddleware, requireRole("admin"), guideCtrl.getUnapprovedGuides);
router.get("/:id", guideCtrl.getGuideById);

// ADMIN ACTIONS
router.put("/admin/approve/:id", authMiddleware, requireRole("admin"), guideCtrl.approveGuide);
router.delete("/admin/delete/:id", authMiddleware, requireRole("admin"), guideCtrl.deleteGuide);

// USER INTERACTIONS
router.post("/:id/comments", authMiddleware, guideCtrl.addComment);
router.get("/:id/comments", guideCtrl.listComments);
router.put("/:id/like", authMiddleware, guideCtrl.toggleLike);
router.put("/:id/save", authMiddleware, guideCtrl.toggleSave);
router.get("/user/saved/:userId", authMiddleware, guideCtrl.getSavedGuidesByUser);

// DELETE (author or admin)
router.delete("/:id", authMiddleware, guideCtrl.deleteGuide);

export default router;
