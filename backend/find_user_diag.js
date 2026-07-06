
require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Munshi = require('./models/Munshi');

async function findUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const s = await Student.findOne({ email: /aditya/i });
    if (s) console.log('Found Student by regex:', s.name, s.email);
    else console.log('No student found with "aditya" in email.');

    const m = await Munshi.findOne({ email: /aditya/i });
    if (m) console.log('Found Munshi by regex:', m.name, m.email);
    else console.log('No munshi found with "aditya" in email.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

findUser();
