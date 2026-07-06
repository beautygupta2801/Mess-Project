const mongoose = require('mongoose');
const munshiController = require('../controllers/munshiController');
const Student = require('../models/Student');
const ExtraOrder = require('../models/ExtraOrder');
const MessOff = require('../models/MessOff');
require('dotenv').config({ path: 'backend/.env' });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/mess_management";

async function verifySessionStats() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        // Mock Request and Response
        const req = {
            query: { mealType: 'breakfast' },
            munshi: { hostel: 'BH-1' } // Assuming BH-1 is a valid hostel
        };

        const res = {
            json: (data) => {
                console.log("Response Data:", JSON.stringify(data, null, 2));
            },
            status: (code) => {
                console.log("Response Status:", code);
                return res;
            }
        };

        console.log("Testing getSessionStats...");
        await munshiController.getSessionStats(req, res);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

verifySessionStats();
