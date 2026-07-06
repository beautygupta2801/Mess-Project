const express = require('express');
const router = express.Router();
const munshiAuth = require('../middleware/munshiAuth');
const Student = require('../models/Student');
const Bill = require('../models/Bill');
const MealHistory = require('../models/MealHistory');

router.use(munshiAuth);

// @route   POST /api/munshi/bill/add-charge
// @desc    Add a charge (fine/extra) to all students in munshi's hostel
// @access  Munshi only
router.post('/add-charge', async (req, res) => {
  try {
    const { month, year, chargeType, amount, description, studentIds } = req.body;

    // Validation
    if (!month || !year || !chargeType || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Month, year, charge type, and amount are required'
      });
    }

    if (!['fines', 'extras'].includes(chargeType)) {
      return res.status(400).json({
        success: false,
        message: 'Charge type must be either "fines" or "extras"'
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12'
      });
    }

    let students;
    
    // If studentIds provided, use those; otherwise get all students from hostel
    if (studentIds && Array.isArray(studentIds) && studentIds.length > 0) {
      // Verify all students belong to munshi's hostel
      students = await Student.find({ 
        _id: { $in: studentIds },
        hostelNo: req.hostel,
        isActive: true 
      }).select('_id');
      
      if (students.length !== studentIds.length) {
        return res.status(403).json({
          success: false,
          message: 'Some students do not belong to your hostel or are not active'
        });
      }
    } else {
      // Get all students from munshi's hostel
      students = await Student.find({ 
        hostelNo: req.hostel,
        isActive: true 
      }).select('_id');
    }

    if (students.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active students found'
      });
    }

    // Update bills for selected students
    // Update bills and create history for selected students
    const updatePromises = students.map(async (student) => {
      const update = {
        $inc: {
          [chargeType]: amount,
          totalBill: amount
        }
      };

      // 1. Update Bill
      const billPromise = Bill.findOneAndUpdate(
        { 
          studentId: student._id, 
          month: parseInt(month), 
          year: parseInt(year) 
        },
        update,
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true 
        }
      );

      // 2. Create Meal History Record
      // chargeType is 'fines' or 'extras'
      // Map 'fines' -> 'Fine', 'extras' -> 'Snacks'
      const historyType = chargeType === 'fines' ? 'Fine' : 'Snacks';
      
      const historyPromise = new MealHistory({
          studentId: student._id,
          date: new Date(),
          type: historyType,
          items: [{
              name: description,
              qty: 1,
              price: amount
          }],
          totalCost: amount,
          dietCount: 0
      }).save();

      return Promise.all([billPromise, historyPromise]);
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: `Successfully added ${chargeType} charge to ${students.length} student(s)`,
      data: {
        studentsAffected: students.length,
        chargeType,
        amount,
        month,
        year,
        description: description || ''
      }
    });

  } catch (error) {
    console.error('Add bill charge error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding bill charge: ' + error.message
    });
  }
});

module.exports = router;
