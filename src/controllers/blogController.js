const Blog = require('../models/Blog');
const { uploadFile, deleteFile } = require('../services/cloudinaryService');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS, STATUS } = require('../constants');

/**
 * Create Blog Article
 * POST /api/blogs
 */
const createBlog = asyncHandler(async (req, res) => {
  const { title, content, publishDate } = req.body;

  if (!title || !content) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Blog title and content are required.');
  }

  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Blog cover image file is required.');
  }

  const image = await uploadFile(req.file);

  const blog = await Blog.create({
    title,
    content,
    image,
    publishDate: publishDate ? new Date(publishDate) : new Date(),
  });

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, blog, 'Blog article created successfully.'));
});

/**
 * Get All Blog Articles (Paginated, Searchable & Filterable)
 * GET /api/blogs
 */
const getBlogs = asyncHandler(async (req, res) => {
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

  const total = await Blog.countDocuments(query);
  const blogs = await Blog.find(query)
    .sort({ publishDate: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, blogs, 'Blog articles fetched successfully.', {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    })
  );
});

/**
 * Get Single Blog Article
 * GET /api/blogs/:id
 */
const getBlogById = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ _id: req.params.id, isDeleted: false });
  if (!blog) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog article not found.');
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, blog, 'Blog article fetched successfully.'));
});

/**
 * Update Blog Article
 * PUT /api/blogs/:id
 */
const updateBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ _id: req.params.id, isDeleted: false });
  if (!blog) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog article not found.');
  }

  const { title, content, publishDate, status } = req.body;

  if (title !== undefined) blog.title = title;
  if (content !== undefined) blog.content = content;
  if (publishDate !== undefined) blog.publishDate = new Date(publishDate);
  if (status !== undefined) blog.status = status;

  if (req.file) {
    const oldImage = blog.image;
    blog.image = await uploadFile(req.file);
    if (oldImage) {
      deleteFile(oldImage);
    }
  }

  await blog.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, blog, 'Blog article updated successfully.'));
});

/**
 * Soft Delete Blog Article
 * DELETE /api/blogs/:id
 */
const deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ _id: req.params.id, isDeleted: false });
  if (!blog) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog article not found.');
  }

  blog.isDeleted = true;
  blog.deletedAt = new Date();
  await blog.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, {}, 'Blog article deleted successfully.'));
});

/**
 * Toggle Blog Status
 * PATCH /api/blogs/:id/toggle-status
 */
const toggleBlogStatus = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ _id: req.params.id, isDeleted: false });
  if (!blog) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Blog article not found.');
  }

  blog.status = blog.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
  await blog.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, blog, `Blog status toggled to ${blog.status}.`));
});

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
};
