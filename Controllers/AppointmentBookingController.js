import Booking from "../Models/AppointmentBookingModel.js";
import Therapist from "../Models/therapist/TherapistsModel.js";
import User from "../Models/user/UserModel.js"; // if needed for notifications

// 🔔 (Placeholder) Utility: Send alert/notification to therapist
const notifyTherapist = async (therapist, booking) => {
  // Example: Email, push notification, or WebSocket event
  console.log(
    `🔔 Notify Therapist (${therapist.email}) - New Booking from ${booking.user.name}`
  );
};

// ✅ Create a new booking
export const createBooking = async (req, res) => {
  try {
    const {
      therapistId,
      userId,
      session,
      notes,
      price,
      currency,
    } = req.body;

    // Check therapist exists & approved
    const therapist = await Therapist.findById(therapistId);
    if (!therapist || !therapist.isApproved) {
      return res
        .status(404)
        .json({ message: "Therapist not found or not approved" });
    }

    // Optional: Check user exists (if you want to populate later)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create booking
    const booking = new Booking({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      therapist: {
        id: therapist._id,
        name: therapist.name,
        email: therapist.email,
      },
      session,
      notes,
      price,
      currency,
    });

    await booking.save();

    // 🔔 Notify therapist
    await notifyTherapist(therapist, booking);

    res
      .status(201)
      .json({ message: "Booking created successfully", booking });
  } catch (err) {
    console.error("Error creating booking:", err.message);
    res
      .status(500)
      .json({ message: "Failed to create booking", error: err.message });
  }
};

// ✅ Get all bookings (admin use-case)
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .sort({ createdAt: -1 });
    res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    console.error("Error fetching bookings:", err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch bookings", error: err.message });
  }
};

// ✅ Get bookings by User
export const getBookingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const bookings = await Booking.find({ "user.id": userId })
      .sort({ "session.date": 1 });
    res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    console.error("Error fetching user bookings:", err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch user bookings", error: err.message });
  }
};

// ✅ Get bookings by Therapist
export const getBookingsByTherapist = async (req, res) => {
  try {
    const { therapistId } = req.params;
    const bookings = await Booking.find({ "therapist.id": therapistId })
      .sort({ "session.date": 1 });
    res.status(200).json({ count: bookings.length, bookings });
  } catch (err) {
    console.error("Error fetching therapist bookings:", err.message);
    res
      .status(500)
      .json({ message: "Failed to fetch therapist bookings", error: err.message });
  }
};

// ✅ Therapist updates booking status (Confirm / Reject)
export const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, cancelledBy } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (!["Confirmed", "Cancelled", "Completed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    booking.status = status;

    if (status === "Cancelled") {
      booking.cancelledAt = new Date();
      booking.cancelledBy = cancelledBy || "Therapist";
    }

    await booking.save();

    res.status(200).json({ message: "Booking status updated", booking });
  } catch (err) {
    console.error("Error updating booking status:", err.message);
    res
      .status(500)
      .json({ message: "Failed to update booking", error: err.message });
  }
};

// ✅ Get booking by Appointment ID
export const getBookingById = async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const booking = await Booking.findById(appointmentId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.status(200).json({ booking });
  } catch (err) {
    console.error("Error fetching booking by ID:", err.message);
    res.status(500).json({ message: "Failed to fetch booking", error: err.message });
  }
};
