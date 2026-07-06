const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Bill = require('../models/Bill');
const MealHistory = require('../models/MealHistory');
const mongoose = require('mongoose');

// @route   GET /api/bill/current
// @desc    Get current month bill
// @access  Private
router.get('/current', authMiddleware, async (req, res) => {
    try {
        const studentId = req.student._id;
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        let bill = await Bill.findOne({ 
            studentId, 
            month: currentMonth, 
            year: currentYear 
        });

        // If no bill exists, create a default one
        if (!bill) {
            bill = new Bill({
                studentId,
                month: currentMonth,
                year: currentYear,
                mealCharges: 0,
                fines: 0,
                extras: 0,
                totalBill: 0,
                mealCount: 0
            });
            await bill.save();
        }

        // Recalculate meal count from MealHistory to ensure accuracy
        const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
        const endOfMonth = new Date(currentYear, currentMonth, 1);

        console.log(`Recalculating diet for Student: ${studentId}, Month: ${currentMonth}, Year: ${currentYear}`);

        const dietStats = await MealHistory.aggregate([
            {
                $match: {
                    studentId: new mongoose.Types.ObjectId(studentId),
                    date: { $gte: startOfMonth, $lt: endOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    totalDiet: { $sum: "$dietCount" }
                }
            }
        ]);

        const realMealCount = dietStats.length > 0 ? dietStats[0].totalDiet : 0;
        console.log(`Real Meal Count (Recalculated): ${realMealCount}`);
        
        // Update bill if count mismatches (Self-healing)
        if (bill.mealCount !== realMealCount) {
             console.log(`Mismatch detected! Updating bill from ${bill.mealCount} to ${realMealCount}`);
             bill.mealCount = realMealCount;
             await bill.save();
        }

        res.json({
            success: true,
            data: {
                month: bill.month,
                year: bill.year,
                mealCharges: bill.mealCharges,
                fines: bill.fines,
                extras: bill.extras,
                totalBill: bill.totalBill,
                mealCount: bill.mealCount,
                isPaid: bill.isPaid,
                paidAt: bill.paidAt
            }
        });
    } catch (error) {
        console.error('Get current bill error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching bill' 
        });
    }
});

// @route   GET /api/bill/history
// @desc    Get all bills for student
// @access  Private
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const studentId = req.student._id;

        const bills = await Bill.find({ studentId })
            .sort({ year: -1, month: -1 })
            .lean();

        res.json({
            success: true,
            data: bills.map(bill => ({
                month: bill.month,
                year: bill.year,
                mealCharges: bill.mealCharges,
                fines: bill.fines,
                extras: bill.extras,
                totalBill: bill.totalBill,
                mealCount: bill.mealCount,
                isPaid: bill.isPaid,
                paidAt: bill.paidAt
            }))
        });
    } catch (error) {
        console.error('Get bill history error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error fetching bill history' 
        });
    }
});

// @route   POST /api/bill/add-fine
// @desc    Add fine to current bill (admin only in production)
// @access  Private
router.post('/add-fine', authMiddleware, async (req, res) => {
    try {
        const { amount, reason } = req.body;
        const studentId = req.student._id;

        if (!amount || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please provide a valid fine amount' 
            });
        }

        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();

        const bill = await Bill.findOneAndUpdate(
            { studentId, month: currentMonth, year: currentYear },
            { 
                $inc: { 
                    fines: amount,
                    totalBill: amount
                }
            },
            { upsert: true, new: true }
        );

        res.json({
            success: true,
            message: 'Fine added successfully',
            data: {
                fines: bill.fines,
                totalBill: bill.totalBill
            }
        });
    } catch (error) {
        console.error('Add fine error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error adding fine' 
        });
    }
});

module.exports = router;