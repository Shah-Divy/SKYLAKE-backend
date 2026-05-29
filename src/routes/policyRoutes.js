const express = require('express');
const { getPolicyByType, updatePolicyByType } = require('../controllers/policyController');
const { protectAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Public route to view a policy by type (e.g. shipping, refund)
router.get('/:type', getPolicyByType);

// Protected administrative route to update a policy
router.put('/:type', protectAdmin, updatePolicyByType);

module.exports = router;
