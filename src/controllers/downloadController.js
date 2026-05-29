const Download = require('../models/Download');
const { uploadFile, deleteFile } = require('../services/cloudinaryService');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS, STATUS } = require('../constants');

/**
 * Create Downloadable Resource
 * POST /api/downloads
 */
const createDownload = asyncHandler(async (req, res) => {
  const { title, description, videoLink } = req.body;

  if (!title) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Resource title is required.');
  }

  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'ZIP archive file is required.');
  }

  const zipFile = await uploadFile(req.file);

  const download = await Download.create({
    title,
    zipFile,
    description: description || '',
    videoLink: videoLink || '',
  });

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, download, 'Downloadable resource created successfully.'));
});

/**
 * Get All Downloadable Resources (Paginated, Searchable & Filterable)
 * GET /api/downloads
 */
const getDownloads = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  const total = await Download.countDocuments(query);
  const downloads = await Download.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, downloads, 'Downloadable resources fetched successfully.', {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    })
  );
});

/**
 * Get Single Downloadable Resource
 * GET /api/downloads/:id
 */
const getDownloadById = asyncHandler(async (req, res) => {
  const download = await Download.findOne({ _id: req.params.id, isDeleted: false });
  if (!download) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Downloadable resource not found.');
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, download, 'Downloadable resource fetched successfully.'));
});

/**
 * Update Downloadable Resource
 * PUT /api/downloads/:id
 */
const updateDownload = asyncHandler(async (req, res) => {
  const download = await Download.findOne({ _id: req.params.id, isDeleted: false });
  if (!download) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Downloadable resource not found.');
  }

  const { title, description, videoLink, status } = req.body;

  if (title !== undefined) download.title = title;
  if (description !== undefined) download.description = description;
  if (videoLink !== undefined) download.videoLink = videoLink;
  if (status !== undefined) download.status = status;

  if (req.file) {
    const oldZip = download.zipFile;
    download.zipFile = await uploadFile(req.file);
    if (oldZip) {
      deleteFile(oldZip);
    }
  }

  await download.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, download, 'Downloadable resource updated successfully.'));
});

/**
 * Soft Delete Downloadable Resource
 * DELETE /api/downloads/:id
 */
const deleteDownload = asyncHandler(async (req, res) => {
  const download = await Download.findOne({ _id: req.params.id, isDeleted: false });
  if (!download) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Downloadable resource not found.');
  }

  download.isDeleted = true;
  download.deletedAt = new Date();
  await download.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, {}, 'Downloadable resource deleted successfully.'));
});

/**
 * Toggle Downloadable Resource Status
 * PATCH /api/downloads/:id/toggle-status
 */
const toggleDownloadStatus = asyncHandler(async (req, res) => {
  const download = await Download.findOne({ _id: req.params.id, isDeleted: false });
  if (!download) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Downloadable resource not found.');
  }

  download.status = download.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
  await download.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, download, `Resource status toggled to ${download.status}.`));
});

module.exports = {
  createDownload,
  getDownloads,
  getDownloadById,
  updateDownload,
  deleteDownload,
  toggleDownloadStatus,
};
