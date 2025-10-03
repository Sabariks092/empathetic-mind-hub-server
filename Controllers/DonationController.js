import Donation from "../Models/DonationModel.js";

// ✅ Create Donation
export const createDonation = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email ) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const donation = await Donation.create({ name, email, message });

    res.status(201).json({
      success: true,
      message: "Thanks For Showing Intrest to Support Us!, Our Team Will Quickly Reach About The Next Steps",
      donation,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get All Donations (Admin only)
export const getDonations = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied: Admins only" });
    }

    const donations = await Donation.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
