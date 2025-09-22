// authMiddleware.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_KEY; // ✅ match AuthController

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, role }
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};


export const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user?.role !== role) {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient role" });
    }
    next();
  };
};
