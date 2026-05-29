const Category = require('../models/Category');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS, STATUS } = require('../constants');

/**
 * Create Category
 * POST /api/categories
 */
const createCategory = asyncHandler(async (req, res) => {
  const { categoryName, description } = req.body;

  if (!categoryName) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Category name is required.');
  }

  const existingCategory = await Category.findOne({ categoryName, isDeleted: false });
  if (existingCategory) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Category with name '${categoryName}' already exists.`);
  }

  const category = await Category.create({
    categoryName,
    description: description || '',
  });

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, category, 'Category created successfully.'));
});

/**
 * Get All Categories (Paginated, Searchable & Filterable)
 * GET /api/categories
 */
const getCategories = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  if (req.query.search) {
    query.categoryName = { $regex: req.query.search, $options: 'i' };
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  const total = await Category.countDocuments(query);
  const categories = await Category.find(query)
    .sort({ categoryName: 1 })
    .skip(skip)
    .limit(limit);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, categories, 'Categories fetched successfully.', {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    })
  );
});

/**
 * Get Single Category
 * GET /api/categories/:id
 */
const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
  if (!category) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found.');
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, category, 'Category fetched successfully.'));
});

/**
 * Update Category
 * PUT /api/categories/:id
 */
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
  if (!category) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found.');
  }

  const { categoryName, description, status } = req.body;

  if (categoryName !== undefined && categoryName !== category.categoryName) {
    const duplicate = await Category.findOne({ categoryName, isDeleted: false, _id: { $ne: category._id } });
    if (duplicate) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Another category with name '${categoryName}' already exists.`);
    }
    category.categoryName = categoryName;
  }

  if (description !== undefined) category.description = description;
  if (status !== undefined) category.status = status;

  await category.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, category, 'Category updated successfully.'));
});

/**
 * Soft Delete Category
 * DELETE /api/categories/:id
 */
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
  if (!category) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found.');
  }

  category.isDeleted = true;
  category.deletedAt = new Date();
  await category.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, {}, 'Category deleted successfully.'));
});

/**
 * Toggle Category Status
 * PATCH /api/categories/:id/toggle-status
 */
const toggleCategoryStatus = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ _id: req.params.id, isDeleted: false });
  if (!category) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found.');
  }

  category.status = category.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
  await category.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, category, `Category status toggled to ${category.status}.`));
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
};
