import Therapist from "../Models/therapist/TherapistsModel.js";
import Admin from "../Models/AdminModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// ------------------ ADMIN LOGIN ------------------
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

  const token = jwt.sign(
  { id: admin._id, role: "admin" },
  process.env.JWT_KEY,
  { expiresIn: "7d" } );

   res.json({
  token,
  role: "admin",
  user: {  
    _id: admin._id,
    name: admin.name,
    email: admin.email,
  },
});

  } catch (err) {
    console.error("Error logging in admin:", err.message);
    res.status(500).json({ message: "Failed to login admin", error: err.message });
  }
};

// ----------------- GET ALL PENDING THERAPISTS -----------------
export const getPendingTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.find({
      $or: [{ isApproved: false }, { "updateRequests.status": "pending" }],
    });
    res.status(200).json({ therapists });
  } catch (err) {
    console.error("Error fetching pending therapists:", err.message);
    res.status(500).json({ message: "Error fetching pending therapists", error: err.message });
  }
};

// ----------------- APPROVE THERAPIST ACCOUNT -----------------
export const approveTherapist = async (req, res) => {
  try {
    const { therapistId } = req.params;

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) return res.status(404).json({ message: "Therapist not found" });

    // Apply pending update requests safely
    if (therapist.updateRequests && therapist.updateRequests.length > 0) {
      therapist.updateRequests.forEach((request) => {
        if (request.status === "pending") {
          if (request.newValue === undefined || request.newValue === null) {
            // Reject invalid requests automatically
            request.status = "rejected";
            request.reviewedAt = new Date();
          } else {
            // Apply valid updates
            const keys = request.field.split(".");
            let obj = therapist;
            for (let i = 0; i < keys.length - 1; i++) {
              if (!obj[keys[i]]) obj[keys[i]] = {};
              obj = obj[keys[i]];
            }
            obj[keys[keys.length - 1]] = request.newValue;

            request.status = "approved";
            request.reviewedAt = new Date();
          }
        }
      });
    }

    // Approve therapist account
    therapist.isApproved = true;
    await therapist.save();

    res.status(200).json({
      message: "Therapist account approved and all valid pending updates applied",
      therapist,
    });
  } catch (err) {
    console.error("Error approving therapist:", err.message);
    res.status(500).json({ message: "Failed to approve therapist", error: err.message });
  }
};

// ----------------- REJECT THERAPIST ACCOUNT -----------------
export const rejectTherapist = async (req, res) => {
  try {
    const { therapistId } = req.params;

    const therapist = await Therapist.findByIdAndDelete(therapistId);
    if (!therapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    res.status(200).json({ message: "Therapist account rejected & deleted" });
  } catch (err) {
    console.error("Error rejecting therapist:", err.message);
    res.status(500).json({ message: "Failed to reject therapist", error: err.message });
  }
};

// ----------------- GET APPROVED THERAPISTS -----------------
export const getApprovedTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.find({ isApproved: true }, "-password");
    res.status(200).json({ count: therapists.length, therapists });
  } catch (err) {
    console.error("Error fetching approved therapists:", err.message);
    res.status(500).json({ message: "Failed to fetch approved therapists", error: err.message });
  }
};

// ----------------- APPROVE SINGLE UPDATE REQUEST -----------------
export const approveUpdateRequest = async (req, res) => {
  try {
    const { therapistId, requestId } = req.params;

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) return res.status(404).json({ message: "Therapist not found" });

    const request = therapist.updateRequests.id(requestId);
    if (!request) return res.status(404).json({ message: "Update request not found" });

    if (request.newValue === undefined || request.newValue === null) {
      request.status = "rejected";
      request.reviewedAt = new Date();
    } else {
      const keys = request.field.split(".");
      let obj = therapist;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!obj[keys[i]]) obj[keys[i]] = {};
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = request.newValue;

      request.status = "approved";
      request.reviewedAt = new Date();
    }

    await therapist.save();
    res.status(200).json({ message: "Update request processed", request });
  } catch (err) {
    console.error("Error processing update request:", err.message);
    res.status(500).json({ message: "Failed to process update request", error: err.message });
  }
};

// ----------------- REJECT SINGLE UPDATE REQUEST -----------------
export const rejectUpdateRequest = async (req, res) => {
  try {
    const { therapistId, requestId } = req.params;

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) return res.status(404).json({ message: "Therapist not found" });

    const request = therapist.updateRequests.id(requestId);
    if (!request) return res.status(404).json({ message: "Update request not found" });

    request.status = "rejected";
    request.reviewedAt = new Date();

    await therapist.save();
    res.status(200).json({ message: "Update request rejected", request });
  } catch (err) {
    console.error("Error rejecting update request:", err.message);
    res.status(500).json({ message: "Failed to reject update request", error: err.message });
  }
};
