const jwt = require("jsonwebtoken");
const { User } = require("../models");

/**
 * Middleware to validate JWT token and attach user to request.
 * - Expects token in `Authorization: Bearer <token>` header.
 * - Verifies token using JWT_SECRET.
 * - Attaches user to `req.user` if valid.
 * - Returns 401 with specific error messages for different failure cases:
 *   - No token provided
 *   - Invalid token format
 *   - Token verification failed
 *   - User not found
 */
const validateToken = async (req, res, next) => {
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

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token verification failed" });
  }
};

module.exports = validateToken;
