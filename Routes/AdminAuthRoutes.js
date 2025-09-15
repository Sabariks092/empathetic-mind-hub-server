import express from "express";
import {
  loginAdmin,
  getPendingTherapists,
  approveTherapist,
  rejectTherapist,
  getApprovedTherapists,

} from "../Controllers/AdminController.js";

const router = express.Router();

// ------------------ AUTH ------------------
router.post("/login", loginAdmin);

// ------------------ THERAPIST APPROVAL FLOW ------------------
router.get("/therapists/pending", getPendingTherapists);
router.put("/therapists/approve/:therapistId", approveTherapist);
router.put("/therapists/reject/:therapistId", rejectTherapist);
router.get("/therapists/approved", getApprovedTherapists);


export default router;
