const Inquiry = require('../models/Inquiry');
const ApiResponse = require('../utils/apiResponse');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS } = require('../constants');

/**
 * Public Contact Form Submission
 * POST /api/contact
 */
const createInquiry = asyncHandler(async (req, res) => {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone || !message) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'All fields (name, email, phone, message) are required.');
  }

  const inquiry = await Inquiry.create({
    name,
    email,
    phone,
    message,
  });

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, inquiry, 'Your contact inquiry has been submitted successfully.'));
});

/**
 * Admin Get All Inquiries (Paginated, Searchable)
 * GET /api/inquiries
 */
const getInquiries = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
      { phone: { $regex: req.query.search, $options: 'i' } },
      { message: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const total = await Inquiry.countDocuments(query);
  const inquiries = await Inquiry.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, inquiries, 'Contact inquiries fetched successfully.', {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    })
  );
});

/**
 * Admin Get Single Inquiry
 * GET /api/inquiries/:id
 */
const getInquiryById = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findOne({ _id: req.params.id, isDeleted: false });
  if (!inquiry) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Inquiry not found.');
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, inquiry, 'Inquiry fetched successfully.'));
});

/**
 * Admin Soft Delete Inquiry
 * DELETE /api/inquiries/:id
 */
const deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findOne({ _id: req.params.id, isDeleted: false });
  if (!inquiry) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Inquiry not found.');
  }

  inquiry.isDeleted = true;
  inquiry.deletedAt = new Date();
  await inquiry.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, {}, 'Inquiry deleted successfully.'));
});

module.exports = {
  createInquiry,
  getInquiries,
  getInquiryById,
  deleteInquiry,
};
