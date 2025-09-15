import express from "express";
import {
  createBooking,
  getAllBookings,
  getBookingsByUser,
  getBookingsByTherapist,
  updateBookingStatus,
  getBookingById,
} from "../Controllers/AppointmentBookingController.js";

const router = express.Router();

/**
 * Base: /api/bookings
 */

// ✅ Create a booking (user)
router.post("/", createBooking);

// ✅ Get ALL bookings (admin use-case)
router.get("/", getAllBookings);

// ✅ Get all bookings of a user
router.get("/user/:userId", getBookingsByUser);

// ✅ Get all bookings of a therapist
router.get("/therapist/:therapistId", getBookingsByTherapist);

// ✅ Get all bookings of a therapist
router.get("/:appointmentId", getBookingById);

// ✅ Update booking status (therapist/admin)
router.put("/:bookingId/status", updateBookingStatus);

export default router;
