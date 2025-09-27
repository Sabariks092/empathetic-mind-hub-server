import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

// Import routes
import authRoutes from './Routes/AuthRoutes.js';
import adminAuthRoutes from './Routes/AdminAuthRoutes.js';
import appointmentBookingRoutes from './Routes/AppointmentBookingRoutes.js';
import appointmentReviewRoutes from './Routes/AppointmentReviewRoutes.js';
import userJournalsRoutes from './Routes/UserJournalsRoute.js';
import therapistBlogRoutes from './Routes/TherapistBlogRoutes.js';
import eventsRoutes from './Routes/EventRoutes.js';
import guideRoutes from './Routes/GuidesRoutes.js';
import communityPostRoutes from './Routes/CommunityPostRoutes.js';
import chatRoutes from './Routes/ChatRoutes.js'; // ✅ new chat routes

// Import models
import Message from "./Models/chat/MessageModel.js";

dotenv.config({ path: "./.env" });

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminAuthRoutes);
app.use("/api/booking", appointmentBookingRoutes);
app.use("/api/reviews", appointmentReviewRoutes);
app.use("/api/journals", userJournalsRoutes);
app.use("/api/therapist-blogs", therapistBlogRoutes);
app.use("/api/guides", guideRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/community-posts", communityPostRoutes);
app.use("/api/chats", chatRoutes); // ✅ chat API routes

// Create HTTP server for Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }, // allow any frontend origin
});

// Socket.IO logic
// Socket.IO logic
io.on("connection", (socket) => {
  console.log("⚡ New client connected:", socket.id);

  // Join a chat room
  socket.on("join_chat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat room: ${chatId}`);
  });

  // Listen for sent messages
  socket.on("send_message", async (messageData) => {
    try {
      // Save message to DB
      const message = new Message({
        chatId: messageData.chatId,
        sender: messageData.sender,
        text: messageData.text,
      });
      await message.save();

      // Build full payload (merge DB + client data)
      const payload = {
        _id: message._id,                // from MongoDB
        chatId: message.chatId,
        sender: message.sender,
        text: message.text,
        createdAt: message.createdAt,
        localMessageId: messageData.localMessageId, // 👈 keep client id
        clientId: messageData.clientId,             // 👈 unique per browser
      };

      // Emit enriched payload to everyone in the room
      io.to(messageData.chatId).emit("receive_message", payload);
    } catch (err) {
      console.error("❌ Error saving message:", err.message);
    }
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});


// MongoDB connection + server start
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");
  server.listen(process.env.PORT || 5000, () => {
    console.log("🚀 Server running on port", process.env.PORT || 5000);
  });
})
.catch((err) => console.error("❌ MongoDB connection error:", err));
