const Brand = require('../models/Brand');
const { uploadFile, deleteFile } = require('../services/cloudinaryService');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS, STATUS } = require('../constants');

/**
 * Create Brand
 * POST /api/brands
 */
const createBrand = asyncHandler(async (req, res) => {
  const { brandName, description } = req.body;

  if (!brandName) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Brand name is required.');
  }

  // Check if brand with same name already exists
  const existingBrand = await Brand.findOne({ brandName, isDeleted: false });
  if (existingBrand) {
    throw new ApiError(HTTP_STATUS.CONFLICT, `Brand with name '${brandName}' already exists.`);
  }

  if (!req.file) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Brand logo file is required.');
  }

  const logo = await uploadFile(req.file);

  const brand = await Brand.create({
    brandName,
    logo,
    description: description || '',
  });

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, brand, 'Brand created successfully.'));
});

/**
 * Get All Brands (Paginated, Searchable & Filterable)
 * GET /api/brands
 */
const getBrands = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  if (req.query.search) {
    query.brandName = { $regex: req.query.search, $options: 'i' };
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  const total = await Brand.countDocuments(query);
  const brands = await Brand.find(query)
    .sort({ brandName: 1 })
    .skip(skip)
    .limit(limit);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, brands, 'Brands fetched successfully.', {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    })
  );
});

/**
 * Get Single Brand
 * GET /api/brands/:id
 */
const getBrandById = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ _id: req.params.id, isDeleted: false });
  if (!brand) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Brand not found.');
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, brand, 'Brand fetched successfully.'));
});

/**
 * Update Brand
 * PUT /api/brands/:id
 */
const updateBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ _id: req.params.id, isDeleted: false });
  if (!brand) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Brand not found.');
  }

  const { brandName, description, status } = req.body;

  if (brandName !== undefined && brandName !== brand.brandName) {
    // Check name uniqueness if changed
    const duplicate = await Brand.findOne({ brandName, isDeleted: false, _id: { $ne: brand._id } });
    if (duplicate) {
      throw new ApiError(HTTP_STATUS.CONFLICT, `Another brand with name '${brandName}' already exists.`);
    }
    brand.brandName = brandName;
  }

  if (description !== undefined) brand.description = description;
  if (status !== undefined) brand.status = status;

  if (req.file) {
    const oldLogo = brand.logo;
    brand.logo = await uploadFile(req.file);
    if (oldLogo) {
      deleteFile(oldLogo);
    }
  }

  await brand.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, brand, 'Brand updated successfully.'));
});

/**
 * Soft Delete Brand
 * DELETE /api/brands/:id
 */
const deleteBrand = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ _id: req.params.id, isDeleted: false });
  if (!brand) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Brand not found.');
  }

  brand.isDeleted = true;
  brand.deletedAt = new Date();
  await brand.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, {}, 'Brand deleted successfully.'));
});

/**
 * Toggle Brand Status
 * PATCH /api/brands/:id/toggle-status
 */
const toggleBrandStatus = asyncHandler(async (req, res) => {
  const brand = await Brand.findOne({ _id: req.params.id, isDeleted: false });
  if (!brand) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Brand not found.');
  }

  brand.status = brand.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
  await brand.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, brand, `Brand status toggled to ${brand.status}.`));
});

module.exports = {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
};
