const mongoose = require('mongoose');

const extraItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'Snacks', // default category
    },
    image: {
      type: String,
      default: '', // URL to image
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    munshiId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Munshi',
      required: false // Optional for backward compatibility with existing items
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ExtraItem', extraItemSchema);
