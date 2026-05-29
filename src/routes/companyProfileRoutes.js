const express = require('express');
const { getCompanyProfile, updateCompanyProfile } = require('../controllers/companyProfileController');
const { protectAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public route
router.get('/', getCompanyProfile);

// Protected administrative route
router.put('/', protectAdmin, updateCompanyProfile);

module.exports = router;
