/**
 * Munshi Authentication Middleware
 *
 * Verifies JWT token and ensures the user has munshi role.
 * Attaches munshi object to req.munshi for use in route handlers.
 *
 * @module middleware/munshiAuth
 */

const jwt = require("jsonwebtoken");
const Munshi = require("../models/Munshi");
const { JWT_CONFIG, ERROR_MESSAGES } = require("../utils/constants");

const munshiAuth = async (req, res, next) => {
  try {
    // Extract token
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      console.warn("[Munshi Auth] No token provided");
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.AUTH_REQUIRED,
      });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env[JWT_CONFIG.SECRET_ENV_VAR] || JWT_CONFIG.FALLBACK_SECRET
    );

    // 🔴 ONLY allow munshi
    if (decoded.role !== "munshi") {
      console.warn(
        `[Munshi Auth] Access denied for role: ${decoded.role}, IP: ${req.ip}`
      );
      return res.status(403).json({
        success: false,
        message: "Munshi access only",
      });
    }

    // Fetch munshi from DB
    const munshi = await Munshi.findById(decoded.id)
      .select("-password")
      .lean();

    if (!munshi) {
      console.warn(
        `[Munshi Auth] Munshi not found for ID: ${decoded.id}, IP: ${req.ip}`
      );
      return res.status(401).json({
        success: false,
        message: "Munshi not found",
      });
    }

    // Check active
    if (!munshi.isActive) {
      console.warn(
        `[Munshi Auth] Inactive account: ${munshi.email}, IP: ${req.ip}`
      );
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.ACCOUNT_INACTIVE,
      });
    }

    // Attach to request
    req.munshi = munshi;
    req.hostel = munshi.hostel;

    // Debug log
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[Munshi Auth] Authenticated: ${munshi.email} (${munshi.hostel})`
      );
    }

    next();
  } catch (error) {
    // JWT errors
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      console.warn(
        `[Munshi Auth] Token error: ${error.name}, IP: ${req.ip}`
      );
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_TOKEN,
      });
    }

    console.error("[Munshi Auth] Error:", error);
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    });
  }
};

module.exports = munshiAuth;