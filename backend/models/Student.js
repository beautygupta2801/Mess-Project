// const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// const studentSchema = new mongoose.Schema({
//     rollNo: {
//         type: String,
//         required: true,
//         unique: true,
//         trim: true
//     },
//     name: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         lowercase: true,
//         trim: true
//     },
//     password: {
//         type: String,
//         required: true,
//         minlength: 6
//     },
//     hostelNo: {
//         type: String,
//         required: true
//     },
//     roomNo: {
//         type: String,
//         required: true
//     },
//     photo: {
//         type: String,
//         default: 'https://placehold.co/100x100/3B82F6/FFF?text=ST'
//     },
//     qrCode: {
//         type: String,
//         unique: true
//     },
//     isActive: {
//         type: Boolean,
//         default: true
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// }, { timestamps: true });

// // Hash password before saving
// studentSchema.pre('save', async function(next) {
//     if (!this.isModified('password')) return next();
    
//     try {
//         const salt = await bcrypt.genSalt(12);
//         this.password = await bcrypt.hash(this.password, salt);
        
//         // Generate QR code if not exists
//         if (!this.qrCode) {
//             this.qrCode = `${this.rollNo}-${this.hostelNo}`;
//         }
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

// // Compare password method
// studentSchema.methods.comparePassword = async function(candidatePassword) {
//     return await bcrypt.compare(candidatePassword, this.password);
// };

// module.exports = mongoose.model('Student', studentSchema);

////
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const studentSchema = new mongoose.Schema({
    rollNo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    phoneNo: {
        type: String,
        required: true,
        trim: true,
        match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number']
    },
    hostelNo: {
        type: String,
        required: true
    },
    roomNo: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        default: 'https://placehold.co/100x100/3B82F6/FFF?text=ST'
    },
    qrCode: {
        type: String,
        unique: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpiry: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Hash password before saving
studentSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        
        // Generate QR code if not exists
        if (!this.qrCode) {
            this.qrCode = `${this.rollNo}-${this.hostelNo}-${this.roomNo}`;
        }
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
studentSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Student', studentSchema);