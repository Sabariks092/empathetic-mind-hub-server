import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoutes from './Routes/AuthRoutes.js';
import cors from 'cors';
import adminAuthRoutes from './Routes/AdminAuthRoutes.js';
import appointmentBookingRoutes from './Routes/AppointmentBookingRoutes.js';
import appointmentReviewRoutes from './Routes/AppointmentReviewRoutes.js';
import userJournalsRoutes from './Routes/UserJournalsRoute.js';


dotenv.config({ path: "./.env" });
const app = express();

app.use(cors(''));
app.use(express.json());   // <-- IMPORTANT
app.use(express.urlencoded({ extended: true })); // for form data

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminAuthRoutes)
app.use("/api/booking", appointmentBookingRoutes);
app.use("/api/reviews", appointmentReviewRoutes)
app.use("/api/journals", userJournalsRoutes)

// DB + Server
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected");
  app.listen(process.env.PORT || 5000, () => {
    console.log("🚀 Server running on port", process.env.PORT || 5000);
  });
})
.catch((err) => console.error("❌ MongoDB connection error:", err));

