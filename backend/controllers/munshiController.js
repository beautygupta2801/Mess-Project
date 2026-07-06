/**
 * Munshi Controller
 * 
 * Business logic for munshi operations including student lookup,
 * order management, and mess-off request handling.
 * All operations are scoped to the munshi's assigned hostel.
 * 
 * @module controllers/munshiController
 */

const mongoose = require('mongoose');
const Student = require('../models/Student');
const Bill = require('../models/Bill');
const ExtraOrder = require('../models/ExtraOrder');
const MealHistory = require('../models/MealHistory');
const MessOff = require('../models/MessOff');
const {
  PAGINATION_DEFAULTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
} = require('../utils/constants');
const MealRate = require("../models/MealRate");
// ==================== STUDENT LOOKUP ====================

/**
 * Look up student by ID, roll number, or room number
 * Only returns students from munshi's hostel
 * 
 * @route GET /api/munshi/student/lookup
 * @access Private (munshi)
 */
exports.lookupStudent = async (req, res) => {
  try {
    const { q } = req.query;
    const hostel = req.munshi.hostel;

    const query = q.trim();

    // Check if query is a valid ObjectId
    const isObjectId =
      mongoose.Types.ObjectId.isValid(query) &&
      String(new mongoose.Types.ObjectId(query)) === query;

    // Build search query
    const findQuery = {
      hostelNo: hostel,
      ...(isObjectId
        ? { _id: new mongoose.Types.ObjectId(query) }
        : {
            $or: [
              {
                rollNo: new RegExp(
                  '^' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
                  'i'
                ),
              },
              {
                roomNo: new RegExp(
                  '^' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$',
                  'i'
                ),
              },
              {
                qrCode: query
              },
            ],
          }),
      isVerified: true 
    };

    const student = await Student.findOne(findQuery).select('-password').lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found in your hostel',
      });
    }

    // Get current month's bill
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const bill = await Bill.findOne({ studentId: student._id, month, year }).lean();
    const balance = bill ? bill.totalBill : 0;

    res.json({
      success: true,
      data: {
        id: student._id.toString(),
        name: student.name,
        rollNumber: student.rollNo,
        roomNumber: student.roomNo,
        hostelName: student.hostelNo,
        balance,
        // Check mess status
        isMessClosed: !!(await MessOff.findOne({
          studentId: student._id,
          status: 'Approved',
          fromDate: { $lte: new Date() },
          toDate: { $gte: new Date().setHours(0,0,0,0) }
        })),
        // Check diet status for today
        takenMeals: await ExtraOrder.find({
            studentId: student._id,
            date: { $gte: new Date().setHours(0,0,0,0) },
            dietCount: { $gt: 0 }
        }).distinct('mealType')
      },
    });
  } catch (error) {
    console.error('[Munshi Controller] Student lookup error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// ==================== ORDER MANAGEMENT ====================

/**
 * Create an extra-items order for a student
 * Updates the student's bill automatically
 * 
 * @route POST /api/munshi/order
 * @access Private (munshi)
 */
exports.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { studentId, items, mealType, dietCount } = req.body;
    const hostel = req.munshi.hostel;

    // Verify student exists and belongs to munshi's hostel
    const student = await Student.findOne({
      _id: studentId,
      hostelNo: hostel,
    }).session(session);

    if (!student) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_IN_HOSTEL,
      });
    }

    // Process and validate items with quantity and special pricing
    const orderItems = (items || []).map((i) => {
      const name = i.name.trim();
      const basePrice = Number(i.price);
      const qty = Number(i.qty) || 1;
      
      let finalPrice = basePrice * qty;
      
      // Special pricing logic: if item price is 15 and qty is 2, total is 25
      if (basePrice === 15 && qty === 2) {
        finalPrice = 25;
      }
      
      return {
        name,
        price: finalPrice, // Total price for this line item
        qty,
        basePrice // Store base price for reference if needed
      };
    });

    const totalAmount = orderItems.reduce((sum, i) => sum + i.price, 0);

    // Determine diet count
    // If dietCount is explicitly provided, use it.
    // Otherwise, if items exist, default to 1 (unless it's snacks?).
    // Actually, per user request: "if any students take other breakfast item more then one then this is not count of diet at a time only one diet will count"
    // So by default 1 diet if not specified and items > 0.
    // But if dietCount is sent (e.g. 0 or 2), we use that.
    
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Check Mess Closed Status
    const messOff = await MessOff.findOne({
      studentId: student._id,
      status: 'Approved',
      fromDate: { $lte: new Date() },
      toDate: { $gte: todayStart }
    });
    const isMessClosed = !!messOff;

    // Check if diet already taken for this meal type
    const existingDiet = await ExtraOrder.findOne({
        studentId: student._id,
        mealType: mealType,
        date: { $gte: todayStart },
        dietCount: { $gt: 0 }
    });

    // Determine final diet count
    let finalDietCount = 0;

    // Priority Rules:
    // 1. If Mess is Closed -> Diet Count is ALWAYS 0
    // 2. If Diet already taken -> Diet Count is 0 (prevent duplicates)
    // 3. Otherwise -> Use requested count OR default to 1 (unless snacks)

    if (isMessClosed) {
        finalDietCount = 0;
    } else if (existingDiet) {
        finalDietCount = 0;
    } else if (dietCount !== undefined) {
        finalDietCount = dietCount;
    } else {
        // Default Logic: Meal (not snacks) = 1 diet
        finalDietCount = (mealType && mealType.toLowerCase().startsWith('snack')) ? 0 : 1;
    }
    const rateDoc = await MealRate.findOne({ hostel: String(hostel).toUpperCase() }).session(session);
const mealRate = rateDoc?.rate || 0;
const dietCharge = finalDietCount > 0 ? mealRate * finalDietCount : 0;
const grandTotal = totalAmount + dietCharge;

    // Create the order
    const order = new ExtraOrder({
  studentId: student._id,
  items: orderItems.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
  totalAmount: grandTotal,
  mealType: mealType || "breakfast",
  dietCount: finalDietCount
});
    await order.save({ session });

    // Create meal history record
    const mealHistory = new MealHistory({
      studentId: student._id,
      date: new Date(),
      type: (mealType || 'breakfast').charAt(0).toUpperCase() + (mealType || 'breakfast').slice(1),
      items: orderItems.map(item => ({
        name: item.name,
        qty: item.qty,
        price: item.price
      })),
      totalCost: grandTotal,
      dietCount: finalDietCount
    });
    await mealHistory.save({ session });

    // Update or create bill for current month
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    await Bill.findOneAndUpdate(
      { studentId: student._id, month, year },
      {
        $inc: {
  extras: totalAmount,
  mealCharges: dietCharge,
  totalBill: grandTotal,
  mealCount: finalDietCount,
},
      },
      { upsert: true, new: true, session }
    );

    await session.commitTransaction();

    console.log(
      `[Munshi Controller] Order created: ${order._id} for student ${student.rollNo} by munshi ${req.munshi.email}`
    );

    res.status(201).json({
      success: true,
      message: SUCCESS_MESSAGES.ORDER_CREATED,
      data: {
        id: order._id.toString(),
        studentId: student._id.toString(),
        studentName: student.name,
        items: order.items,
        totalAmount: order.totalAmount,
        mealType: order.mealType,
        date: order.date,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('[Munshi Controller] Order creation error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  } finally {
    session.endSession();
  }
};

/**
 * Get list of orders for munshi's hostel with pagination and filtering
 * 
 * @route GET /api/munshi/orders
 * @access Private (munshi)
 */
exports.getOrders = async (req, res) => {
  try {
    const {
      from,
      to,
      studentId,
      mealType,
      limit = PAGINATION_DEFAULTS.PAGE_SIZE,
      page = 1,
    } = req.query;
    const hostel = req.munshi.hostel;

    // Get all student IDs from munshi's hostel
    const studentIds = await Student.find({ hostelNo: hostel }).distinct('_id');

    // Build query
    const query = { studentId: { $in: studentIds } };

    // Add date range filter
    if (from && to) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }

    // Add student filter
    if (studentId) {
      query.studentId = new mongoose.Types.ObjectId(studentId);
    }

    // Add meal type filter
    if (mealType) {
      query.mealType = mealType;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalCount = await ExtraOrder.countDocuments(query);

    // Fetch orders with pagination
    const orders = await ExtraOrder.find(query)
      .populate('studentId', 'name rollNo roomNo hostelNo')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const data = orders.map((o) => ({
      id: o._id.toString(),
      studentId: o.studentId ? (o.studentId._id ? o.studentId._id.toString() : o.studentId) : null,
      studentName: o.studentId && o.studentId.name ? o.studentId.name : 'Unknown',
      studentRollNo: o.studentId && o.studentId.rollNo ? o.studentId.rollNo : '',
      studentRoomNo: o.studentId?.roomNo || 'N/A',
      items: o.items || [],
      totalAmount: o.totalAmount,
      mealType: o.mealType,
      dietCount: o.dietCount !== undefined ? o.dietCount : (o.mealType === 'snacks' ? 0 : 1), 
      date: o.date,
    }));

    res.json({
      success: true,
      data,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('[Munshi Controller] Orders list error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

// ==================== MESS-OFF REQUEST MANAGEMENT ====================

/**
 * Get list of mess-off requests for munshi's hostel with pagination and filtering
 * 
 * @route GET /api/munshi/mess-off-requests
 * @access Private (munshi)
 */
exports.getMessOffRequests = async (req, res) => {
  try {
    const {
      status,
      from,
      to,
      limit = PAGINATION_DEFAULTS.PAGE_SIZE,
      page = 1,
    } = req.query;
    const hostel = req.munshi.hostel;

    // Get all student IDs from munshi's hostel
    const studentIds = await Student.find({ hostelNo: hostel }).distinct('_id');

    // Build query
    const query = { studentId: { $in: studentIds } };

    // Add status filter
    if (status) {
      query.status = status;
    }

    // Add date range filter
    if (from && to) {
      const start = new Date(from);
      const end = new Date(to);
      query.$or = [
        { fromDate: { $gte: start, $lte: end } },
        { toDate: { $gte: start, $lte: end } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const totalCount = await MessOff.countDocuments(query);

    // Fetch requests with pagination
    const requests = await MessOff.find(query)
      .populate('studentId', 'name rollNo roomNo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const data = requests.map((r) => ({
      id: r._id.toString(),
      studentId: r.studentId._id ? r.studentId._id.toString() : r.studentId,
      studentName: r.studentId && r.studentId.name ? r.studentId.name : 'Unknown',
      studentRollNo: r.studentId && r.studentId.rollNo ? r.studentId.rollNo : '',
      studentRoomNo: r.studentId && r.studentId.roomNo ? r.studentId.roomNo : '',
      from: r.fromDate.toISOString().split('T')[0],
      to: r.toDate.toISOString().split('T')[0],
      status: r.status,
      reason: r.reason || '',
      createdAt: r.createdAt,
    }));

    res.json({
      success: true,
      data,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error('[Munshi Controller] Mess-off list error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

/**
 * Approve or reject a mess-off request
 * Only for requests from students in munshi's hostel
 * 
 * @route PATCH /api/munshi/mess-off/:id/status
 * @access Private (munshi)
 */
exports.updateMessOffStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;
    const hostel = req.munshi.hostel;

    // Get all student IDs from munshi's hostel
    const studentIds = await Student.find({ hostelNo: hostel }).distinct('_id');

    // Find and update the mess-off request
    const updateData = {
      status,
      approvedAt: new Date(),
    };

    // Add rejection reason if provided
    if (status === 'Rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const messOff = await MessOff.findOneAndUpdate(
      { _id: id, studentId: { $in: studentIds } },
      updateData,
      { new: true }
    )
      .populate('studentId', 'name rollNo')
      .lean();

    if (!messOff) {
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_IN_HOSTEL,
      });
    }

    console.log(
      `[Munshi Controller] Mess-off request ${id} ${status.toLowerCase()} by munshi ${req.munshi.email}`
    );

    res.json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      data: {
        id: messOff._id.toString(),
        status: messOff.status,
        studentName: messOff.studentId?.name || 'Unknown',
      },
    });
  } catch (error) {
    console.error('[Munshi Controller] Mess-off update error:', error);
    res.status(500).json({
      success: false,
    });
  }
};

/**
 * Get all available extra items for the day
 * 
 * @route GET /api/munshi/extra-items
 * @access Private (munshi)
 */
exports.getExtraItems = async (req, res) => {
  try {
    const ExtraItem = require('../models/extra');
    
    // Filter: Show global items (no munshiId) AND items created by this specific munshi
    const query = {
        isAvailable: true,
        $or: [
            { munshiId: req.munshi._id },
            { munshiId: { $exists: false } }, // Legacy items
            { munshiId: null }               // Explicitly global items
        ]
    };
    
    console.log('[Munshi Controller] Fetching extra items for munshi:', req.munshi._id);
    console.log('[Munshi Controller] Query:', JSON.stringify(query));

    const items = await ExtraItem.find(query).sort({ category: 1, name: 1 });
    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('[Munshi Controller] Get extra items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};
/**
 * Get session statistics (Taken, Not Taken, Mess Off) for a specific meal type
 * 
 * @route GET /api/munshi/session-stats
 * @query mealType (optional, defaults to current time-based meal)
 * @access Private (munshi)
 */
exports.getSessionStats = async (req, res) => {
  try {
    const { mealType } = req.query;
    const hostel = req.munshi.hostel;

    // determine meal type if not provided (simple logic based on time, or just default to breakfast)
    // For now, if not provided, we might want to throw error or handle it. 
    // But frontend should send it.
    
    const targetMeal = mealType || 'breakfast'; // Fallback
    
    // Get all students in hostel
    const allStudents = await Student.find({
      hostelNo: hostel,
      isVerified: true
    })
      .select('name rollNo roomNo')
      .sort({ roomNo: 1 })
      .lean();

    const studentIds = allStudents.map(s => s._id);

    // Get Approved Mess Offs for today
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const messOffs = await MessOff.find({
      studentId: { $in: studentIds },
      status: 'Approved',
      fromDate: { $lte: new Date() },
      toDate: { $gte: today }
    }).distinct('studentId');
    
    const messOffSet = new Set(messOffs.map(id => id.toString()));

    // Get Diet Taken for today & mealType
    // We want students who have dietCount > 0 for this meal
    const takenOrders = await ExtraOrder.find({
      studentId: { $in: studentIds },
      mealType: targetMeal,
      date: { $gte: today },
      dietCount: { $gt: 0 }
    }).distinct('studentId');
    
    const takenSet = new Set(takenOrders.map(id => id.toString()));

    // Categorize
    const stats = {
      taken: [],
      notTaken: [],
      messOff: []
    };

    allStudents.forEach(student => {
      const idStr = student._id.toString();
      
      if (messOffSet.has(idStr)) {
        stats.messOff.push(student);
      } else if (takenSet.has(idStr)) {
        stats.taken.push(student);
      } else {
        stats.notTaken.push(student);
      }
    });

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('[Munshi Controller] Session stats error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

/**
 * Enable mess for a student (Mess On)
 * Ends their current mess-off period effectively immediately
 * 
 * @route PATCH /api/munshi/mess-on
 * @access Private (munshi)
 */
exports.enableMessOn = async (req, res) => {
  try {
    const { studentId } = req.body;
    const hostel = req.munshi.hostel;

    // Verify student belongs to hostel
    const student = await Student.findOne({ _id: studentId, hostelNo: hostel });
    if (!student) {
        return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    // Find active mess off
    const messOff = await MessOff.findOne({
        studentId: studentId,
        status: 'Approved',
        fromDate: { $lte: new Date() },
        toDate: { $gte: today }
    });

    if (!messOff) {
        return res.status(400).json({ success: false, message: 'No active mess off found for this student.' });
    }

    // Logic:
    // If fromDate is today -> Cancel the whole request
    // If fromDate is before today -> Set toDate to yesterday
    
    const fromDate = new Date(messOff.fromDate);
    fromDate.setHours(0,0,0,0);

    if (fromDate.getTime() === today.getTime()) {
        messOff.status = 'Cancelled';
        messOff.rejectionReason = 'Mess On by Munshi'; // Or just generic note
    } else {
         const yesterday = new Date(today);
         yesterday.setDate(yesterday.getDate() - 1);
         yesterday.setHours(23,59,59,999); // End of yesterday
         messOff.toDate = yesterday;
    }

    await messOff.save();

    res.json({
        success: true,
        message: 'Mess enabled successfully for the student.'
    });

  } catch (error) {
    console.error('[Munshi Controller] Mess On error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR
    });
  }
};

/**
 * Add a manual fine/bill to a student
 * 
 * @route POST /api/munshi/fine
 * @access Private (munshi)
 */
exports.addFine = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { studentId, amount, reason } = req.body;
    const hostel = req.munshi.hostel;

    // Verify student exists and belongs to munshi's hostel
    const student = await Student.findOne({
      _id: studentId,
      hostelNo: hostel,
    }).session(session);

    if (!student) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_IN_HOSTEL,
      });
    }

    const fineAmount = Number(amount);
    if (!fineAmount || fineAmount <= 0) {
        await session.abortTransaction();
        return res.status(400).json({
            success: false,
            message: 'Invalid amount',
        });
    }

    // Create meal history record for the fine
    const mealHistory = new MealHistory({
      studentId: student._id,
      date: new Date(),
      type: 'Fine',
      items: [{
        name: reason || 'Manual Fine',
        qty: 1,
        price: fineAmount
      }],
      totalCost: fineAmount,
      dietCount: 0 
    });
    await mealHistory.save({ session });

    // Update bill
    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    await Bill.findOneAndUpdate(
      { studentId: student._id, month, year },
      {
        $inc: {
          fines: fineAmount,
          totalBill: fineAmount, // Adding to total bill per user request
        },
      },
      { upsert: true, new: true, session }
    );

    await session.commitTransaction();

    console.log(
      `[Munshi Controller] Fine added: ${fineAmount} for student ${student.rollNo} by munshi ${req.munshi.email}`
    );

    res.status(201).json({
      success: true,
      message: 'Fine added successfully',
      data: {
        amount: fineAmount,
        reason: reason
      }
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('[Munshi Controller] Add fine error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  } finally {
    session.endSession();
  }
};

/**
 * Bulk record diet for multiple students
 * Used for "Mark All" in "Not Taken" list
 * 
 * @route POST /api/munshi/bulk-diet-record
 * @access Private (munshi)
 */
exports.bulkRecordDiet = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { studentIds, mealType } = req.body;
    const hostel = req.munshi.hostel; // Ensure scope to hostel

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ success: false, message: "No students provided." });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    
    // Fetch all students to verify hostel and existence
    const students = await Student.find({
        _id: { $in: studentIds },
        hostelNo: hostel
    }).session(session);

    let successCount = 0;
    const errors = [];
    const rateDoc = await MealRate.findOne({
  hostel: String(hostel).toUpperCase(),
}).session(session);

const mealRate = rateDoc?.rate || 0;

    for (const student of students) {
        try {
            // 1. Check Mess Off Status
            const messOff = await MessOff.findOne({
                studentId: student._id,
                status: 'Approved',
                fromDate: { $lte: new Date() },
                toDate: { $gte: todayStart }
            }).session(session);

            if (messOff) {
                continue;
            }

            // 2. Check if already taken
            const existingDiet = await ExtraOrder.findOne({
                studentId: student._id,
                mealType: mealType,
                date: { $gte: todayStart },
                dietCount: { $gt: 0 }
            }).session(session);

            if (existingDiet) {
                continue;
            }

            // 3. Create Order
            const isSnack = mealType.toLowerCase().startsWith("snack");
const itemName = isSnack
  ? "Standard Snack (Due To Mess On)"
  : "Standard Diet (Due To Mess On)";
const dietCount = isSnack ? 0 : 1;
const dietCharge = isSnack ? 0 : mealRate * dietCount;

           const order = new ExtraOrder({
  studentId: student._id,
  items: [
    {
      name: itemName,
      qty: 1,
      price: dietCharge,
    },
  ],
  totalAmount: dietCharge,
  mealType: mealType,
  dietCount: dietCount,
});
            await order.save({ session });

            // 4. Create Meal History
            const mealHistory = new MealHistory({
                studentId: student._id,
                date: new Date(),
                type: (mealType || 'breakfast').charAt(0).toUpperCase() + (mealType || 'breakfast').slice(1),
                items: [
  {
    name: itemName,
    qty: 1,
    price: dietCharge,
  },
],
totalCost: dietCharge,
                totalCost: 0,
                dietCount: dietCount
            });
            await mealHistory.save({ session });

            // 5. Update Bill (Only increment mealCount if NOT snack)
            if (!isSnack) {
                const month = new Date().getMonth() + 1;
                const year = new Date().getFullYear();

                await Bill.findOneAndUpdate(
                    { studentId: student._id, month, year },
                    {
                        $inc: {
                          mealCount: 1,
                          mealCharges: dietCharge,
                          totalBill: dietCharge,
                        },
                    },
                    { upsert: true, new: true, session }
                );
            }

            successCount++;

        } catch (innerErr) {
            console.error(`Failed to process student ${student._id}:`, innerErr);
            errors.push(student.rollNo);
        }
    }

    await session.commitTransaction();

    res.json({
        success: true,
        message: `Successfully marked diet for ${successCount} students.`,
        data: {
            successCount,
            totalRequested: studentIds.length
        }
    });

  } catch (error) {
    await session.abortTransaction();
    console.error('[Munshi Controller] Bulk diet record error:', error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR
    });
  } finally {
    session.endSession();
  }
};

module.exports = exports;

// ==================== DELETE ORDER ====================

/**
 * Delete an order/diet entry
 * 
 * @route DELETE /api/munshi/orders/:id
 * @access Private (munshi)
 */
exports.deleteOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const order = await ExtraOrder.findById(id).session(session);

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Verify student belongs to munshi's hostel (security check)
    const student = await Student.findById(order.studentId).session(session);
    if (!student || student.hostelNo !== req.munshi.hostel) {
       await session.abortTransaction();
       return res.status(403).json({ success: false, message: 'Unauthorized access to student data' });
    }

    // 1. Revert Bill changes
    const orderDate = new Date(order.date);
    const month = orderDate.getMonth() + 1;
    const year = orderDate.getFullYear();

    const bill = await Bill.findOne({ 
      studentId: order.studentId, 
      month, 
      year 
    }).session(session);

    if (bill) {
      if (order.dietCount > 0) {
        bill.mealCount = Math.max(0, bill.mealCount - order.dietCount);
      }
      
      bill.extras = Math.max(0, bill.extras - order.totalAmount);
      bill.totalBill = Math.max(0, bill.totalBill - order.totalAmount);
      
      await bill.save({ session });
    }

    // 2. Remove from MealHistory (if applicable)
    const type = order.mealType ? order.mealType.charAt(0).toUpperCase() + order.mealType.slice(1) : null;
    
    if (type) {
       // Using a 1-minute window because MealHistory and ExtraOrder 
       // are created with new Date() independently and millisecond values differ.
       const dateMin = new Date(order.date.getTime() - 60000);
       const dateMax = new Date(order.date.getTime() + 60000);

       await MealHistory.findOneAndDelete({
         studentId: order.studentId,
         date: { $gte: dateMin, $lte: dateMax },
         type: type
       }).sort({ date: -1 }).session(session);
    }

    // 3. Delete the ExtraOrder
    await ExtraOrder.findByIdAndDelete(id).session(session);

    await session.commitTransaction();
    res.json({ success: true, message: 'Order deleted successfully' });

  } catch (error) {
    await session.abortTransaction();
    console.error('Delete order error:', error);
    res.status(500).json({ success: false, message: 'Server error during deletion' });
  } finally {
    session.endSession();
  }
};
