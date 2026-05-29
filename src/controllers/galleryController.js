const Gallery = require('../models/Gallery');
const { uploadFile, deleteFile } = require('../services/cloudinaryService');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS, STATUS } = require('../constants');

/**
 * Create Gallery Item
 * POST /api/galleries
 */
const createGalleryItem = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Gallery item title is required.');
  }

  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Gallery image file is required.');
  }

  const image = await uploadFile(req.file);

  const galleryItem = await Gallery.create({
    title,
    image,
  });

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, galleryItem, 'Gallery item created successfully.'));
});

/**
 * Get All Gallery Items (Paginated, Searchable & Filterable)
 * GET /api/galleries
 */
const getGalleryItems = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  if (req.query.search) {
    query.title = { $regex: req.query.search, $options: 'i' };
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  const total = await Gallery.countDocuments(query);
  const items = await Gallery.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, items, 'Gallery items fetched successfully.', {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    })
  );
});

/**
 * Get Single Gallery Item
 * GET /api/galleries/:id
 */
const getGalleryItemById = asyncHandler(async (req, res) => {
  const item = await Gallery.findOne({ _id: req.params.id, isDeleted: false });
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Gallery item not found.');
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, item, 'Gallery item fetched successfully.'));
});

/**
 * Update Gallery Item
 * PUT /api/galleries/:id
 */
const updateGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.findOne({ _id: req.params.id, isDeleted: false });
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Gallery item not found.');
  }

  const { title, status } = req.body;

  if (title !== undefined) item.title = title;
  if (status !== undefined) item.status = status;

  if (req.file) {
    const oldImage = item.image;
    item.image = await uploadFile(req.file);
    if (oldImage) {
      deleteFile(oldImage);
    }
  }

  await item.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, item, 'Gallery item updated successfully.'));
});

/**
 * Soft Delete Gallery Item
 * DELETE /api/galleries/:id
 */
const deleteGalleryItem = asyncHandler(async (req, res) => {
  const item = await Gallery.findOne({ _id: req.params.id, isDeleted: false });
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Gallery item not found.');
  }

  item.isDeleted = true;
  item.deletedAt = new Date();
  await item.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, {}, 'Gallery item deleted successfully.'));
});

/**
 * Toggle Gallery Status
 * PATCH /api/galleries/:id/toggle-status
 */
const toggleGalleryStatus = asyncHandler(async (req, res) => {
  const item = await Gallery.findOne({ _id: req.params.id, isDeleted: false });
  if (!item) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Gallery item not found.');
  }

  item.status = item.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
  await item.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, item, `Gallery item status toggled to ${item.status}.`));
});

module.exports = {
  createGalleryItem,
  getGalleryItems,
  getGalleryItemById,
  updateGalleryItem,
  deleteGalleryItem,
  toggleGalleryStatus,
};
