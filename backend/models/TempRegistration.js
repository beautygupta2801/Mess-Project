const mongoose = require("mongoose");

const tempRegistrationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  rollNo: {
    type: String,
    required: true,
  },
  hostelNo: {
    type: String,
    default: "Not Assigned",
  },
  roomNo: {
    type: String,
    default: "000",
  },
  phoneNo: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  otpExpires: {
    type: Date,
    required: true,
    index: { expires: 0 }, // Document will be automatically deleted after this time
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model("TempRegistration", tempRegistrationSchema);
