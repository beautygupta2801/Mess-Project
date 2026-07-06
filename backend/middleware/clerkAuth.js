/**
 * Clerk Authentication Middleware
 *
 * Verifies JWT token and ensures the user has clerk role.
 * Attaches clerk object to req.clerk for use in route handlers.
 *
 * @module middleware/clerkAuth
 */

const jwt = require("jsonwebtoken");
const Clerk = require("../models/Clerk");
const { JWT_CONFIG, ERROR_MESSAGES } = require("../utils/constants");

const clerkAuth = async (req, res, next) => {
  try {
    // Extract token
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.warn("[Clerk Auth] No token provided");
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.AUTH_REQUIRED || "Authentication required",
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env[JWT_CONFIG.SECRET_ENV_VAR] || JWT_CONFIG.FALLBACK_SECRET
    );

    // 🔴 IMPORTANT: Check role = clerk
    if (decoded.role !== "clerk") {
      console.warn(
        `[Clerk Auth] Access denied for role: ${decoded.role}, IP: ${req.ip}`
      );
      return res.status(403).json({
        success: false,
        message: "Clerk access only",
      });
    }

    // Fetch clerk from DB
    const clerk = await Clerk.findById(decoded.id)
      .select("-password")
      .lean();

    if (!clerk) {
      console.warn(
        `[Clerk Auth] Clerk not found for ID: ${decoded.id}, IP: ${req.ip}`
      );
      return res.status(401).json({
        success: false,
        message: "Clerk not found",
      });
    }

    // Check active status
    if (!clerk.isActive) {
      console.warn(
        `[Clerk Auth] Inactive account: ${clerk.email}, IP: ${req.ip}`
      );
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.ACCOUNT_INACTIVE || "Account inactive",
      });
    }

    // Attach to request
    req.clerk = clerk;
    req.hostel = clerk.hostel; // useful for filtering

    // Debug log
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[Clerk Auth] Authenticated: ${clerk.email} (${clerk.hostel})`
      );
    }

    next();
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      console.warn(
        `[Clerk Auth] Token error: ${error.name}, IP: ${req.ip}`
      );
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN || "Invalid token",
      });
    }

    console.error("[Clerk Auth] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

module.exports = clerkAuth;