
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');

async function listStudents() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const students = await Student.find({}, 'name email rollNo').limit(10);
    console.log('Students in database:');
    students.forEach(s => console.log(`- ${s.name} (${s.email}) ROll: ${s.rollNo}`));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

listStudents();
