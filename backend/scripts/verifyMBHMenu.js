/**
 * Verify MBH menu upload to MongoDB
 * Run from backend dir: node scripts/verifyMBHMenu.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const MenuPage = require('../models/MenuPage');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mess_management';

async function verifyMenu() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const menu = await MenuPage.findOne({ isActive: true });
    
    if (!menu) {
      console.log('❌ No active menu found in database!');
      process.exit(1);
    }

    console.log('✅ Active menu found!');
    console.log('Menu ID:', menu._id);
    console.log('Created:', menu.createdAt);
    console.log('Updated:', menu.updatedAt);
    console.log('\nWeekly Menu:');
    menu.weeklyMenu.forEach(day => {
      console.log(`  ${day.day}:`);
      console.log(`    Breakfast: ${day.breakfast.join(', ')}`);
      console.log(`    Lunch: ${day.lunch.join(', ')}`);
      console.log(`    Snacks: ${day.snacks.join(', ')}`);
      console.log(`    Dinner: ${day.dinner.join(', ')}`);
    });

    console.log('\nDaily Items:');
    menu.dailyItems.forEach(section => {
      console.log(`  ${section.name}: ${section.items.join(', ')}`);
    });

    console.log('\nExtra Items:');
    menu.extraItems.forEach(section => {
      console.log(`  ${section.name}: ${section.items.join(', ')}`);
    });

    console.log('\nHostels:');
    console.log('  Boys:', menu.hostels.boys.join(', '));
    console.log('  Girls:', menu.hostels.girls.join(', '));

    await mongoose.connection.close();
    console.log('\n✅ Verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

verifyMenu();
