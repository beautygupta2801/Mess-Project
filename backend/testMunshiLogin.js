/**
 * Test Munshi Login
 * Quick script to test if munshi login credentials work
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Munshi = require('./models/Munshi');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mess_management';
const testEmail = 'munshi@bh1.mess';
const testPassword = 'munshi123';

async function testLogin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    // Find munshi with password field
    console.log(`Looking for munshi: ${testEmail}`);
    const munshi = await Munshi.findOne({ email: testEmail }).select('+password');
    
    if (!munshi) {
      console.log('❌ Munshi not found!');
      process.exit(1);
    }

    console.log('✅ Munshi found:');
    console.log(`   ID: ${munshi._id}`);
    console.log(`   Name: ${munshi.name}`);
    console.log(`   Email: ${munshi.email}`);
    console.log(`   Hostel: ${munshi.hostel}`);
    console.log(`   Active: ${munshi.isActive}`);
    console.log(`   Has password: ${!!munshi.password}`);
    console.log(`   Password hash length: ${munshi.password?.length || 0}\n`);

    // Test password comparison
    console.log(`Testing password: "${testPassword}"`);
    const isValid = await munshi.comparePassword(testPassword);
    
    if (isValid) {
      console.log('✅ Password is CORRECT!');
      console.log('\n🎉 Login should work with these credentials:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
    } else {
      console.log('❌ Password is INCORRECT!');
      console.log('   The password in database does not match "munshi123"');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

testLogin();
