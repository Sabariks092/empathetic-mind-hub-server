import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Models/user/UserModel.js";
import Therapist from "../Models/therapist/TherapistsModel.js";
import Admin from "../Models/AdminModel.js";
import dotenv from "dotenv";

dotenv.config();

// ✅ Use the same env key everywhere
const JWT_SECRET = process.env.JWT_KEY;
console.log("JWT_SECRET loaded:", JWT_SECRET);

// ✅ Helper function for generating tokens
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, JWT_SECRET);
};

// ----------------- USER -----------------
export const signupUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    console.log("Signup request for user:", email);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });

    await newUser.save();
    console.log("User saved to DB:", newUser._id);

    const token = generateToken(newUser._id, "user");

    res.status(201).json({
      message: "User registered successfully",
      token,
      role: "user",
      user: { _id: newUser._id, name: newUser.name, email: newUser.email },
    });
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken(user._id, "user");

    res.status(200).json({
      message: "Login successful",
      token,
      role: "user",
      user: { _id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

// ----------------- Update User -----------------

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error.message);
    res.status(500).json({ message: "Update failed", error: error.message });
  }
};


// ----------------- Get me-----------------

export const getMe = async (req, res) => {
  try {
    let account;

    if (req.user.role === "admin") {
      account = await Admin.findById(req.user.id).select("-password");
    } else if (req.user.role === "therapist") {
      account = await Therapist.findById(req.user.id).select("-password");
    } else {
      account = await User.findById(req.user.id).select("-password");
    }

    if (!account) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      role: req.user.role,
      user: account,   // ✅ always "user"
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch user",
      error: err.message,
    });
  }
};
