require('dotenv').config();
const mongoose = require('mongoose');
const Munshi = require('../models/Munshi');

async function createMunshi() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB\n');

    // Check if munshi already exists
    const existing = await Munshi.findOne({ email: 'munshi@bh1.com' });
    if (existing) {
      console.log('✓ Munshi already exists');
      console.log(`   Email: ${existing.email}`);
      console.log(`   Hostel: ${existing.hostel}`);
      process.exit(0);
    }

    // Create new munshi
    const munshi = new Munshi({
      name: 'Test Munshi BH-1',
      email: 'munshi@bh1.com',
      password: 'password123',
      hostel: 'BH-1',
      type: 'munshi'
    });

    await munshi.save();

    console.log('✅ Munshi created successfully!');
    console.log(`   Email: ${munshi.email}`);
    console.log(`   Password: password123`);
    console.log(`   Hostel: ${munshi.hostel}`);
    console.log(`   Type: ${munshi.type}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating munshi:', error.message);
    process.exit(1);
  }
}

createMunshi();
