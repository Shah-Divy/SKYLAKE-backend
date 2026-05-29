const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path || err.param]: err.msg }));

  throw new ApiError(
    HTTP_STATUS.BAD_REQUEST,
    'Validation failed. Please verify input fields.',
    extractedErrors
  );
};

module.exports = validate;
