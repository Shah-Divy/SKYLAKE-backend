const express = require('express');
const {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
  toggleBrandStatus,
} = require('../controllers/brandController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getBrands);
router.get('/:id', getBrandById);

// Protected administrative routes
router.post('/', protectAdmin, upload.single('logo'), createBrand);
router.put('/:id', protectAdmin, upload.single('logo'), updateBrand);
router.delete('/:id', protectAdmin, deleteBrand);
router.patch('/:id/toggle-status', protectAdmin, toggleBrandStatus);

module.exports = router;
