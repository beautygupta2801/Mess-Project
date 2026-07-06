/**
 * Seed the public menu page with default data.
 * Run from backend dir: node scripts/seedMenuPage.js
 * Requires: MONGODB_URI in .env or defaults to mongodb://localhost:27017/mess_management
 */
require('dotenv').config();
const mongoose = require('mongoose');
const MenuPage = require('../models/MenuPage');
const { DEFAULT_MENU_PAGE } = require('../controllers/menuPageController');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mess_management';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  const existing = await MenuPage.findOne({ isActive: true });
  if (existing) {
    console.log('Active menu page already exists. Skipping seed.');
    process.exit(0);
    return;
  }
  await MenuPage.create({
    weeklyMenu: DEFAULT_MENU_PAGE.weeklyMenu,
    dailyItems: DEFAULT_MENU_PAGE.dailyItems,
    extraItems: DEFAULT_MENU_PAGE.extraItems,
    hostels: DEFAULT_MENU_PAGE.hostels,
    isActive: true,
  });
  console.log('Menu page seeded successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
