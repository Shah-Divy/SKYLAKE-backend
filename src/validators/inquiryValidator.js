const { body } = require('express-validator');

const createInquiryValidator = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .isString()
    .trim()
    .isLength({ min: 7, max: 20 })
    .withMessage('Phone number must be between 7 and 20 characters'),
  body('message')
    .notEmpty()
    .withMessage('Message content is required')
    .isString()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters')
];

module.exports = {
  createInquiryValidator,
};
