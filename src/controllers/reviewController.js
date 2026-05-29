const Review = require('../models/Review');
const { uploadFile, deleteFile } = require('../services/cloudinaryService');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS, STATUS } = require('../constants');

/**
 * Create Customer Review
 * POST /api/reviews
 */
const createReview = asyncHandler(async (req, res) => {
  const { customerName, companyName, review, rating } = req.body;

  if (!customerName || !review || !rating) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Customer name, review text, and rating are required.');
  }

  let profileImage = '';
  if (req.file) {
    profileImage = await uploadFile(req.file);
  }

  const newReview = await Review.create({
    customerName,
    companyName: companyName || '',
    review,
    rating: Number(rating),
    profileImage,
  });

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, newReview, 'Review created successfully.'));
});

/**
 * Get All Reviews (Paginated, Searchable & Filterable)
 * GET /api/reviews
 */
const getReviews = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  if (req.query.search) {
    query.$or = [
      { customerName: { $regex: req.query.search, $options: 'i' } },
      { companyName: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.rating) {
    query.rating = Number(req.query.rating);
  }

  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, reviews, 'Reviews fetched successfully.', {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    })
  );
});

/**
 * Get Single Review
 * GET /api/reviews/:id
 */
const getReviewById = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, isDeleted: false });
  if (!review) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Review not found.');
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, review, 'Review fetched successfully.'));
});

/**
 * Update Review
 * PUT /api/reviews/:id
 */
const updateReview = asyncHandler(async (req, res) => {
  const reviewDoc = await Review.findOne({ _id: req.params.id, isDeleted: false });
  if (!reviewDoc) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Review not found.');
  }

  const { customerName, companyName, review, rating, status } = req.body;

  if (customerName !== undefined) reviewDoc.customerName = customerName;
  if (companyName !== undefined) reviewDoc.companyName = companyName;
  if (review !== undefined) reviewDoc.review = review;
  if (rating !== undefined) reviewDoc.rating = Number(rating);
  if (status !== undefined) reviewDoc.status = status;

  if (req.file) {
    const oldImage = reviewDoc.profileImage;
    reviewDoc.profileImage = await uploadFile(req.file);
    if (oldImage) {
      deleteFile(oldImage);
    }
  }

  await reviewDoc.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, reviewDoc, 'Review updated successfully.'));
});

/**
 * Soft Delete Review
 * DELETE /api/reviews/:id
 */
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, isDeleted: false });
  if (!review) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Review not found.');
  }

  review.isDeleted = true;
  review.deletedAt = new Date();
  await review.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, {}, 'Review deleted successfully.'));
});

/**
 * Toggle Review Status
 * PATCH /api/reviews/:id/toggle-status
 */
const toggleReviewStatus = asyncHandler(async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, isDeleted: false });
  if (!review) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Review not found.');
  }

  review.status = review.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
  await review.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, review, `Review status toggled to ${review.status}.`));
});

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  toggleReviewStatus,
};
