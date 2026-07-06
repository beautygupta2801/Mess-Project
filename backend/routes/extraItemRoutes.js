const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ExtraItem = require('../models/extra');
const munshiAuth = require('../middleware/munshiAuth');
const upload = require('../middleware/upload'); // Import upload middleware

// @desc    Get all extra items
// @route   GET /api/extra-items/all
// @access  Public (or protected as needed, currently public for Munshi access easily)
router.get('/all', async (req, res) => {
  try {
    const items = await ExtraItem.find({ isAvailable: true }).sort({ category: 1, name: 1 });
    res.json({ success: true, count: items.length, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Add new extra item
// @route   POST /api/extra-items/add
// @access  Private (Clerk/Admin)
router.post('/add', munshiAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, price, category } = req.body;
    let imagePath = req.body.image || ''; // Fallback to URL if provided in body

    // If file is uploaded, use that
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    console.log('[Extra Items Add] Adding item for munshi:', req.munshi ? req.munshi._id : 'NULL');

    const newItem = new ExtraItem({
      name,
      price,
      category,
      image: imagePath,
      munshiId: req.munshi ? req.munshi._id : null
    });

    const savedItem = await newItem.save();
    console.log('[Extra Items Add] Item saved with munshiId:', savedItem.munshiId);
    res.status(201).json({ success: true, data: savedItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Delete extra item
// @route   DELETE /api/extra-items/:id
// @access  Private (Clerk/Admin)
router.delete('/:id', async (req, res) => {
  try {
    const item = await ExtraItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    await item.deleteOne();
    res.json({ success: true, message: 'Item removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @desc    Update extra item
// @route   PUT /api/extra-items/:id
// @access  Private (Clerk/Admin)
router.put('/:id', munshiAuth, upload.single('image'), async (req, res) => {
  try {
    const { name, price, category, isAvailable } = req.body;
    let item = await ExtraItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    // Update fields
    if (name) item.name = name;
    if (price) item.price = price;
    if (category) item.category = category;
    if (isAvailable !== undefined) item.isAvailable = isAvailable;

    // specific check for "null" string which might come from FormData
    if (isAvailable === 'true') item.isAvailable = true;
    if (isAvailable === 'false') item.isAvailable = false;

    // Update image if new file uploaded
    if (req.file) {
      item.image = `/uploads/${req.file.filename}`;
    }

    const updatedItem = await item.save();
    res.json({ success: true, data: updatedItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;
