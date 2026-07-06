const mongoose = require("mongoose");

const mealRateSchema = new mongoose.Schema(
  {
    hostel: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MealRate", mealRateSchema);