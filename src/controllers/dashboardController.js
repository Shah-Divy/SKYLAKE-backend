const Product = require('../models/Product');
const Brand = require('../models/Brand');
const Category = require('../models/Category');
const Blog = require('../models/Blog');
const News = require('../models/News');
const Download = require('../models/Download');
const Inquiry = require('../models/Inquiry');
const Job = require('../models/Job');
const ApiResponse = require('../utils/apiResponse');
const { HTTP_STATUS } = require('../constants');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Get Dashboard Statistics
 * GET /api/admin/dashboard
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  // Aggregate counts concurrently to minimize response latency
  const [
    totalProducts,
    totalBrands,
    totalCategories,
    totalBlogs,
    totalNews,
    totalDownloads,
    totalInquiries,
    totalJobs
  ] = await Promise.all([
    Product.countDocuments({ isDeleted: false }),
    Brand.countDocuments({ isDeleted: false }),
    Category.countDocuments({ isDeleted: false }),
    Blog.countDocuments({ isDeleted: false }),
    News.countDocuments({ isDeleted: false }),
    Download.countDocuments({ isDeleted: false }),
    Inquiry.countDocuments({ isDeleted: false }),
    Job.countDocuments({ isDeleted: false }),
  ]);

  return res.status(HTTP_STATUS.OK).json(
    new ApiResponse(
      HTTP_STATUS.OK,
      {
        products: totalProducts,
        brands: totalBrands,
        categories: totalCategories,
        blogs: totalBlogs,
        news: totalNews,
        downloads: totalDownloads,
        inquiries: totalInquiries,
        jobOpenings: totalJobs,
      },
      'Dashboard analytics retrieved successfully.'
    )
  );
});

module.exports = {
  getDashboardStats,
};
