const express = require('express');
const authMiddleware = require('../middleware/auth');
const {
  getProfile,
  getMealHistory,
  downloadMealReport,
} = require('../controllers/studentController');

const router = express.Router();

// GET /api/student/profile
router.get('/profile', authMiddleware, getProfile);

// GET /api/student/meals?month=0-11
router.get('/meals', authMiddleware, getMealHistory);

// GET /api/student/report/download?month=0-11
router.get('/report/download', authMiddleware, downloadMealReport);

module.exports = router;

