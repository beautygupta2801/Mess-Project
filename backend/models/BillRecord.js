const mongoose = require("mongoose");

const billRecordSchema = new mongoose.Schema({
  hostel: {
    type: String,
    required: true,
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Munshi",
    required: true,
  },
  // Either month OR date range
  month: {
    type: String, // Format: YYYY-MM
  },
  fromDate: {
    type: Date,
  },
  toDate: {
    type: Date,
  },
  mealRate: {
    type: Number,
    required: true,
  },
  billItems: [
    {
      name: String,
      amount: Number,
      selectedStudents: [String], // Array of student IDs, null means all students
    },
  ],
  studentCount: {
    type: Number,
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  generatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Add index for faster queries
billRecordSchema.index({ hostel: 1, generatedAt: -1 });

module.exports = mongoose.model("BillRecord", billRecordSchema);
