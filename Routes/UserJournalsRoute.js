// routes/journalRoutes.js
import express from "express";
import { createJournal, getUserJournals } from "../Controllers/UserJournalController.js";

const router = express.Router();

// Base: /api/journals
router.post("/:userId", createJournal);  
router.get("/:userId", getUserJournals);  

export default router;
