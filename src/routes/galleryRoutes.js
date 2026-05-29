const express = require('express');
const {
  createGalleryItem,
  getGalleryItems,
  getGalleryItemById,
  updateGalleryItem,
  deleteGalleryItem,
  toggleGalleryStatus,
} = require('../controllers/galleryController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getGalleryItems);
router.get('/:id', getGalleryItemById);

// Protected administrative routes
router.post('/', protectAdmin, upload.single('image'), createGalleryItem);
router.put('/:id', protectAdmin, upload.single('image'), updateGalleryItem);
router.delete('/:id', protectAdmin, deleteGalleryItem);
router.patch('/:id/toggle-status', protectAdmin, toggleGalleryStatus);

module.exports = router;
