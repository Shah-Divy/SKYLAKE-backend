const express = require('express');
const {
  createNews,
  getNews,
  getNewsById,
  updateNews,
  deleteNews,
  toggleNewsStatus,
} = require('../controllers/newsController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getNews);
router.get('/:id', getNewsById);

// Protected administrative routes
router.post('/', protectAdmin, upload.single('image'), createNews);
router.put('/:id', protectAdmin, upload.single('image'), updateNews);
router.delete('/:id', protectAdmin, deleteNews);
router.patch('/:id/toggle-status', protectAdmin, toggleNewsStatus);

module.exports = router;
