import express from "express";
import {
  createReview,
  getReviewsByAppointment,
  getReviewsByTherapist,
  getReviewsByUser,
} from "../Controllers/AppointmentReviewController.js";

const router = express.Router();

/**
 * Base: /api/reviews
 */

// ✅ Create review
router.post("/", createReview);

// ✅ Fetch by Appointment ID
router.get("/appointment/:appointmentId", getReviewsByAppointment);

// ✅ Fetch by Therapist ID
router.get("/therapist/:therapistId", getReviewsByTherapist);

// ✅ Fetch by User ID
router.get("/user/:userId", getReviewsByUser);

export default router;
