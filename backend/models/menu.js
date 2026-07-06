const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const menuSchema = new mongoose.Schema(
  {
    hostel: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    day: {
      type: String,
      required: true,
      enum: [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ],
    },
    mealType: {
      type: String,
      required: true,
      enum: ["breakfast", "lunch", "snacks", "dinner"],
    },
    items: {
      type: [menuItemSchema],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr),
        message: "Items must be an array",
      },
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "updatedByModel",
      default: null,
    },
    updatedByModel: {
      type: String,
      enum: ["Munshi", "Clerk"],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// One hostel can have only one record for one day + one mealType
menuSchema.index({ hostel: 1, day: 1, mealType: 1 }, { unique: true });

// Helpful indexes
menuSchema.index({ hostel: 1 });
menuSchema.index({ hostel: 1, isAvailable: 1 });

module.exports = mongoose.model("Menu", menuSchema);