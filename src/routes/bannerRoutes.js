const express = require('express');
const {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
} = require('../controllers/bannerController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getBanners);
router.get('/:id', getBannerById);

// Protected administrative routes
router.post('/', protectAdmin, upload.single('image'), createBanner);
router.put('/:id', protectAdmin, upload.single('image'), updateBanner);
router.delete('/:id', protectAdmin, deleteBanner);
router.patch('/:id/toggle-status', protectAdmin, toggleBannerStatus);

module.exports = router;
