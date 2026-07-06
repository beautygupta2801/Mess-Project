const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Student = require('../models/Student');

dotenv.config({ path: path.join(__dirname, '../.env') });

const debugStudent = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mess_management';
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const rollNo = '22103084';
    const student = await Student.findOne({ rollNo });

    if (!student) {
      console.log(`Student with rollNo ${rollNo} not found.`);
    } else {
      console.log('Student Found:');
      console.log('ID:', student._id);
      console.log('Name:', student.name);
      console.log('RollNo:', student.rollNo);
      console.log('RoomNo Raw:', `"${student.roomNo}"`); // Quote to see empty string/spaces
      console.log('RoomNo Type:', typeof student.roomNo);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
};

debugStudent();
