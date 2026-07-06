const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    mealType: {
      type: String,
      enum: ['breakfast', 'lunch', 'snacks', 'dinner'],
      required: true,
    },
    mealName: {
      type: String,
      trim: true,
    },
    rating: {
      type: String,
      enum: ['Excellent', 'Good', 'Average', 'Poor'],
      required: true,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ studentId: 1, date: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);

