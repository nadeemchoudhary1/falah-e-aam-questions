const { body, validationResult } = require('express-validator');

const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 3 })
    .withMessage('Password must be at least 3 characters')
];

const validatePersonalDetails = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required'),
  body('phoneNumber')
    .matches(/^[0-9]{10}$/)
    .withMessage('Phone number must be 10 digits'),
  body('courseName')
    .trim()
    .notEmpty()
    .withMessage('Course name is required'),
  body('age')
    .isInt({ min: 15, max: 120 })
    .withMessage('Age must be between 15 and 120'),
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
];

const validateSubmission = [
  body('answers')
    .isArray()
    .withMessage('Answers must be an array'),
  body('personalDetails')
    .notEmpty()
    .withMessage('Personal details are required')
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      errors: errors.array() 
    });
  }
  next();
};

module.exports = {
  validateLogin,
  validatePersonalDetails,
  validateSubmission,
  handleValidationErrors
};
