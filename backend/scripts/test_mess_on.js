const mongoose = require('mongoose');
const munshiController = require('../controllers/munshiController');
const Student = require('../models/Student');
const MessOff = require('../models/MessOff');
require('dotenv').config({ path: 'backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mess_management";

async function verifyMessOn() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        // 1. Find a student with active Mess Off (or create one for testing)
        // For safety, let's look for one first.
        const today = new Date();
        today.setHours(0,0,0,0);
        
        let messOff = await MessOff.findOne({
            status: 'Approved',
            fromDate: { $lte: new Date() },
            toDate: { $gte: today }
        });

        let studentId;

        if (!messOff) {
            console.log("No active mess off found. Please create one manually or run this test when data exists.");
            // Ideally we would create a mock mess off here, but for now just logging.
             // Let's create a dummy student and mess off
             const student = await Student.findOne();
             if(student) {
                 const mo = new MessOff({
                     studentId: student._id,
                     fromDate: new Date(),
                     toDate: new Date(new Date().setDate(new Date().getDate() + 5)),
                     status: 'Approved'
                 });
                 await mo.save();
                 console.log("Created mock Mess Off for student:", student.name);
                 studentId = student._id.toString();
             } else {
                 console.log("No students found.");
                 return;
             }
        } else {
            studentId = messOff.studentId.toString();
            console.log("Found active Mess Off for student ID:", studentId);
        }

        // Mock Request and Response
        const req = {
            body: { studentId: studentId },
            munshi: { hostel: 'BH-1' } // adjust if needed, controller checks hostel
        };
        // We need to make sure the student belongs to this hostel.
        const student = await Student.findById(studentId);
        req.munshi.hostel = student.hostelNo;


        const res = {
            json: (data) => {
                console.log("Mess On Response Data:", JSON.stringify(data, null, 2));
            },
            status: (code) => {
                console.log("Mess On Response Status:", code);
                return res;
            }
        };

        console.log("Testing enableMessOn...");
        await munshiController.enableMessOn(req, res);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

verifyMessOn();
