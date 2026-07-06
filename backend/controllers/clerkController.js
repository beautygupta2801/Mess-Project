const ExcelJS = require("exceljs");
const Student = require("../models/Student");
const MealHistory = require("../models/MealHistory");
const ExtraOrder = require("../models/ExtraOrder");
const BillRecord = require("../models/BillRecord");
const MealRate = require("../models/MealRate");
const Bill = require("../models/Bill");
// Helper: parse month string YYYY-MM to start and end Date matching studentController logic
function parseMonth(monthStr) {
  // expect YYYY-MM
  const [y, m] = monthStr.split("-").map(Number);
  if (!y || !m) return null;
  
  // Logic from studentController to ensure exact consistency
  // Month is 1-based (m).
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 0, 23, 59, 59, 999);
  
  return { start, end };
}

exports.getStudentsForMonth = async (req, res) => {
  try {
    const hostel = req.hostel || req.clerk?.hostel;
    if (!hostel)
      return res
        .status(401)
        .json({ success: false, message: "Hostel not found on clerk account" });

    const { month } = req.query;
    if (!month)
      return res
        .status(400)
        .json({
          success: false,
          message: 'Query parameter "month" is required (format: YYYY-MM)',
        });

    const range = parseMonth(month);
    if (!range)
      return res
        .status(400)
        .json({ success: false, message: "Invalid month format. Use YYYY-MM" });

    // Fetch students from this hostel
    const students = await Student.find({
      hostelNo: new RegExp("^" + hostel + "$", "i"),
    })
      .select("roomNo name rollNo")
      .lean();

    const studentIds = students.map((s) => s._id);

    // Aggregate meal counts per student
    // Using $lte to match studentController logic exactly
    const meals = await MealHistory.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: range.start, $lte: range.end },
        },
      },
      { 
        $group: { 
            _id: "$studentId", 
            dietCount: { $sum: { $ifNull: ["$dietCount", 0] } } 
        } 
      },
    ]);

    const mealMap = new Map(meals.map((m) => [String(m._id), m.dietCount]));

    // Aggregate extras
    const extras = await ExtraOrder.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: range.start, $lt: range.end },
        },
      },
      { $group: { _id: "$studentId", extraTotal: { $sum: "$totalAmount" } } },
    ]);

    const extraMap = new Map(extras.map((e) => [String(e._id), e.extraTotal]));

    const result = students.map((s, idx) => ({
      serial: idx + 1,
      studentId: s._id,
      roomNo: s.roomNo,
      name: s.name,
      rollNo: s.rollNo,
      diet: mealMap.get(String(s._id)) || 0,
      extra: extraMap.get(String(s._id)) || 0,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Error in getStudentsForMonth:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.generateMonthlyBill = async (req, res) => {
  try {
    const hostel = req.hostel || req.clerk?.hostel;
    if (!hostel)
      return res
        .status(401)
        .json({ success: false, message: "Hostel not found on clerk account" });

    const { month, dietRate, billItems } = req.body;
    
    // billItems: array of { name: string, amount: number }

    if (!month)
      return res
        .status(400)
        .json({
          success: false,
          message: 'Body param "month" is required (format: YYYY-MM)',
        });
    if (dietRate === undefined)
      return res
        .status(400)
        .json({ success: false, message: 'Body param "dietRate" is required' });

    const range = parseMonth(month);
    if (!range)
      return res
        .status(400)
        .json({ success: false, message: "Invalid month format. Use YYYY-MM" });

    const students = await Student.find({
      hostelNo: new RegExp("^" + hostel + "$", "i"),
    })
      .select("roomNo name rollNo")
      .lean();

    if (!students.length)
      return res
        .status(404)
        .json({ success: false, message: "No students found for this hostel" });

    const studentIds = students.map((s) => s._id);

    const meals = await MealHistory.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: range.start, $lte: range.end },
        },
      },
      { 
        $group: { 
            _id: "$studentId", 
            dietCount: { $sum: { $ifNull: ["$dietCount", 0] } } 
        } 
      },
    ]);

    const mealMap = new Map(meals.map((m) => [String(m._id), m.dietCount]));

    const extras = await ExtraOrder.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: range.start, $lt: range.end },
        },
      },
      { $group: { _id: "$studentId", extraTotal: { $sum: "$totalAmount" } } },
    ]);

    const extraMap = new Map(extras.map((e) => [String(e._id), e.extraTotal]));

    // Build Excel
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Bill");

    const columns = [
      { header: "Serial No", key: "serial", width: 10 },
      { header: "Room No", key: "roomNo", width: 12 },
      { header: "Name", key: "name", width: 30 },
      { header: "Roll No", key: "rollNo", width: 18 },
      { header: "Diet", key: "diet", width: 10 },
      { header: "Diet Rate", key: "dietRate", width: 12 },
      { header: "DietRate × Diet", key: "dietTotal", width: 16 },
      { header: "Extra", key: "extra", width: 12 },
    ];

    // Add dynamic columns for bill items
    let billItemsTotal = 0;
    const safeBillItems = Array.isArray(billItems) ? billItems : [];
    
    safeBillItems.forEach((item, index) => {
        columns.push({ header: item.name, key: `item_${index}`, width: 15 });
        billItemsTotal += Number(item.amount) || 0;
    });
    
    columns.push({ header: "Total Bill", key: "total", width: 14 });

    console.log("Generated Columns:", JSON.stringify(columns.map(c => c.header)));

    ws.columns = columns;

    students.forEach((s, idx) => {
      const diet = mealMap.get(String(s._id)) || 0;
      const extra = extraMap.get(String(s._id)) || 0;
      const dietTotal = Number(diet) * Number(dietRate);
      
      // Calculate bill items total for THIS student only
      let studentBillItemsTotal = 0;
      safeBillItems.forEach((item) => {
        // Check if this student is selected for this item
        // If selectedStudents is null/undefined, apply to all students
        // If selectedStudents exists, only apply if student ID is in the array
        if (!item.selectedStudents || item.selectedStudents.includes(String(s._id))) {
          studentBillItemsTotal += Number(item.amount) || 0;
        }
      });
      
      const total = dietTotal + Number(extra) + studentBillItemsTotal;

      const row = {
        serial: idx + 1,
        roomNo: s.roomNo,
        name: s.name,
        rollNo: s.rollNo,
        diet,
        dietRate: Number(dietRate),
        dietTotal,
        extra,
        total,
      };

      // Add dynamic item amounts to row (0 if student not selected)
      safeBillItems.forEach((item, index) => {
          // Check if this student should be charged for this item
          if (!item.selectedStudents || item.selectedStudents.includes(String(s._id))) {
            row[`item_${index}`] = Number(item.amount);
          } else {
            row[`item_${index}`] = 0;  // Student not selected for this item
          }
      });

      ws.addRow(row);
    });

    // Formatting - make numeric columns numbers
    // Base numeric columns
    // Serial (1), Room (2), Name (3), Roll (4) are typically text.
    // Diet (5) onwards usually numbers.
    ws.columns.forEach((col, index) => {
        if (index >= 4) { // 0-indexed, so 5th column (Diet) onwards
            col.numFmt = "#,##0.00";
        }
    });

    const safeHostelName = String(hostel).replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${safeHostelName}_${month}_Bill.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
    console.log(`Bill generated successfully: ${filename}`);
    
    // Save bill record to database (async, don't wait)
    try {
      const totalAmount = students.reduce((sum, s) => {
        const diet = mealMap.get(String(s._id)) || 0;
        const extra = extraMap.get(String(s._id)) || 0;
        const dietTotal = Number(diet) * Number(dietRate);
        
        let studentBillItemsTotal = 0;
        safeBillItems.forEach((item) => {
          if (!item.selectedStudents || item.selectedStudents.includes(String(s._id))) {
            studentBillItemsTotal += Number(item.amount) || 0;
          }
        });
        
        return sum + dietTotal + Number(extra) + studentBillItemsTotal;
      }, 0);
      
      await BillRecord.create({
        hostel,
        generatedBy: req.clerk?._id || req.user?._id,
        month,
        mealRate: Number(dietRate),
        billItems: safeBillItems,
        studentCount: students.length,
        totalAmount,
      });
      console.log(`Bill record saved for ${month}`);
    } catch (saveErr) {
      console.error("Error saving bill record:", saveErr);
      // Don't fail the request if saving fails
    }
  } catch (err) {
    console.error("Error in generateMonthlyBill:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const hostel = req.hostel || req.clerk?.hostel;
    if (!hostel) return res.status(401).json({ success: false, message: "Hostel not found" });

    const students = await Student.find({
      hostelNo: new RegExp("^" + hostel + "$", "i"),
    })
      .select("name rollNo roomNo isVerified email phoneNo")
      .sort({ roomNo: 1 })
      .lean();

    res.json({ success: true, data: students });
  } catch (err) {
    console.error("Error in getAllStudents:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.verifyStudent = async (req, res) => {
  try {
    const { studentId, action } = req.body; // action: 'approve' or 'reject'
    const hostel = req.hostel || req.clerk?.hostel;

    if (!hostel) return res.status(401).json({ success: false, message: "Hostel not found" });

    const student = await Student.findOne({ _id: studentId, hostelNo: new RegExp("^" + hostel + "$", "i") });
    if (!student) return res.status(404).json({ success: false, message: "Student not found" });

    if (action === "approve") {
      student.isVerified = true;
      await student.save();
      return res.json({ success: true, message: "Student verified successfully" });
    } else if (action === "reject") {
      await Student.findByIdAndDelete(studentId);
      return res.json({ success: true, message: "Student rejected and removed" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }
  } catch (err) {
    console.error("Error in verifyStudent:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Helper: parse date range
function parseDateRange(fromDate, toDate) {
  const start = new Date(fromDate);
  const end = new Date(toDate);
  end.setHours(23, 59, 59, 999); // Include the entire end date
  return { start, end };
}

exports.getStudentsForDateRange = async (req, res) => {
  try {
    const hostel = req.hostel || req.clerk?.hostel;
    if (!hostel)
      return res
        .status(401)
        .json({ success: false, message: "Hostel not found on clerk account" });

    const { fromDate, toDate } = req.query;
    if (!fromDate || !toDate)
      return res
        .status(400)
        .json({
          success: false,
          message: 'Query parameters "fromDate" and "toDate" are required (format: YYYY-MM-DD)',
        });

    const range = parseDateRange(fromDate, toDate);

    // Fetch students from this hostel
    const students = await Student.find({
      hostelNo: new RegExp("^" + hostel + "$", "i"),
    })
      .select("roomNo name rollNo")
      .lean();

    const studentIds = students.map((s) => s._id);

    // Aggregate meal counts per student
    // Aggregate meal counts per student
    const meals = await MealHistory.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: range.start, $lte: range.end },
        },
      },
      { 
        $group: { 
            _id: "$studentId", 
            dietCount: { $sum: { $ifNull: ["$dietCount", 0] } } 
        } 
      },
    ]);

    const mealMap = new Map(meals.map((m) => [String(m._id), m.dietCount]));

    // Aggregate extras
    const extras = await ExtraOrder.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: range.start, $lt: range.end },
        },
      },
      { $group: { _id: "$studentId", extraTotal: { $sum: "$totalAmount" } } },
    ]);

    const extraMap = new Map(extras.map((e) => [String(e._id), e.extraTotal]));

    const result = students.map((s, idx) => ({
      serial: idx + 1,
      studentId: s._id,
      roomNo: s.roomNo,
      name: s.name,
      rollNo: s.rollNo,
      diet: mealMap.get(String(s._id)) || 0,
      extra: extraMap.get(String(s._id)) || 0,
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    console.error("Error in getStudentsForDateRange:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.generateBillForDateRange = async (req, res) => {
  try {
    const hostel = req.hostel || req.clerk?.hostel;
    if (!hostel)
      return res
        .status(401)
        .json({ success: false, message: "Hostel not found on clerk account" });

    const { fromDate, toDate, dietRate, billItems } = req.body;

    if (!fromDate || !toDate)
      return res
        .status(400)
        .json({
          success: false,
          message: 'Body params "fromDate" and "toDate" are required (format: YYYY-MM-DD)',
        });
    if (dietRate === undefined)
      return res
        .status(400)
        .json({ success: false, message: 'Body param "dietRate" is required' });

    const range = parseDateRange(fromDate, toDate);

    const students = await Student.find({
      hostelNo: new RegExp("^" + hostel + "$", "i"),
    })
      .select("roomNo name rollNo")
      .lean();

    if (!students.length)
      return res
        .status(404)
        .json({ success: false, message: "No students found for this hostel" });

    const studentIds = students.map((s) => s._id);

    const meals = await MealHistory.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: range.start, $lte: range.end },
        },
      },
      { 
        $group: { 
            _id: "$studentId", 
            dietCount: { $sum: { $ifNull: ["$dietCount", 0] } } 
        } 
      },
    ]);

    const mealMap = new Map(meals.map((m) => [String(m._id), m.dietCount]));

    const extras = await ExtraOrder.aggregate([
      {
        $match: {
          studentId: { $in: studentIds },
          date: { $gte: range.start, $lt: range.end },
        },
      },
      { $group: { _id: "$studentId", extraTotal: { $sum: "$totalAmount" } } },
    ]);

    const extraMap = new Map(extras.map((e) => [String(e._id), e.extraTotal]));

    // Build Excel
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet("Bill");

    const columns = [
      { header: "Serial No", key: "serial", width: 10 },
      { header: "Room No", key: "roomNo", width: 12 },
      { header: "Name", key: "name", width: 30 },
      { header: "Roll No", key: "rollNo", width: 18 },
      { header: "Diet", key: "diet", width: 10 },
      { header: "Diet Rate", key: "dietRate", width: 12 },
      { header: "DietRate × Diet", key: "dietTotal", width: 16 },
      { header: "Extra", key: "extra", width: 12 },
    ];

    // Add dynamic columns for bill items
    const safeBillItems = Array.isArray(billItems) ? billItems : [];
    
    safeBillItems.forEach((item, index) => {
        columns.push({ header: item.name, key: `item_${index}`, width: 15 });
    });
    
    columns.push({ header: "Total Bill", key: "total", width: 14 });

    ws.columns = columns;

    students.forEach((s, idx) => {
      const diet = mealMap.get(String(s._id)) || 0;
      const extra = extraMap.get(String(s._id)) || 0;
      const dietTotal = Number(diet) * Number(dietRate);
      
      // Calculate bill items total for THIS student only
      let studentBillItemsTotal = 0;
      safeBillItems.forEach((item) => {
        if (!item.selectedStudents || item.selectedStudents.includes(String(s._id))) {
          studentBillItemsTotal += Number(item.amount) || 0;
        }
      });
      
      const total = dietTotal + Number(extra) + studentBillItemsTotal;

      const row = {
        serial: idx + 1,
        roomNo: s.roomNo,
        name: s.name,
        rollNo: s.rollNo,
        diet,
        dietRate: Number(dietRate),
        dietTotal,
        extra,
        total,
      };

      // Add dynamic item amounts to row (0 if student not selected)
      safeBillItems.forEach((item, index) => {
          if (!item.selectedStudents || item.selectedStudents.includes(String(s._id))) {
            row[`item_${index}`] = Number(item.amount);
          } else {
            row[`item_${index}`] = 0;
          }
      });

      ws.addRow(row);
    });

    // Formatting
    ws.columns.forEach((col, index) => {
        if (index >= 4) {
            col.numFmt = "#,##0.00";
        }
    });

    const safeHostelName = String(hostel).replace(/[^a-zA-Z0-9_-]/g, "_");
    const filename = `${safeHostelName}_${fromDate}_to_${toDate}_Bill.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    res.end();
    console.log(`Bill generated successfully: ${filename}`);
    
    // Save bill record to database (async, don't wait)
    try {
      const totalAmount = students.reduce((sum, s) => {
        const diet = mealMap.get(String(s._id)) || 0;
        const extra = extraMap.get(String(s._id)) || 0;
        const dietTotal = Number(diet) * Number(dietRate);
        
        let studentBillItemsTotal = 0;
        safeBillItems.forEach((item) => {
          if (!item.selectedStudents || item.selectedStudents.includes(String(s._id))) {
            studentBillItemsTotal += Number(item.amount) || 0;
          }
        });
        
        return sum + dietTotal + Number(extra) + studentBillItemsTotal;
      }, 0);
      
      await BillRecord.create({
        hostel,
        generatedBy: req.clerk?._id || req.user?._id,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
        mealRate: Number(dietRate),
        billItems: safeBillItems,
        studentCount: students.length,
        totalAmount,
      });
      console.log(`Bill record saved for ${fromDate} to ${toDate}`);
    } catch (saveErr) {
      console.error("Error saving bill record:", saveErr);
      // Don't fail the request if saving fails
    }
  } catch (err) {
    console.error("Error in generateBillForDateRange:", err);
    res.status(500).json({ success: false, message: "Server error: " + err.message });
  }
};

exports.getBillHistory = async (req, res) => {
  try {
    const hostel = req.hostel || req.clerk?.hostel;
    if (!hostel)
      return res
        .status(401)
        .json({ success: false, message: "Hostel not found on clerk account" });

    const billRecords = await BillRecord.find({ hostel })
      .sort({ generatedAt: -1 })
      .limit(100)
      .lean();

    // Format the response
    const formattedRecords = billRecords.map((record) => ({
      _id: record._id,
      period: record.month || `${record.fromDate.toISOString().split('T')[0]} to ${record.toDate.toISOString().split('T')[0]}`,
      type: record.month ? 'monthly' : 'daterange',
      month: record.month,
      fromDate: record.fromDate,
      toDate: record.toDate,
      mealRate: record.mealRate,
      billItems: record.billItems,
      studentCount: record.studentCount,
      totalAmount: record.totalAmount,
      generatedAt: record.generatedAt,
    }));

    res.json({ success: true, data: formattedRecords });
  } catch (err) {
    console.error("Error in getBillHistory:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.deleteBillRecord = async (req, res) => {
  try {
    const hostel = req.hostel || req.clerk?.hostel;
    if (!hostel)
      return res
        .status(401)
        .json({ success: false, message: "Hostel not found on clerk account" });

    const { id } = req.params;

    const deletedRecord = await BillRecord.findOneAndDelete({ _id: id, hostel });

    if (!deletedRecord) {
      return res.status(404).json({ success: false, message: "Bill record not found or not authorized to delete" });
    }

    res.json({ success: true, message: "Bill record deleted successfully" });
  } catch (err) {
    console.error("Error in deleteBillRecord:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
exports.saveMealRate = async (req, res) => {
  try {
    const hostel = req.hostel || req.clerk?.hostel;
    if (!hostel) {
      return res.status(401).json({
        success: false,
        message: "Hostel not found on clerk account",
      });
    }

    const { rate } = req.body;

    if (rate === undefined || rate === null || Number(rate) < 0) {
      return res.status(400).json({
        success: false,
        message: "Valid meal rate is required",
      });
    }

    const saved = await MealRate.findOneAndUpdate(
      { hostel: String(hostel).toUpperCase() },
      { $set: { rate: Number(rate) } },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      message: "Meal rate saved successfully",
      data: saved,
    });
  } catch (err) {
    console.error("Error in saveMealRate:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getMealRate = async (req, res) => {
  try {
    const hostel = req.hostel || req.clerk?.hostel;
    if (!hostel) {
      return res.status(401).json({
        success: false,
        message: "Hostel not found on clerk account",
      });
    }

    const rateDoc = await MealRate.findOne({
      hostel: String(hostel).toUpperCase(),
    }).lean();

    return res.json({
      success: true,
      data: {
        rate: rateDoc?.rate || 0,
      },
    });
  } catch (err) {
    console.error("Error in getMealRate:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
