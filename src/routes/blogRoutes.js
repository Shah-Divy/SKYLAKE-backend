const express = require('express');
const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  toggleBlogStatus,
} = require('../controllers/blogController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/:id', getBlogById);

// Protected administrative routes
router.post('/', protectAdmin, upload.single('image'), createBlog);
router.put('/:id', protectAdmin, upload.single('image'), updateBlog);
router.delete('/:id', protectAdmin, deleteBlog);
router.patch('/:id/toggle-status', protectAdmin, toggleBlogStatus);

module.exports = router;
