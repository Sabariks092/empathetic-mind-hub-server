import Review from "../Models/AppointmentReviewModel.js";

// ✅ Create a new review
export const createReview = async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json({ message: "Review saved successfully", review });
  } catch (error) {
    console.error("Error saving review:", error);
    res.status(500).json({ message: "Error saving review", error });
  }
};

// ✅ Get reviews by Appointment ID
export const getReviewsByAppointment = async (req, res) => {
  try {
    const reviews = await Review.find({ appointmentId: req.params.appointmentId });
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error });
  }
};

// ✅ Get reviews by Therapist ID
export const getReviewsByTherapist = async (req, res) => {
  try {
    const reviews = await Review.find({ therapistId: req.params.therapistId });
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error });
  }
};

// ✅ Get reviews by User ID
export const getReviewsByUser = async (req, res) => {
  try {
    const reviews = await Review.find({ userId: req.params.userId });
    res.status(200).json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error });
  }
};
