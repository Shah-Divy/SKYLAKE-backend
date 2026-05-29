const express = require('express');

// Import sub-routers
const adminRouter = require('./adminRoutes');
const bannerRouter = require('./bannerRoutes');
const reviewRouter = require('./reviewRoutes');
const galleryRouter = require('./galleryRoutes');
const jobRouter = require('./jobRoutes');
const companyProfileRouter = require('./companyProfileRoutes');
const policyRouter = require('./policyRoutes');
const brandRouter = require('./brandRoutes');
const categoryRouter = require('./categoryRoutes');
const productRouter = require('./productRoutes');
const newsRouter = require('./newsRoutes');
const blogRouter = require('./blogRoutes');
const downloadRouter = require('./downloadRoutes');
const inquiriesRouter = require('./inquiryRoutes');

// Import public contact dependencies
const { createInquiry } = require('../controllers/inquiryController');
const { createInquiryValidator } = require('../validators/inquiryValidator');
const validate = require('../middlewares/validationMiddleware');

const router = express.Router();

/**
 * Public Contact Form Submission Endpoint
 * POST /api/contact
 */
router.post('/contact', createInquiryValidator, validate, createInquiry);

/**
 * Administrative and Resource Routers Mapping
 */
router.use('/admin', adminRouter);
router.use('/banners', bannerRouter);
router.use('/reviews', reviewRouter);
router.use('/galleries', galleryRouter);
router.use('/jobs', jobRouter);
router.use('/company-profile', companyProfileRouter);
router.use('/policies', policyRouter);
router.use('/brands', brandRouter);
router.use('/categories', categoryRouter);
router.use('/products', productRouter);
router.use('/news', newsRouter);
router.use('/blogs', blogRouter);
router.use('/downloads', downloadRouter);
router.use('/inquiries', inquiriesRouter);

module.exports = router;
