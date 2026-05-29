const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const { uploadFile, deleteFile } = require('../services/cloudinaryService');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS, STATUS } = require('../constants');

/**
 * Create Product
 * POST /api/products
 * Expects multipart/form-data:
 * - images: multiple image files
 * - pdfFile: single PDF brochure file
 */
const createProduct = asyncHandler(async (req, res) => {
  const {
    productName,
    modelNumber,
    hsnCode,
    videoLink,
    description,
    price,
    discountedPrice,
    brandId,
    categoryId,
    status
  } = req.body;

  // 1. Basic validation
  if (!productName || !modelNumber || !description || !price || !brandId || !categoryId) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Missing required product information fields.');
  }

  // 2. Validate Brand and Category references exist in database
  const [brandExists, categoryExists] = await Promise.all([
    Brand.findOne({ _id: brandId, isDeleted: false }),
    Category.findOne({ _id: categoryId, isDeleted: false })
  ]);

  if (!brandExists) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assigned brand reference does not exist or has been deleted.');
  }
  if (!categoryExists) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Assigned category reference does not exist or has been deleted.');
  }

  // 3. Handle File Uploads
  if (!req.files || !req.files['images'] || req.files['images'].length === 0) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'At least one product image is required.');
  }

  // Upload all product images concurrently
  const imageUploadPromises = req.files['images'].map(file => uploadFile(file));
  const imageUrls = await Promise.all(imageUploadPromises);

  // Upload optional PDF brochure
  let pdfUrl = '';
  if (req.files['pdfFile'] && req.files['pdfFile'].length > 0) {
    pdfUrl = await uploadFile(req.files['pdfFile'][0]);
  }

  // 4. Create Product
  const product = await Product.create({
    productName,
    modelNumber,
    hsnCode: hsnCode || '',
    images: imageUrls,
    videoLink: videoLink || '',
    pdfFile: pdfUrl,
    description,
    price: Number(price),
    discountedPrice: discountedPrice ? Number(discountedPrice) : null,
    brandId,
    categoryId,
    status: status || STATUS.ACTIVE,
  });

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, product, 'Product catalog item created successfully.'));
});

/**
 * Get All Products (Paginated, Searchable, Filterable)
 * GET /api/products
 */
const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  // 1. Relational filters
  if (req.query.brandId) {
    query.brandId = req.query.brandId;
  }
  if (req.query.categoryId) {
    query.categoryId = req.query.categoryId;
  }
  if (req.query.status) {
    query.status = req.query.status;
  }

  // 2. Full-text or pattern search
  if (req.query.search) {
    // If text index is used, we can query via $text, or fall back to regex on key fields
    query.$or = [
      { productName: { $regex: req.query.search, $options: 'i' } },
      { modelNumber: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // 3. Price range filters
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }

  const total = await Product.countDocuments(query);
  
  // Fetch products, populating relational brand and category documents
  const products = await Product.find(query)
    .populate('brandId', 'brandName logo')
    .populate('categoryId', 'categoryName')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      products,
      'Product listings fetched successfully.',
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
 * Get Single Product and Populate Details
 * GET /api/products/:id
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false })
    .populate('brandId', 'brandName logo description')
    .populate('categoryId', 'categoryName description');

  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product catalog item not found.');
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, product, 'Product details fetched successfully.'));
});

/**
 * Update Product
 * PUT /api/products/:id
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  
  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product catalog item not found.');
  }

  const {
    productName,
    modelNumber,
    hsnCode,
    videoLink,
    description,
    price,
    discountedPrice,
    brandId,
    categoryId,
    status
  } = req.body;

  // Validate assignments if references are updating
  if (brandId && brandId !== product.brandId.toString()) {
    const brandExists = await Brand.findOne({ _id: brandId, isDeleted: false });
    if (!brandExists) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'New brand reference not found.');
    product.brandId = brandId;
  }

  if (categoryId && categoryId !== product.categoryId.toString()) {
    const categoryExists = await Category.findOne({ _id: categoryId, isDeleted: false });
    if (!categoryExists) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'New category reference not found.');
    product.categoryId = categoryId;
  }

  // Update scalar values
  if (productName !== undefined) product.productName = productName;
  if (modelNumber !== undefined) product.modelNumber = modelNumber;
  if (hsnCode !== undefined) product.hsnCode = hsnCode;
  if (videoLink !== undefined) product.videoLink = videoLink;
  if (description !== undefined) product.description = description;
  if (price !== undefined) product.price = Number(price);
  if (discountedPrice !== undefined) product.discountedPrice = discountedPrice ? Number(discountedPrice) : null;
  if (status !== undefined) product.status = status;

  // Handle uploaded files if any
  if (req.files) {
    // 1. Replacing multiple images if uploaded
    if (req.files['images'] && req.files['images'].length > 0) {
      const oldImages = product.images;
      
      const newImagePromises = req.files['images'].map(file => uploadFile(file));
      product.images = await Promise.all(newImagePromises);

      // Clean up old assets asynchronously
      oldImages.forEach(img => deleteFile(img));
    }

    // 2. Replacing single PDF manual brochure if uploaded
    if (req.files['pdfFile'] && req.files['pdfFile'].length > 0) {
      const oldPdf = product.pdfFile;
      product.pdfFile = await uploadFile(req.files['pdfFile'][0]);
      
      if (oldPdf) {
        deleteFile(oldPdf);
      }
    }
  }

  await product.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, product, 'Product updated successfully.'));
});

/**
 * Soft Delete Product
 * DELETE /api/products/:id
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product catalog item not found.');
  }

  product.isDeleted = true;
  product.deletedAt = new Date();
  await product.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, {}, 'Product soft-deleted successfully.'));
});

/**
 * Toggle Product Status (Active/Inactive)
 * PATCH /api/products/:id/toggle-status
 */
const toggleProductStatus = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Product catalog item not found.');
  }

  product.status = product.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
  await product.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, product, `Product status toggled to: ${product.status}`));
});

/**
 * Get Related Products (Same category, excluding current product)
 * GET /api/products/:id/related
 */
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Source product not found.');
  }

  // Find active items in the same category, excluding the product itself
  const related = await Product.find({
    categoryId: product.categoryId,
    _id: { $ne: product._id },
    status: STATUS.ACTIVE,
    isDeleted: false,
  })
    .populate('brandId', 'brandName logo')
    .sort({ createdAt: -1 })
    .limit(4); // Keep recommendation size responsive

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, related, 'Related products fetched successfully.'));
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getRelatedProducts,
};
