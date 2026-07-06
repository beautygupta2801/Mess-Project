const express = require('express');
const router = express.Router();
const { getPublicMenu, upsertPublicMenu } = require('../controllers/menuPageController');

// Debug logging
console.log('[MenuPage Routes] Loading public menu routes');

// Test route to verify routing is working
router.get('/test', (req, res) => {
  console.log('[MenuPage Routes] TEST route called');
  res.json({ success: true, message: 'Menu routes are working!' });
});

// @route   GET /api/menu/public
// @desc    Get public menu page data (no authentication required)
// @access  Public
router.get('/public', (req, res, next) => {
  console.log('[MenuPage Routes] GET /public called');
  next();
}, getPublicMenu);

// @route   PUT /api/menu/public
// @desc    Update public menu page (admin/munshi only - add auth middleware later if needed)
// @access  Public for now (can be protected later)
router.put('/public', upsertPublicMenu);

module.exports = router;
