const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mess_project', {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => {
    console.log('❌ Error:', err.message);
    process.exit(1);
});

// Student Schema (matching your model)
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
    }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);

// Function to add user
async function addUser(name, email, password, rollNo, hostelNo, roomNo) {
    try {
        // Check if user already exists
        const existingUser = await Student.findOne({ 
            $or: [{ email }, { rollNo }] 
        });

        if (existingUser) {
            console.log('⚠️ User already exists!');
            console.log('📧 Email:', existingUser.email);
            console.log('📝 Roll Number:', existingUser.rollNo);
            console.log('\n💡 To update, delete the old user from MongoDB Compass first.');
            process.exit(0);
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const student = new Student({
            name,
            email,
            password: hashedPassword,
            rollNo,
            hostelNo,
            roomNo,
            qrCode: `${rollNo}${hostelNo}`,
            isActive: true
        });

        await student.save();
        
        console.log('✅ User created successfully!');
        console.log('📧 Email:', email);
        console.log('🔑 Password:', password);
        console.log('📝 Roll Number:', rollNo);
        console.log('🏠 Hostel:', hostelNo);
        console.log('🚪 Room:', roomNo);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Add your users here - CHANGE THESE VALUES
addUser(
    'Kartik Roy',            // name
    'kartikroy@gmail.com',   // email
    'kartikroy123',          // password (plain text - will be hashed)
    '22103084',              // rollNo
    'MBH-A',                 // hostelNo
    '428'                    // roomNo
);