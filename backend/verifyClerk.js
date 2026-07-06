require('dotenv').config();
const mongoose = require('mongoose');
const Munshi = require('./models/Munshi');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mess_management';

async function verify() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const clerk = await Munshi.findOne({ email: 'clerk@bh1.mess' });
    
    if (clerk) {
      console.log('✅ Clerk found:');
      console.log(`   Name: ${clerk.name}`);
      console.log(`   Email: ${clerk.email}`);
      console.log(`   Type: ${clerk.type}`);
      console.log(`   Hostel: ${clerk.hostel}`);
    } else {
      console.log('❌ Clerk NOT found');
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error(err);
    await mongoose.connection.close();
  }
}

verify();
