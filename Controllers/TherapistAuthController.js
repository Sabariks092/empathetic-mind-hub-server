import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Models/user/UserModel.js";
import Therapist from "../Models/therapist/TherapistsModel.js";
import dotenv from "dotenv";

dotenv.config();

// ✅ Use the same env key everywhere
const JWT_SECRET = process.env.JWT_KEY;
console.log("JWT_SECRET loaded:", JWT_SECRET);

// ✅ Helper function for generating tokens
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET);
};

// ----------------- THERAPIST -----------------
export const signupTherapist = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      
    } = req.body;

    console.log("Signup request for therapist:", email);

    const existingTherapist = await Therapist.findOne({ email });
    if (existingTherapist) {
      return res.status(400).json({ message: "Therapist already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTherapist = new Therapist({
      name,
      email,
      password: hashedPassword,
      isApproved: false,
    });

    await newTherapist.save();
    console.log("Therapist saved to DB:", newTherapist._id);

    const token = generateToken(newTherapist._id, "therapist");

    res.status(201).json({
      message: "Therapist registered successfully",
      token,
      role: "therapist",
      user: { _id: newTherapist._id, name: newTherapist.name, email: newTherapist.email },
    });
  } catch (error) {
    console.error("Therapist signup error:", error.message);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

export const loginTherapist = async (req, res) => {
  try {
    const { email, password } = req.body;
    const therapist = await Therapist.findOne({ email });
    if (!therapist) return res.status(404).json({ message: "Therapist not found" });

    const isMatch = await bcrypt.compare(password, therapist.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(therapist._id, "therapist");

    res.status(200).json({
      message: "Login successful",
      token,
      role: "therapist",
      user: { _id: therapist._id, name: therapist.name, email: therapist.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// ----------------- UPDATE THERAPIST -----------------
export const updateTherapist = async (req, res) => {
  try {
    const { id } = req.user; // therapist ID from token
    const updates = req.body;

    const therapist = await Therapist.findById(id);
    if (!therapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    // Block sensitive fields
    const disallowed = ["email", "password", "role", "isApproved", "_id"];

    const updateRequests = [];

    for (let key of Object.keys(updates)) {
      if (disallowed.includes(key)) continue;

      // 🔹 Consultation mode + nested fields
      if (key === "consultationMode") {
        if (
          therapist.consultationMode !== updates.consultationMode &&
          updates.consultationMode != null
        ) {
          updateRequests.push({
            field: "consultationMode",
            oldValue: therapist.consultationMode,
            newValue: updates.consultationMode,
            status: "pending",
            requestedAt: new Date(),
          });
        }

        if (
          (updates.consultationMode === "Online" ||
            updates.consultationMode === "Both") &&
          updates.onlineDetails
        ) {
          for (let subKey of Object.keys(updates.onlineDetails)) {
            if (
              therapist.onlineDetails?.[subKey] !==
                updates.onlineDetails[subKey] &&
              updates.onlineDetails[subKey] != null
            ) {
              updateRequests.push({
                field: `onlineDetails.${subKey}`,
                oldValue: therapist.onlineDetails?.[subKey],
                newValue: updates.onlineDetails[subKey],
                status: "pending",
                requestedAt: new Date(),
              });
            }
          }
        }

        if (
          (updates.consultationMode === "Offline" ||
            updates.consultationMode === "Both") &&
          updates.offlineDetails
        ) {
          for (let subKey of Object.keys(updates.offlineDetails)) {
            if (
              therapist.offlineDetails?.[subKey] !==
                updates.offlineDetails[subKey] &&
              updates.offlineDetails[subKey] != null
            ) {
              updateRequests.push({
                field: `offlineDetails.${subKey}`,
                oldValue: therapist.offlineDetails?.[subKey],
                newValue: updates.offlineDetails[subKey],
                status: "pending",
                requestedAt: new Date(),
              });
            }
          }
        }
      }

      // 🔹 Certificates (array of objects)
      else if (key === "certificates") {
        const oldData = JSON.stringify(therapist.certificates || []);
        const newData = JSON.stringify(updates.certificates || []);
        if (oldData !== newData) {
          updateRequests.push({
            field: "certificates",
            oldValue: therapist.certificates,
            newValue: updates.certificates,
            status: "pending",
            requestedAt: new Date(),
          });
        }
      }

      // 🔹 Licenses (array of objects)
      else if (key === "licenses") {
        const oldData = JSON.stringify(therapist.licenses || []);
        const newData = JSON.stringify(updates.licenses || []);
        if (oldData !== newData) {
          updateRequests.push({
            field: "licenses",
            oldValue: therapist.licenses,
            newValue: updates.licenses,
            status: "pending",
            requestedAt: new Date(),
          });
        }
      }

      // 🔹 Location object
      else if (key === "location") {
        const oldData = JSON.stringify(therapist.location || {});
        const newData = JSON.stringify(updates.location || {});
        if (oldData !== newData) {
          updateRequests.push({
            field: "location",
            oldValue: therapist.location,
            newValue: updates.location,
            status: "pending",
            requestedAt: new Date(),
          });
        }
      }

      // 🔹 Normal fields
      else if (therapist[key] !== updates[key] && updates[key] != null) {
        updateRequests.push({
          field: key,
          oldValue: therapist[key],
          newValue: updates[key],
          status: "pending",
          requestedAt: new Date(),
        });
      }
    }

    if (updateRequests.length === 0) {
      return res.status(400).json({ message: "No valid changes to update" });
    }

    therapist.updateRequests.push(...updateRequests);
    await therapist.save();

    res.status(200).json({
      message: "Profile update requests submitted. Waiting for admin approval.",
      pendingRequests: updateRequests,
    });
  } catch (err) {
    console.error("Update error:", err.message);
    res
      .status(500)
      .json({ message: "Failed to update profile", error: err.message });
  }
};

// ----------------- GET ALL THERAPISTS -----------------
export const getAllTherapists = async (req, res) => {
  try {
    const therapists = await Therapist.find().select("-password");
    res.status(200).json({ count: therapists.length, therapists });
  } catch (err) {
    console.error("Fetch therapists error:", err.message);
    res.status(500).json({ message: "Failed to fetch therapists", error: err.message });
  }
};

// ----------------- GET SINGLE THERAPIST BY ID -----------------
export const getTherapistById = async (req, res) => {
  try {
    const { id } = req.params;

    const therapist = await Therapist.findById(id).select("-password");
    if (!therapist) {
      return res.status(404).json({ message: "Therapist not found" });
    }

    // Wrap in an object
    res.status(200).json({ therapist });
  } catch (err) {
    console.error("Fetch therapist by ID error:", err.message);
    res.status(500).json({ message: "Failed to fetch therapist", error: err.message });
  }
};


// ----------------- ADMIN: APPROVE THERAPIST UPDATE REQUEST -----------------
export const approveTherapistUpdate = async (req, res) => {
  try {
    const { therapistId, requestId } = req.params;

    const therapist = await Therapist.findById(therapistId);
    if (!therapist) return res.status(404).json({ message: "Therapist not found" });

    const request = therapist.updateRequests.id(requestId);
    if (!request || request.status !== "pending") {
      return res.status(400).json({ message: "No pending request found" });
    }

    // Update main field
    therapist[request.field] = request.newValue;
    request.status = "approved";
    request.reviewedAt = new Date();

    await therapist.save();

    res.status(200).json({ message: "Update approved and applied", request });
  } catch (err) {
    res.status(500).json({ message: "Failed to approve update", error: err.message });
  }
};
