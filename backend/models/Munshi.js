const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const munshiSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Munshi name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
      select: false,
    },
    hostel: {
      type: String,
      required: [true, 'Hostel assignment is required'],
      trim: true,
      uppercase: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

munshiSchema.index({ hostel: 1 });
munshiSchema.index({ hostel: 1, isActive: 1 });

munshiSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

munshiSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

munshiSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpiry;
  delete obj.__v;
  return obj;
};

munshiSchema.statics.findActiveByHostel = function (hostelName) {
  return this.find({
    hostel: hostelName.toUpperCase(),
    isActive: true,
  }).select('-password');
};

munshiSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

module.exports = mongoose.model('Munshi', munshiSchema);