const express = require('express');
const {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  toggleJobStatus,
} = require('../controllers/jobController');
const { protectAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected administrative routes
router.post('/', protectAdmin, createJob);
router.put('/:id', protectAdmin, updateJob);
router.delete('/:id', protectAdmin, deleteJob);
router.patch('/:id/toggle-status', protectAdmin, toggleJobStatus);

module.exports = router;
