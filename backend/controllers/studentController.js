const PDFDocument = require('pdfkit');
const Student = require('../models/Student');
const MealHistory = require('../models/MealHistory');
const Bill = require('../models/Bill');

const buildStudentResponse = async (student) => {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  let bill = await Bill.findOne({ studentId: student._id, month, year });

  if (!bill) {
    bill = await Bill.create({
      studentId: student._id,
      month,
      year,
      mealCharges: 0,
      fines: 0,
      extras: 0,
      totalBill: 0,
      mealCount: 0,
    });
  }

  // Aggregate actual diet count from MealHistory for accurate real-time data
  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

  // const dietStats = await MealHistory.aggregate([
  //   {
  //     $match: {
  //       studentId: student._id,
  //       date: { $gte: startOfMonth, $lte: endOfMonth }
  //     }
  //   },
  //   {
  //     $group: {
  //       _id: null,
  //       totalDiet: { $sum: "$dietCount" }
  //     }
  //   }
  // ]);
  
  // const calculatedMealCount = dietStats.length > 0 ? dietStats[0].totalDiet : 0;
  const calculatedMealCount=bill.mealCount;
  const meals = await MealHistory.find({ studentId: student._id })
    .sort({ date: -1 })
    .limit(10)
    .lean();

  const mealHistory = meals.map((meal) => {
    const dateObj = new Date(meal.date);
    const timeStr = dateObj.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit', 
      hour12: true 
    });
    return {
      date: meal.date.toISOString().split('T')[0],
      time: timeStr,
      type: meal.type,
      items: meal.items || [],
      totalCost: meal.totalCost || 0,
      dietCount: meal.dietCount || 0
    };
  });

  return {
    id: student._id,
    name: student.name,
    rollNo: student.rollNo,
    hostelNo: student.hostelNo,
    roomNo: student.roomNo,
    email: student.email,
    photo: student.photo,
    qrCode: student.qrCode,
    bill: bill.totalBill,
    bill: bill.totalBill,
    mealCount: calculatedMealCount, // Use aggregated count
    mealHistory,
    mealHistory,
  };
};

// GET /api/student/profile
exports.getProfile = async (req, res) => {
  try {
    const student = await Student.findById(req.student._id);

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const payload = await buildStudentResponse(student);
    return res.json(payload);
  } catch (error) {
    console.error('Get profile error:', error);
    return res
      .status(500)
      .json({ message: 'Server error fetching student profile' });
  }
};

// GET /api/student/meals?month=0-11
exports.getMealHistory = async (req, res) => {
  try {
    const studentId = req.student._id;
    const { month } = req.query;

    const query = { studentId };

    if (month !== undefined) {
      const m = parseInt(month, 10);

      if (!Number.isNaN(m)) {
        const year = new Date().getFullYear();
        const start = new Date(year, m, 1);
        const end = new Date(year, m + 1, 0, 23, 59, 59, 999);
        query.date = { $gte: start, $lte: end };
      }
    }

    const meals = await MealHistory.find(query).sort({ date: -1 }).lean();

    const response = meals.map((meal) => {
      const dateObj = new Date(meal.date);
      const timeStr = dateObj.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
      return {
        date: meal.date.toISOString().split('T')[0],
        time: timeStr,
        type: meal.type,
        items: meal.items || [],
        totalCost: meal.totalCost || 0,
        dietCount: meal.dietCount || 0
      };
    });

    return res.json(response);
  } catch (error) {
    console.error('Get meal history error:', error);
    return res
      .status(500)
      .json({ message: 'Server error fetching meal history' });
  }
};

// GET /api/student/report/download?month=0-11
exports.downloadMealReport = async (req, res) => {
  try {
    const student = req.student;
    const { month } = req.query;

    const now = new Date();
    const m =
      month !== undefined && month !== null
        ? parseInt(month, 10)
        : now.getMonth();
    const year = now.getFullYear();

    const start = new Date(year, m, 1);
    const end = new Date(year, m + 1, 0, 23, 59, 59, 999);

    const meals = await MealHistory.find({
      studentId: student._id,
      date: { $gte: start, $lte: end },
    })
      .sort({ date: 1 })
      .lean();

    const bill = await Bill.findOne({
      studentId: student._id,
      month: m + 1,
      year,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="meal-report-${m + 1}-${year}.pdf"`
    );

    const doc = new PDFDocument();
    doc.pipe(res);//Whatever is written into PDF goes directly to browser

    doc.fontSize(20).text('Meal Report', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Student: ${student.name} (${student.rollNo})`);
    doc.text(`Hostel: ${student.hostelNo}, Room: ${student.roomNo}`);
    doc.text(`Month: ${m + 1}/${year}`);
    doc.moveDown();

    if (!meals.length) {
      doc.text('No meal records found for this month.');
    } else {
      // PDF Table Header
      const startX = 50;
      let y = doc.y;
      
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text('Date', startX, y);
      doc.text('Type', startX + 70, y);
      doc.text('Diet', startX + 130, y);
      doc.text('Extra Items', startX + 170, y);
      doc.text('Total', startX + 350, y, { align: 'right' });
      
      y += 15;
      doc.moveTo(startX, y).lineTo(startX + 400, y).stroke();
      y += 10;

      meals.forEach((meal) => {
        const dateStr = meal.date.toISOString().split('T')[0];
        
        // Ensure new page if content overflows
        if (y > 700) {
            doc.addPage();
            y = 50;
        }

        doc.fontSize(10).font('Helvetica');
        doc.text(dateStr, startX, y);
        doc.text(meal.type, startX + 70, y);
        doc.text(meal.dietCount ? meal.dietCount.toString() : '0', startX + 130, y);
        
        let extraCost = 0;
        if (meal.items && meal.items.length > 0) {
             const itemsText = meal.items.map(i => `${i.name} (x${i.qty})`).join(', ');
             doc.text(itemsText, startX + 170, y, { width: 170 });
             
             // Calculate extra cost for verification/display if needed, but totalCost is stored
             extraCost = meal.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
        } else {
             doc.text('-', startX + 170, y);
        }

        doc.text(`₹${meal.totalCost}`, startX + 350, y, { align: 'right' });
        
        // Move down based on items height if wrapped code needed, or fixed spacing
        y += 20; 
        
      });
    }

    if (bill) {
      doc.addPage();
      doc.fontSize(18).text('Bill Summary', { align: 'center' });
      doc.moveDown();

      doc.fontSize(12).text(`Meal charges: ₹${bill.mealCharges}`);
      doc.text(`Fines: ₹${bill.fines}`);
      doc.text(`Extras: ₹${bill.extras}`);
      doc.text(`Total bill: ₹${bill.totalBill}`);
      doc.text(`Meal count: ${bill.mealCount}`);
      doc.text(`Paid: ${bill.isPaid ? 'Yes' : 'No'}`);
      if (bill.isPaid && bill.paidAt) {
        doc.text(`Paid at: ${bill.paidAt.toISOString()}`);
      }
    }

    doc.end();
  } catch (error) {
    console.error('Download meal report error:', error);
    // If headers already sent while streaming PDF, just end the response
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ message: 'Server error generating meal report' });
    }
    res.end();
  }
};

