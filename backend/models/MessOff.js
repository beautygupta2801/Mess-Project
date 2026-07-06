const mongoose = require('mongoose');

const messOffSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    fromDate: {
      type: Date,
      required: true,
    },
    toDate: {
      type: Date,
      required: true,
    },
    meals: [
      {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner'],
      },
    ],
    reason: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
    approvedAt: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model('MessOff', messOffSchema);

