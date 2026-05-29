const express = require('express');
const {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  toggleReviewStatus,
} = require('../controllers/reviewController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getReviews);
router.get('/:id', getReviewById);

// Protected administrative routes
router.post('/', protectAdmin, upload.single('profileImage'), createReview);
router.put('/:id', protectAdmin, upload.single('profileImage'), updateReview);
router.delete('/:id', protectAdmin, deleteReview);
router.patch('/:id/toggle-status', protectAdmin, toggleReviewStatus);

module.exports = router;
