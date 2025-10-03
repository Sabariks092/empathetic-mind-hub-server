import express from "express";
import {
  loginAdmin,
  getPendingTherapists,
  approveTherapist,
  rejectTherapist,
  getApprovedTherapists,
  deleteTherapistById,
  deleteUserById,

} from "../Controllers/AdminController.js";
import { authMiddleware,requireRole } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ------------------ AUTH ------------------
router.post("/login", loginAdmin);

// ------------------ THERAPIST APPROVAL FLOW ------------------
router.get("/therapists/pending", getPendingTherapists);
router.put("/therapists/approve/:therapistId", approveTherapist);
router.put("/therapists/reject/:therapistId", rejectTherapist);
router.get("/therapists/approved", getApprovedTherapists);
router.delete("/therapists/:therapistId/remove",authMiddleware,requireRole('admin'), deleteTherapistById);

// ------------------- user ---------------------
router.delete("/user/:userId/remove",authMiddleware,requireRole('admin'), deleteUserById);



export default router;
