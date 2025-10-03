import Review from "../Models/AppointmentReviewModel.js";
import Therapist from "../Models/therapist/TherapistsModel.js";

// Create Review & Update Therapist Average Rating
export const createReview = async (req, res) => {
  try {
    const { therapistId, rating, comment, userId } = req.body;

    // Save new review
    const review = new Review({ therapist: therapistId, rating, comment, user: userId });
    await review.save();

    // Calculate new average rating for therapist
    const reviews = await Review.find({ therapist: therapistId });
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    // Update therapist rating field
    await Therapist.findByIdAndUpdate(therapistId, { rating: avgRating.toFixed(1) });

    res.status(201).json({
      message: "Review saved successfully",
      review,
      averageRating: avgRating.toFixed(1),
    });
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
