// routes/authRoutes.js
import express from "express";
import {  signupTherapist, loginTherapist, getMe, updateTherapist, getAllTherapists, getTherapistById } from "../Controllers/TherapistAuthController.js";
import { signupUser, loginUser } from "../Controllers/UserAuthController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { updateUser } from "../Controllers/UserAuthController.js";

const router = express.Router();

// ----------------- User Routes -----------------
router.post("/signup/user", signupUser);
router.post("/login/user", loginUser);
router.put("/user/update/:id", authMiddleware, updateUser);

// ----------------- Therapist Routes -----------------
router.post("/signup/therapist", signupTherapist);
router.post("/login/therapist", loginTherapist);
router.put("/therapist/update",authMiddleware, updateTherapist);

// Protected route
router.get("/me", authMiddleware, getMe);


//All THERAPISTS
router.get("/all-therapists", getAllTherapists)
router.get("/therapist/:id", getTherapistById)


export default router;      
