const mongoose = require('mongoose');
const Student = require('./backend/models/Student');
const MealHistory = require('./backend/models/MealHistory');
require('dotenv').config({ path: './backend/.env' });

async function debugDiet() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const rollNo = "22103084"; // Kartik from screenshot
        const student = await Student.findOne({ rollNo: new RegExp(rollNo, 'i') });

        if (!student) {
            console.log("Student not found!");
            return;
        }

        console.log(`Found Student: ${student.name} (ID: ${student._id})`);

        const startOfMonth = new Date(2026, 1, 1); // Feb 1, 2026 (Month is 0-indexed: 1 = Feb)
        const endOfMonth = new Date(2026, 2, 1);   // Mar 1, 2026

        console.log(`Querying records from ${startOfMonth} to ${endOfMonth}`);

        // Find ALL meal history checks
        const meals = await MealHistory.find({
            studentId: student._id,
            date: { $gte: startOfMonth, $lt: endOfMonth }
        });

        console.log(`Total MealHistory records found: ${meals.length}`);
        
        let totalDietCount = 0;
        meals.forEach((m, i) => {
            console.log(`${i+1}. ${m.date.toISOString()} - Type: ${m.mealType} - DietCount: ${m.dietCount} - ID: ${m._id}`);
            totalDietCount += m.dietCount;
        });

        console.log(`\n Calculated Total Diet Count from DB: ${totalDietCount}`);

        // Run Aggregation to verify what backend sees
        const agg = await MealHistory.aggregate([
            {
                $match: {
                    studentId: student._id,
                    date: { $gte: startOfMonth, $lt: endOfMonth }
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$dietCount" },
                    count: { $sum: 1 }
                }
            }
        ]);

        console.log("Aggregation Result:", agg);

    } catch (err) {
        console.error("Error:", err);
    } finally {
        await mongoose.disconnect();
    }
}

debugDiet();
