const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * Middleware to verify admin access
 * - Expects valid JWT in Authorization header
 * - Verifies token and checks if user has admin role
 * - Attaches user to req.user if authorized
 * - Returns 401 for invalid/expired tokens
 * - Returns 403 for non-admin users
 */
module.exports = async function admin(req, res, next) {
  try {
    const token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    if (!token.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const tokenValue = token.replace("Bearer ", "");

    const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token verification failed" });
  }
};
