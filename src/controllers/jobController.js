const Job = require('../models/Job');
const ApiError = require('../utils/apiError');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');
const { HTTP_STATUS, STATUS } = require('../constants');

/**
 * Create Job Opening
 * POST /api/jobs
 */
const createJob = asyncHandler(async (req, res) => {
  const { title, experience, location, description } = req.body;

  if (!title || !experience || !location || !description) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'All fields (title, experience, location, description) are required.');
  }

  const job = await Job.create({
    title,
    experience,
    location,
    description,
  });

  return res
    .status(HTTP_STATUS.CREATED)
    .json(new ApiResponse(HTTP_STATUS.CREATED, job, 'Job opening created successfully.'));
});

/**
 * Get All Job Openings (Paginated, Searchable & Filterable)
 * GET /api/jobs
 */
const getJobs = asyncHandler(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = { isDeleted: false };

  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { location: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  const total = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, jobs, 'Job openings fetched successfully.', {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    })
  );
});

/**
 * Get Single Job Opening
 * GET /api/jobs/:id
 */
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, isDeleted: false });
  if (!job) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job opening not found.');
  }

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, job, 'Job opening fetched successfully.'));
});

/**
 * Update Job Opening
 * PUT /api/jobs/:id
 */
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, isDeleted: false });
  if (!job) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job opening not found.');
  }

  const { title, experience, location, description, status } = req.body;

  if (title !== undefined) job.title = title;
  if (experience !== undefined) job.experience = experience;
  if (location !== undefined) job.location = location;
  if (description !== undefined) job.description = description;
  if (status !== undefined) job.status = status;

  await job.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, job, 'Job opening updated successfully.'));
});

/**
 * Soft Delete Job Opening
 * DELETE /api/jobs/:id
 */
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, isDeleted: false });
  if (!job) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job opening not found.');
  }

  job.isDeleted = true;
  job.deletedAt = new Date();
  await job.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, {}, 'Job opening deleted successfully.'));
});

/**
 * Toggle Job Status
 * PATCH /api/jobs/:id/toggle-status
 */
const toggleJobStatus = asyncHandler(async (req, res) => {
  const job = await Job.findOne({ _id: req.params.id, isDeleted: false });
  if (!job) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Job opening not found.');
  }

  job.status = job.status === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
  await job.save();

  return res
    .status(HTTP_STATUS.OK)
    .json(new ApiResponse(HTTP_STATUS.OK, job, `Job status toggled to ${job.status}.`));
});

module.exports = {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleJobStatus,
};
