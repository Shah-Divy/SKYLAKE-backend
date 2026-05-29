const ApiError = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants');

const errorHandler = (err, req, res, next) => {
  let error = err;

  // 1. If not an instance of ApiError, transform it into one
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode ||
      (error.name === 'ValidationError' || error.name === 'CastError'
        ? HTTP_STATUS.BAD_REQUEST
        : HTTP_STATUS.INTERNAL_SERVER_ERROR);

    const message = error.message || 'An unexpected error occurred';
    error = new ApiError(statusCode, message, error.errors || [], err.stack);
  }

  // 2. Format localized MongoDB/Mongoose errors safely without leaking internal structures
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error.statusCode = HTTP_STATUS.CONFLICT;
    error.message = `Duplicate field value entered: '${field}'. Please use another value.`;
  }

  // 3. Handle Multer file upload errors
  if (err.name === 'MulterError') {
    error.statusCode = HTTP_STATUS.BAD_REQUEST;
    error.message = `File upload error: ${err.message}`;
  }

  // Log detailed info for developer diagnostics (exclude logs of user input password/token if any)
  console.error(`[Error Trace] Path: ${req.originalUrl} | Method: ${req.method} | Status: ${error.statusCode} | Message: ${error.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(error.stack);
  }

  // Send uniform response (mask stack traces in production)
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors || [],
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  });
};

module.exports = errorHandler;
