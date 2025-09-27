import express from "express";
import {
  getChats,
  getOrCreateChat,
  getMessages,
  sendMessage,
} from "../Controllers/ChatController.js";

const router = express.Router();

// Get all chats for a user
router.get("/user/:userId", getChats);

// Get or create chat between user and therapist
router.post("/get-or-create", getOrCreateChat);

// Get all messages for a chat
router.get("/:chatId/messages", getMessages);

// Send message
router.post("/send", sendMessage);

export default router;
