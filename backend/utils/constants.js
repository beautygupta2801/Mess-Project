/**
 * Application Constants
 * 
 * Centralized configuration values and magic numbers used throughout the application.
 * This improves maintainability and makes it easier to adjust business rules.
 * 
 * @module utils/constants
 */

// ==================== PAGINATION ====================

/**
 * Default pagination settings for list endpoints
 */
const PAGINATION_DEFAULTS = {
  /** Default number of items per page */
  PAGE_SIZE: 20,
  /** Maximum allowed items per page */
  MAX_PAGE_SIZE: 100,
  /** Minimum page number */
  MIN_PAGE: 1,
};

// ==================== ORDER LIMITS ====================

/**
 * Limits and constraints for extra orders
 */
const ORDER_LIMITS = {
  /** Minimum order amount in rupees */
  MIN_AMOUNT: 1,
  /** Maximum order amount in rupees */
  MAX_AMOUNT: 10000,
  /** Maximum number of items in a single order */
  MAX_ITEMS: 50,
  /** Minimum item price in rupees */
  MIN_ITEM_PRICE: 0,
  /** Maximum item price in rupees */
  MAX_ITEM_PRICE: 5000,
};

// ==================== MEAL TYPES ====================

/**
 * Valid meal type values
 */
const MEAL_TYPES = {
  BREAKFAST: 'breakfast',
  LUNCH: 'lunch',
  SNACKS: 'snacks',
  DINNER: 'dinner',
};

/**
 * Array of all valid meal types
 */
const MEAL_TYPES_ARRAY = Object.values(MEAL_TYPES);

// ==================== MESS-OFF STATUS ====================

/**
 * Valid mess-off request status values
 */
const MESS_OFF_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

/**
 * Array of all valid mess-off status values
 */
const MESS_OFF_STATUS_ARRAY = Object.values(MESS_OFF_STATUS);

// ==================== JWT CONFIGURATION ====================

/**
 * JWT token configuration
 */
const JWT_CONFIG = {
  /** Token expiration time */
  EXPIRY: '7d',
  /** Environment variable name for JWT secret */
  SECRET_ENV_VAR: 'JWT_SECRET',
  /** Fallback secret (should only be used in development) */
  FALLBACK_SECRET: 'your_jwt_secret_key_here',
};

// ==================== PASSWORD RESET ====================

/**
 * Password reset configuration
 */
const PASSWORD_RESET = {
  /** Token validity duration in milliseconds (10 minutes) */
  TOKEN_EXPIRY_MS: 10 * 60 * 1000,
  /** Minimum password length */
  MIN_PASSWORD_LENGTH: 6,
  /** Maximum password length */
  MAX_PASSWORD_LENGTH: 128,
};

// ==================== VALIDATION PATTERNS ====================

/**
 * Regular expression patterns for validation
 */
const VALIDATION_PATTERNS = {
  /** Email validation pattern - more permissive to allow local domains */
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  /** Indian mobile number pattern (10 digits starting with 6-9) */
  PHONE: /^[6-9]\d{9}$/,
  /** MongoDB ObjectId pattern */
  OBJECT_ID: /^[0-9a-fA-F]{24}$/,
};

// ==================== ERROR MESSAGES ====================

/**
 * Standardized error messages
 */
const ERROR_MESSAGES = {
  // Authentication
  AUTH_REQUIRED: 'Authentication required',
  INVALID_TOKEN: 'Invalid or expired token',
  ACCESS_DENIED: 'Access denied',
  ACCOUNT_INACTIVE: 'Account is inactive',
  INVALID_CREDENTIALS: 'Invalid email or password',
  
  // Validation
  INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_PASSWORD: 'Password must be at least 6 characters long',
  REQUIRED_FIELD: 'This field is required',
  INVALID_OBJECT_ID: 'Invalid ID format',
  
  // Authorization
  NOT_IN_HOSTEL: 'Resource not found in your hostel',
  MUNSHI_ONLY: 'Access denied. Munshi only.',
  
  // Server
  SERVER_ERROR: 'Server error. Please try again later.',
};

// ==================== SUCCESS MESSAGES ====================

/**
 * Standardized success messages
 */
const SUCCESS_MESSAGES = {
  ORDER_CREATED: 'Order recorded successfully',
  STATUS_UPDATED: 'Status updated successfully',
  PASSWORD_RESET_SENT: 'Password reset token has been sent to your email',
  PASSWORD_RESET_SUCCESS: 'Password has been reset successfully',
  LOGIN_SUCCESS: 'Login successful',
  REGISTRATION_SUCCESS: 'Registration successful',
};

// ==================== EXPORTS ====================

module.exports = {
  PAGINATION_DEFAULTS,
  ORDER_LIMITS,
  MEAL_TYPES,
  MEAL_TYPES_ARRAY,
  MESS_OFF_STATUS,
  MESS_OFF_STATUS_ARRAY,
  JWT_CONFIG,
  PASSWORD_RESET,
  VALIDATION_PATTERNS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
};
