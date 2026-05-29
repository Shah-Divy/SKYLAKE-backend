const express = require('express');
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getRelatedProducts,
} = require('../controllers/productController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');
const { productValidator } = require('../validators/productValidator');
const validate = require('../middlewares/validationMiddleware');

const router = express.Router();

// Define multi-field file attachment limits for robust catalog parsing
const productUploads = upload.fields([
  { name: 'images', maxCount: 5 },
  { name: 'pdfFile', maxCount: 1 },
]);

// Public catalog routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.get('/:id/related', getRelatedProducts);

// Protected administrative catalog mutation routes
router.post('/', protectAdmin, productUploads, productValidator, validate, createProduct);
router.put('/:id', protectAdmin, productUploads, productValidator, validate, updateProduct);
router.delete('/:id', protectAdmin, deleteProduct);
router.patch('/:id/toggle-status', protectAdmin, toggleProductStatus);

module.exports = router;
