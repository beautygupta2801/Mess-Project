const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Feedback = require('../models/Feedback');

// @route   POST /api/feedback/submit
// @desc    Submit feedback
// @access  Private
router.post('/submit', authMiddleware, async (req, res) => {
    try {
        const { date, mealType, mealItem, rating, comment } = req.body;
        const studentId = req.student._id;

        // Validation
        if (!date || !mealType || !rating) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide date, meal type, and rating' 
            });
        }

        // Check if feedback already exists for this meal
        const existingFeedback = await Feedback.findOne({
            studentId,
            date: new Date(date),
            mealType,
            mealItem: mealItem || null
        });

        if (existingFeedback) {
            return res.status(400).json({ 
                success: false, 
                message: 'You have already submitted feedback for this meal' 
            });
        }

        // Create feedback
        const feedback = new Feedback({
            studentId,
            date: new Date(date),
            mealType,
            mealItem: mealItem || null,
            rating,
            comment: comment || ''
        });

        await feedback.save();

        res.status(201).json({
            success: true,
            message: 'Feedback submitted successfully',
            data: {
                id: feedback._id,
                date: feedback.date.toISOString().split('T')[0],
                mealType: feedback.mealType,
                mealItem: feedback.mealItem,
                rating: feedback.rating,
                comment: feedback.comment
            }
        });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error submitting feedback' 
        });
    }
});

// @route   GET /api/feedback/my-feedback
// @desc    Get student's feedback history
// @access  Private
router.get('/my-feedback', authMiddleware, async (req, res) => {
    try {
        const studentId = req.student._id;

        const feedbacks = await Feedback.find({ studentId })
            .sort({ date: -1 })
            .limit(50)
            .lean();

        res.json({
            success: true,
            data: feedbacks.map(fb => ({
                id: fb._id,
                date: fb.date.toISOString().split('T')[0],
                mealType: fb.mealType,
                mealItem: fb.mealItem,
                rating: fb.rating,
                comment: fb.comment,
                createdAt: fb.createdAt
            }))
        });
    } catch (error) {
        console.error('Get feedback error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching feedback' 
        });
    }
});

module.exports = router;