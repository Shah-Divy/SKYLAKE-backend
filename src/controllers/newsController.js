const News = require('../models/News');
const { uploadFile, deleteFile } = require('../services/cloudinaryService');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS, STATUS } = require('../constants');

/**
 * Create News Article
 * POST /api/news
 */
const createNews = asyncHandler(async (req, res) => {
  const { title, content, publishDate } = req.body;

  if (!title || !content) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'News title and content are required.');
  }

  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'News cover image file is required.');
  }

  const image = await uploadFile(req.file);

  const news = await News.create({
    title,
    content,
    image,
    publishDate: publishDate ? new Date(publishDate) : new Date(),
  });

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, news, 'News article created successfully.'));
});

/**
 * Get All News Articles (Paginated, Searchable & Filterable)
 * GET /api/news
 */
const getNews = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { content: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  const total = await News.countDocuments(query);
  const newsList = await News.find(query)
    .sort({ publishDate: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, newsList, 'News articles fetched successfully.', {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    })
  );
});

/**
 * Get Single News Article
 * GET /api/news/:id
 */
const getNewsById = asyncHandler(async (req, res) => {
  const news = await News.findOne({ _id: req.params.id, isDeleted: false });
  if (!news) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'News article not found.');
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, news, 'News article fetched successfully.'));
});

/**
 * Update News Article
 * PUT /api/news/:id
 */
const updateNews = asyncHandler(async (req, res) => {
  const news = await News.findOne({ _id: req.params.id, isDeleted: false });
  if (!news) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'News article not found.');
  }

  const { title, content, publishDate, status } = req.body;

  if (title !== undefined) news.title = title;
  if (content !== undefined) news.content = content;
  if (publishDate !== undefined) news.publishDate = new Date(publishDate);
  if (status !== undefined) news.status = status;

  if (req.file) {
    const oldImage = news.image;
    news.image = await uploadFile(req.file);
    if (oldImage) {
      deleteFile(oldImage);
    }
  }

  await news.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, news, 'News article updated successfully.'));
});

/**
 * Soft Delete News Article
 * DELETE /api/news/:id
 */
const deleteNews = asyncHandler(async (req, res) => {
  const news = await News.findOne({ _id: req.params.id, isDeleted: false });
  if (!news) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'News article not found.');
  }

  news.isDeleted = true;
  news.deletedAt = new Date();
  await news.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, {}, 'News article deleted successfully.'));
});

/**
 * Toggle News Status
 * PATCH /api/news/:id/toggle-status
 */
const toggleNewsStatus = asyncHandler(async (req, res) => {
  const news = await News.findOne({ _id: req.params.id, isDeleted: false });
  if (!news) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'News article not found.');
  }

  news.status = news.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
  await news.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, news, `News status toggled to ${news.status}.`));
});

module.exports = {
  createNews,
  getNews,
  getNewsById,
  updateNews,
  deleteNews,
  toggleNewsStatus,
};
