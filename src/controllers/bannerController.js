const Banner = require('../models/Banner');
const { uploadFile, deleteFile } = require('../services/cloudinaryService');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS, STATUS } = require('../constants');

/**
 * Create Banner
 * POST /api/banners
 */
const createBanner = asyncHandler(async (req, res) => {
  const { title, mediaType, ctaText, ctaUrl, order } = req.body;

  if (!title) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Banner title is required.');
  }

  // Handle uploaded file via our dual-uploader service
  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Banner media file is required.');
  }

  const mediaUrl = await uploadFile(req.file);

  const banner = await Banner.create({
    title,
    mediaType: mediaType || 'image',
    mediaUrl,
    ctaText,
    ctaUrl,
    order: order ? Number(order) : 0,
  });

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, banner, 'Banner created successfully.'));
});

/**
 * Get All Banners (Paginated, Filterable & Searchable)
 * GET /api/banners
 */
const getBanners = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Initial active non-deleted filter
  const query = { isDeleted: false };

  // Strict filters: search and status
  if (req.query.search) {
    query.title = { $regex: req.query.search, $options: 'i' };
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  // Count total matches for correct pagination output
  const total = await Banner.countDocuments(query);

  const banners = await Banner.find(query)
    .sort({ order: 1, createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      banners,
      'Banners fetched successfully.',
      {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      }
    )
  );
});

/**
 * Get Single Banner
 * GET /api/banners/:id
 */
const getBannerById = asyncHandler(async (req, res) => {
  const banner = await Banner.findOne({ _id: req.params.id, isDeleted: false });
  if (!banner) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Banner not found.');
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, banner, 'Banner fetched successfully.'));
});

/**
 * Update Banner
 * PUT /api/banners/:id
 */
const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findOne({ _id: req.params.id, isDeleted: false });
  if (!banner) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Banner not found.');
  }

  const { title, mediaType, ctaText, ctaUrl, status, order } = req.body;

  if (title !== undefined) banner.title = title;
  if (mediaType !== undefined) banner.mediaType = mediaType;
  if (ctaText !== undefined) banner.ctaText = ctaText;
  if (ctaUrl !== undefined) banner.ctaUrl = ctaUrl;
  if (status !== undefined) banner.status = status;
  if (order !== undefined) banner.order = Number(order);

  // If a new media file is uploaded, replace the old asset
  if (req.file) {
    const oldMediaUrl = banner.mediaUrl;
    banner.mediaUrl = await uploadFile(req.file);
    
    // Asynchronously delete old file from store/disk to save resources
    if (oldMediaUrl) {
      deleteFile(oldMediaUrl);
    }
  }

  await banner.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, banner, 'Banner updated successfully.'));
});

/**
 * Soft Delete Banner
 * DELETE /api/banners/:id
 */
const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findOne({ _id: req.params.id, isDeleted: false });
  if (!banner) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Banner not found.');
  }

  banner.isDeleted = true;
  banner.deletedAt = new Date();
  await banner.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, {}, 'Banner deleted successfully (soft-deleted).'));
});

/**
 * Toggle Banner Status (Active/Inactive)
 * PATCH /api/banners/:id/toggle-status
 */
const toggleBannerStatus = asyncHandler(async (req, res) => {
  const banner = await Banner.findOne({ _id: req.params.id, isDeleted: false });
  if (!banner) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Banner not found.');
  }

  banner.status = banner.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
  await banner.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, banner, `Banner status toggled to: ${banner.status}`));
});

module.exports = {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
};
