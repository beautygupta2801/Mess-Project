/**
 * Script to add a test Clerk (Munshi) account to the database
 * 
 * Usage:
 *   node scripts/addClerk.js
 * 
 * Then login with:
 *   Email: clerk@example.com
 *   Password: password123
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Munshi = require('../models/Munshi');

dotenv.config();

async function addClerk() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mess_management');
    console.log('✅ MongoDB Connected\n');

    // Check if clerk already exists
    const existingClerk = await Munshi.findOne({ email: 'clerk@example.com' });
    if (existingClerk) {
      console.log('⚠️  Clerk already exists with email: clerk@example.com');
      console.log('📝 Existing Clerk Details:');
      console.log(JSON.stringify(existingClerk, null, 2));
      process.exit(0);
    }

    // Create new clerk
    const newClerk = new Munshi({
      name: 'John Clerk',
      email: 'clerk@example.com',
      password: 'password123', // Will be hashed by pre-save middleware
      hostel: 'BH-1',
      type: 'clerk', // Set type to 'clerk' to enable clerk dashboard access
      isActive: true,
    });

    await newClerk.save();
    console.log('✅ Clerk account created successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('   Email: clerk@example.com');
    console.log('   Password: password123');
    console.log('   Hostel: BH-1\n');
    console.log('🔗 Login URL: http://localhost:3000/login');
    console.log('🎯 Clerk Dashboard: http://localhost:3000/clerk-dashboard\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding clerk:', error.message);
    process.exit(1);
  }
}

addClerk();
