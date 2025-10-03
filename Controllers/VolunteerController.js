import Volunteer from "../Models/VolunteerModel.js";

// ✅ Create Volunteer Application
export const createVolunteer = async (req, res) => {
  try {
    const { name, email, phone, experience, motivation, availability } = req.body;

    if (!name || !email || !phone || !motivation || !availability) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const volunteer = await Volunteer.create({
      name,
      email,
      phone,
      experience,
      motivation,
      availability,
    });

    res.status(201).json({
      success: true,
      message: "Volunteer application submitted successfully",
      volunteer,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get All Volunteers (Admin Only)
export const getVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: volunteers.length,
      volunteers,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
