const { body } = require('express-validator');

const productValidator = [
  body('productName')
    .notEmpty()
    .withMessage('Product name is required')
    .isString()
    .trim(),
  body('modelNumber')
    .notEmpty()
    .withMessage('Model number is required')
    .isString()
    .trim(),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isNumeric()
    .withMessage('Price must be a positive number')
    .toFloat()
    .custom(value => {
      if (value < 0) throw new Error('Price cannot be negative');
      return true;
    }),
  body('discountedPrice')
    .optional({ nullable: true, checkFalsy: true })
    .isNumeric()
    .withMessage('Discounted price must be a number')
    .toFloat()
    .custom((value, { req }) => {
      if (value !== undefined && value !== null && value < 0) {
        throw new Error('Discounted price cannot be negative');
      }
      if (value !== undefined && value !== null && value > parseFloat(req.body.price)) {
        throw new Error('Discounted price must be less than or equal to the original price');
      }
      return true;
    }),
  body('brandId')
    .notEmpty()
    .withMessage('Brand ID is required')
    .isMongoId()
    .withMessage('Invalid Brand ID reference format'),
  body('categoryId')
    .notEmpty()
    .withMessage('Category ID is required')
    .isMongoId()
    .withMessage('Invalid Category ID reference format'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be active or inactive')
];

module.exports = {
  productValidator,
};
