const express = require('express');
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} = require('../controllers/categoryController');
const { protectAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// Protected administrative routes
router.post('/', protectAdmin, createCategory);
router.put('/:id', protectAdmin, updateCategory);
router.delete('/:id', protectAdmin, deleteCategory);
router.patch('/:id/toggle-status', protectAdmin, toggleCategoryStatus);

module.exports = router;
