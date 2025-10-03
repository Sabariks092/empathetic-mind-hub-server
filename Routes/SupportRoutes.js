import express from "express";
import { createDonation, getDonations } from "../Controllers/DonationController.js";
import { createPartnership, getPartnerships } from "../Controllers/CorporatePartnershipController.js";
import  {authMiddleware} from '../middlewares/authMiddleware.js'
import { createVolunteer, getVolunteers } from "../Controllers/VolunteerController.js";

const router = express.Router();


// ✅ Donation Routes
router.post("/donate", createDonation);
router.get("/donations",authMiddleware, getDonations);

// ✅ Partnership Routes
router.post("/partnership", createPartnership);
router.get("/partnerships",authMiddleware, getPartnerships); 


// ✅ Public route (form submission)
router.post("/volunteer", createVolunteer);
router.get("/volunteers", authMiddleware, getVolunteers);

export default router;
