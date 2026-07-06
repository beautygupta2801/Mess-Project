const mongoose = require('mongoose');

const billSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user/student/student',
      required: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    mealCharges: {
      type: Number,
      default: 0,
    },
    fines: {
      type: Number,
      default: 0,
    },
    extras: {
      type: Number,
      default: 0,
    },
    totalBill: {
      type: Number,
      default: 0,
    },
    mealCount: {
      type: Number,
      default: 0,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: Date,
  },
  { timestamps: true }
);

// Ensure single bill per student per month
billSchema.index({ studentId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Bill', billSchema);

