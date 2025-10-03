import Partnership from "../Models/CorporatePartnerashipModel.js";

// ✅ Create Partnership
export const createPartnership = async (req, res) => {
  try {
    const {
      companyName,
      contactPerson,
      contactEmail,
      contactPhone,
      companySize,
      budgetRange,
      interestAreas,
      message,
    } = req.body;

    if (!companyName || !contactPerson || !contactEmail || !contactPhone || !companySize || !message) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const attachment = req.file ? req.file.path : null;

    const partnership = await Partnership.create({
      companyName,
      contactPerson,
      contactEmail,
      contactPhone,
      companySize,
      budgetRange,
      interestAreas,
      message,
      attachment,
    });

    res.status(201).json({
      success: true,
      message: "Partnership inquiry submitted successfully",
      partnership,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ✅ Get All Partnerships (Admin only)
export const getPartnerships = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied: Admins only" });
    }

    const partnerships = await Partnership.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: partnerships.length,
      partnerships,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
