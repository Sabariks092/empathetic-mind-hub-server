// routes/eventRoutes.js
import express from "express";
import * as eventCtrl from "../Controllers/EventController.js";
import { authMiddleware, requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * EVENT CREATION & FETCH
 */
router.post("/", eventCtrl.createEvent);
router.get("/approved", eventCtrl.fetchApprovedEvents);
router.get("/unapproved", authMiddleware, requireRole("admin"), eventCtrl.fetchUnapprovedEvents);
router.get("/user/hosted/:userId",authMiddleware, eventCtrl.getHostedEventsByUser);

/**
 * SAVED EVENTS
 */
router.post("/:eventId/save", authMiddleware, eventCtrl.toggleSaveEvent);
router.get("/user/saved/:userId", authMiddleware, eventCtrl.getSavedEventsByUser);

/**
 * REGISTRATIONS
 */
router.post("/:eventId/register", authMiddleware, eventCtrl.registerForEvent);
router.get("/user/registrations/:userId", authMiddleware, eventCtrl.getRegistrationsByUser);

/**
 * ADMIN ACTIONS
 */
router.put("/admin/approve/:eventId", authMiddleware, requireRole("admin"), eventCtrl.approveEvent);

/**
 * REVIEWS (only registered users can add review)
 */
router.post("/:eventId/review", authMiddleware, requireRole("user"), eventCtrl.addReview);

export default router;
