const mongoose = require("mongoose");

const extraSchema = new mongoose.Schema(
  {
    hostel: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByModel",
      default: null,
    },
    createdByModel: {
      type: String,
      enum: ["Clerk"],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

extraSchema.index({ hostel: 1 });
extraSchema.index({ hostel: 1, isAvailable: 1 });

module.exports = mongoose.model("Extra", extraSchema);