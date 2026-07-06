const mongoose = require('mongoose');

const mealHistorySchema = new mongoose.Schema(
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
    type: {
      type: String,
      enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Fine'],
      required: true,
    },
    items: [
      {
        name: String,
        qty: Number,
        price: Number,
      },
    ],
    totalCost: {
      type: Number,
      required: true,
    },
    dietCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

mealHistorySchema.index({ studentId: 1, date: -1 });

module.exports = mongoose.model('MealHistory', mealHistorySchema);

