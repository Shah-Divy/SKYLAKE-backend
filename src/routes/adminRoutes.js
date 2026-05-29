const express = require('express');
const { login, getProfile, logout } = require('../controllers/adminController');
const { getDashboardStats } = require('../controllers/dashboardController');
const { protectAdmin } = require('../middlewares/authMiddleware');
const { loginValidator } = require('../validators/adminValidator');
const validate = require('../middlewares/validationMiddleware');

const router = express.Router();

// Public login route
router.post('/login', loginValidator, validate, login);

// Protected administrative routes
router.post('/logout', protectAdmin, logout);
router.get('/profile', protectAdmin, getProfile);
router.get('/dashboard', protectAdmin, getDashboardStats);

module.exports = router;
