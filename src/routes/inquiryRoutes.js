const express = require('express');
const { getInquiries, getInquiryById, deleteInquiry } = require('../controllers/inquiryController');
const { protectAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// All administrative inquiry routes are strictly protected by JWT verification
router.get('/', protectAdmin, getInquiries);
router.get('/:id', protectAdmin, getInquiryById);
router.delete('/:id', protectAdmin, deleteInquiry);

module.exports = router;
