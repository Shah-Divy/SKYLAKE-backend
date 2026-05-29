const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');
const { HTTP_STATUS } = require('../constants');
const { getSecret } = require('../utils/cryptoHelper');
const Admin = require('../models/Admin');
const asyncHandler = require('../utils/asyncHandler');

const protectAdmin = asyncHandler(async (req, res, next) => {
  let token;

  // Read Authorization header bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    // Also support cookies as fallback
    token = req.cookies.token;
  }

  if (!token) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access denied. Administrator token is missing.');
  }

  try {
    const secret = getSecret();

    // Verify token using hardcoded algorithms to avoid algorithm injection bypasses (e.g. none)
    const decoded = jwt.verify(token, secret, { algorithms: ['HS256'] });

    // Fetch matching admin from DB
    const admin = await Admin.findOne({ _id: decoded.id, isDeleted: false });
    if (!admin) {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access denied. Admin account not found or deactivated.');
    }

    // Attach admin profile to request
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Session expired. Please log in again.');
    }
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Access denied. Invalid or corrupted token signature.');
  }
});

module.exports = {
  protectAdmin,
};
