const { body, validationResult } = require('express-validator');

// Validation rules
const subscriptionValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('mobile')
    .matches(/^\+?\d{10,15}$/)
    .withMessage('Please provide a valid mobile number (10-15 digits)'),
  
  body('location')
    .isLength({ min: 2, max: 100 })
    .trim()
    .withMessage('Location must be between 2-100 characters'),
  
  body('aqiThreshold')
    .optional()
    .isInt({ min: 0, max: 500 })
    .withMessage('AQI threshold must be between 0-500'),
  
  body('notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notification preference must be boolean'),
  
  body('notifications.sms')
    .optional()
    .isBoolean()
    .withMessage('SMS notification preference must be boolean')
];

const userRegistrationValidation = [
  body('name')
    .isLength({ min: 2, max: 50 })
    .trim()
    .withMessage('Name must be between 2-50 characters'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  
  body('mobile')
    .optional()
    .matches(/^\+?\d{10,15}$/)
    .withMessage('Please provide a valid mobile number')
];

const userLoginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Validation handler middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  
  next();
};

module.exports = {
  subscriptionValidation,
  userRegistrationValidation,
  userLoginValidation,
  handleValidationErrors
};