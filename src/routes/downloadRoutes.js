const express = require('express');
const {
  createDownload,
  getDownloads,
  getDownloadById,
  updateDownload,
  deleteDownload,
  toggleDownloadStatus,
} = require('../controllers/downloadController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getDownloads);
router.get('/:id', getDownloadById);

// Protected administrative routes
router.post('/', protectAdmin, upload.single('zipFile'), createDownload);
router.put('/:id', protectAdmin, upload.single('zipFile'), updateDownload);
router.delete('/:id', protectAdmin, deleteDownload);
router.patch('/:id/toggle-status', protectAdmin, toggleDownloadStatus);

module.exports = router;
