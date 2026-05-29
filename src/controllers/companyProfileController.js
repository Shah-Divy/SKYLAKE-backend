const CompanyProfile = require('../models/CompanyProfile');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS } = require('../constants');

/**
 * Get Company Profile
 * GET /api/company-profile
 */
const getCompanyProfile = asyncHandler(async (req, res) => {
  let profile = await CompanyProfile.findOne();

  // Seed default if not created yet
  if (!profile) {
    profile = await CompanyProfile.create({
      companyProfile: 'Default Company Profile. Please update through the admin dashboard.',
      mission: 'Default Mission statement.',
      vision: 'Default Vision statement.',
      achievements: 'Default achievements and milestones.',
    });
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, profile, 'Company profile retrieved successfully.'));
});

/**
 * Update Company Profile
 * PUT /api/company-profile
 */
const updateCompanyProfile = asyncHandler(async (req, res) => {
  const { companyProfile, mission, vision, achievements } = req.body;

  if (!companyProfile || !mission || !vision) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Company profile text, mission, and vision are required.');
  }

  let profile = await CompanyProfile.findOne();

  if (!profile) {
    profile = new CompanyProfile();
  }

  profile.companyProfile = companyProfile;
  profile.mission = mission;
  profile.vision = vision;
  profile.achievements = achievements || '';

  await profile.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, profile, 'Company profile updated successfully.'));
});

module.exports = {
  getCompanyProfile,
  updateCompanyProfile,
};
