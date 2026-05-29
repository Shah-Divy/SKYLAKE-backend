const Admin = require('../models/Admin');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { getSecret } = require('../utils/cryptoHelper');
const { HTTP_STATUS } = require('../constants');
const jwt = require('jsonwebtoken');

// Generate JWT token helper
const generateToken = (id) => {
  const secret = getSecret();
  return jwt.sign({ id }, secret, {
    algorithm: 'HS256',
    expiresIn: process.env.JWT_EXPIRE || '24h',
  });
};

/**
 * Admin Login
 * POST /api/admin/login
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Email and password are required.');
  }

  // Find admin user in DB (excluding soft deleted accounts)
  const admin = await Admin.findOne({ email, isDeleted: false });
  if (!admin) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password credentials.');
  }

  // Compare passwords securely
  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid email or password credentials.');
  }

  // Generate JWT token
  const token = generateToken(admin._id);

  // Hardened cookies following secure web guidelines
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 Hours
  };

  // Set secure hardened cookie
  res.cookie('__Secure-token', token, cookieOptions);

  return res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        {
          admin: {
            id: admin._id,
            email: admin.email,
            createdAt: admin.createdAt,
          },
          token,
        },
        'Admin authentication successful.'
      )
    );
});

/**
 * Admin Profile
 * GET /api/admin/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  // req.admin is populated by authMiddleware
  return res
    .status(HTTP_STATUS.OK)
    .json(
      new ApiResponse(
        HTTP_STATUS.OK,
        {
          id: req.admin._id,
          email: req.admin.email,
          createdAt: req.admin.createdAt,
        },
        'Admin profile retrieved successfully.'
      )
    );
});

/**
 * Admin Logout
 * POST /api/admin/logout
 */
const logout = asyncHandler(async (req, res) => {
  // Clear cookie with exact matching flags
  res.clearCookie('__Secure-token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, {}, 'Admin logged out successfully.'));
});

module.exports = {
  login,
  getProfile,
  logout,
};
