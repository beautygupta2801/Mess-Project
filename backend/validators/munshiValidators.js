/**
 * Munshi Route Validators
 * 
 * Input validation middleware for munshi-related routes using express-validator.
 * These validators ensure data integrity before it reaches the controller layer.
 * 
 * @module validators/munshiValidators
 */

const { body, query, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const {
  MEAL_TYPES_ARRAY,
  MESS_OFF_STATUS,
  ORDER_LIMITS,
  PAGINATION_DEFAULTS,
  ERROR_MESSAGES,
} = require('../utils/constants');

/**
 * Middleware to check validation results and return errors if any
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({
        field: err.path || err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

// ==================== STUDENT LOOKUP VALIDATORS ====================

/**
 * Validate student lookup query parameter
 */
const validateStudentLookup = [
  query('q')
    .trim()
    .notEmpty()
    .withMessage('Search query (q) is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  handleValidationErrors,
];

// ==================== ORDER VALIDATORS ====================

/**
 * Validate order creation request
 */
const validateOrderCreation = [
  body('studentId')
    .trim()
    .notEmpty()
    .withMessage('Student ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage(ERROR_MESSAGES.INVALID_OBJECT_ID),
  
  body('items')
    .isArray()
    .withMessage('Items must be an array'),
    
  body('dietCount')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Diet count must be a non-negative integer'),

  // Custom validator: Either items array must be non-empty OR dietCount must be > 0
  body().custom((value) => {
    const hasItems = value.items && value.items.length > 0;
    const hasDiet = value.dietCount && value.dietCount > 0;
    
    if (!hasItems && !hasDiet) {
        throw new Error('Order must contain either items or a diet count');
    }
    
    if (value.items && value.items.length > ORDER_LIMITS.MAX_ITEMS) {
        throw new Error(`Cannot have more than ${ORDER_LIMITS.MAX_ITEMS} items in one order`);
    }
    
    return true;
  }),
  
  body('items.*.name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Item name must be between 1 and 100 characters'),
  
  body('items.*.price')
    .optional()
    .isNumeric()
    .withMessage('Item price must be a number')
    .custom((value) => value >= ORDER_LIMITS.MIN_ITEM_PRICE)
    .withMessage(`Item price must be at least ₹${ORDER_LIMITS.MIN_ITEM_PRICE}`)
    .custom((value) => value <= ORDER_LIMITS.MAX_ITEM_PRICE)
    .withMessage(`Item price cannot exceed ₹${ORDER_LIMITS.MAX_ITEM_PRICE}`),
  
  body('mealType')
    .optional()
    .isIn(MEAL_TYPES_ARRAY)
    .withMessage(`Meal type must be one of: ${MEAL_TYPES_ARRAY.join(', ')}`),

  handleValidationErrors,
];

// ==================== ORDERS LIST VALIDATORS ====================

/**
 * Validate orders list query parameters (pagination and filtering)
 */
const validateOrdersList = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION_DEFAULTS.MAX_PAGE_SIZE })
    .withMessage(`Limit must be between 1 and ${PAGINATION_DEFAULTS.MAX_PAGE_SIZE}`)
    .toInt(),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('from')
    .optional()
    .isISO8601()
    .withMessage('From date must be a valid ISO 8601 date'),
  
  query('to')
    .optional()
    .isISO8601()
    .withMessage('To date must be a valid ISO 8601 date'),
  
  query('studentId')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage(ERROR_MESSAGES.INVALID_OBJECT_ID),
  
  query('mealType')
    .optional()
    .isIn(MEAL_TYPES_ARRAY)
    .withMessage(`Meal type must be one of: ${MEAL_TYPES_ARRAY.join(', ')}`),
  
  handleValidationErrors,
];

// ==================== MESS-OFF REQUEST VALIDATORS ====================

/**
 * Validate mess-off requests list query parameters
 */
const validateMessOffList = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: PAGINATION_DEFAULTS.MAX_PAGE_SIZE })
    .withMessage(`Limit must be between 1 and ${PAGINATION_DEFAULTS.MAX_PAGE_SIZE}`)
    .toInt(),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
    .toInt(),
  
  query('status')
    .optional()
    .isIn([MESS_OFF_STATUS.PENDING, MESS_OFF_STATUS.APPROVED, MESS_OFF_STATUS.REJECTED])
    .withMessage(`Status must be one of: Pending, Approved, Rejected`),
  
  query('from')
    .optional()
    .isISO8601()
    .withMessage('From date must be a valid ISO 8601 date'),
  
  query('to')
    .optional()
    .isISO8601()
    .withMessage('To date must be a valid ISO 8601 date'),
  
  handleValidationErrors,
];

/**
 * Validate mess-off status update request
 */
const validateMessOffStatus = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage(ERROR_MESSAGES.INVALID_OBJECT_ID),
  
  body('status')
    .trim()
    .notEmpty()
    .withMessage('Status is required')
    .isIn([MESS_OFF_STATUS.APPROVED, MESS_OFF_STATUS.REJECTED])
    .withMessage('Status must be either Approved or Rejected'),
  
  body('rejectionReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Rejection reason cannot exceed 500 characters'),
  
  handleValidationErrors,
];

// ==================== EXPORTS ====================

module.exports = {
  validateStudentLookup,
  validateOrderCreation,
  validateOrdersList,
  validateMessOffList,
  validateMessOffStatus,
  handleValidationErrors,
};
