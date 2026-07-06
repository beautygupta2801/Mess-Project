/**
 * Upload MBH (Mega Boys Hostel) menu data to MongoDB
 * Run from backend dir: node scripts/uploadMBHMenu.js
 * Requires: MONGODB_URI in .env or defaults to mongodb://localhost:27017/mess_management
 */
require('dotenv').config();
const mongoose = require('mongoose');
const MenuPage = require('../models/MenuPage');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mess_management';

// MBH Menu Data - Transform from the provided JSON format
const mbhMenuData = {
  mess_name: "Mess Mega Boys Hostel",
  date: "24-01-2026",
  menu: {
    Monday: {
      breakfast: ["Aloo Pyaz Paratha", "Butter", "Tea"],
      lunch: ["Rajma", "Roti", "Rice", "Masala Mix Raita"],
      snacks: ["Paneer Kulcha"],
      dinner: ["Chana Masala", "Arhar Dal", "Roti", "Gulab Jamun"]
    },
    Tuesday: {
      breakfast: ["Poha", "Daliya", "Tea"],
      lunch: ["Paneer Do Pyaza", "Panchratan Dal", "Rice"],
      snacks: ["Chana Samosa"],
      dinner: ["Mix Veg", "Panchratan Dal", "Roti", "Rice", "Rasmalai"]
    },
    Wednesday: {
      breakfast: ["Methi Paratha", "Aloo Sabji", "Tea"],
      lunch: ["Kadhi Pakoda", "Aloo Jeera", "Rice", "Roti"],
      snacks: ["Chips", "Biscuits", "Tea"],
      dinner: ["Kadhai Chicken / Paneer Tikka Masala", "Tandoori Roti", "Rice", "Dal Tadka"]
    },
    Thursday: {
      breakfast: ["Idli", "Sambhar", "Chutney", "Tea"],
      lunch: ["Gobi Aloo", "Boondi Raita", "Veg Pulao", "Masoor Dal", "Roti"],
      snacks: ["Vegetable Cutlet"],
      dinner: ["Gheeya Kofta", "Chana Dal", "Rice", "Roti", "Kheer"]
    },
    Friday: {
      breakfast: ["Pav Bhaji", "Tea"],
      lunch: ["Black Chana", "Aloo Beans", "Rice", "Roti"],
      snacks: ["Mix Pakora"],
      dinner: ["Paneer Bhurji / Egg Curry", "Dal Makhni", "Roti", "Rice", "Gajar Ka Halwa"]
    },
    Saturday: {
      breakfast: ["Dosa", "Uttapam", "Chutney", "Sambhar", "Tea"],
      lunch: ["Chole", "Boondi Raita", "Poori", "Rice"],
      snacks: ["Vegetable Pasta"],
      dinner: ["Vegetable Biryani", "Matar Cabbage", "Dal Tadka", "Roti", "White Rasgulla"]
    },
    Sunday: {
      breakfast: ["Amritsari Naan", "Chole", "Butter", "Tea"],
      lunch: ["Aloo Bhujia", "Arhar Dal", "Roti", "Jeera Rice"],
      snacks: ["Tea"],
      dinner: ["Labdaar Chicken / Paneer Chilli", "Dal Makhni", "Roti", "Rice"]
    }
  },
  daily_items: {
    breakfast: ["Pickle", "Tea", "Sauce", "Jam", "Bread", "Peanut Butter", "Omelette", "Corn Flakes"],
    lunch: ["Salad (Kheera, Onion, Lemon, Beetroot)", "Pickle", "Saunf"],
    snacks: ["Tea"]
  },
  extra_items: {
    breakfast: ["Butter", "Curd Packet", "Bread Slices", "Fresh Fruits", "Boiled Eggs", "Omelette"],
    lunch: ["Curd Packet", "Omelette", "Egg Bhurji", "Lassi", "Seasonal Fruit"],
    dinner: ["Milk Packet", "Curd Packet", "Hot Milk", "Omelette", "Egg Bhurji"]
  },
  note: [
    "E = Extra on that day only",
    "Menu will be followed according to the availability of material"
  ]
};

// Transform the data to match MenuPage schema
function transformMenuData(data) {
  // Transform weekly menu
  const weeklyMenu = Object.keys(data.menu).map(day => ({
    day: day,
    breakfast: data.menu[day].breakfast || [],
    lunch: data.menu[day].lunch || [],
    snacks: data.menu[day].snacks || [],
    dinner: data.menu[day].dinner || []
  }));

  // Transform daily items
  const dailyItems = [
    { name: 'Breakfast', items: data.daily_items.breakfast || [] },
    { name: 'Lunch', items: data.daily_items.lunch || [] },
    { name: 'Snacks', items: data.daily_items.snacks || [] }
  ];

  // Transform extra items
  const extraItems = [
    { name: 'Breakfast', items: data.extra_items.breakfast || [] },
    { name: 'Lunch', items: data.extra_items.lunch || [] },
    { name: 'Dinner', items: data.extra_items.dinner || [] }
  ];

  // Hostel list - keeping existing hostels
  const hostels = {
    boys: ['MBH', 'BH-1', 'BH-2', 'BH-3', 'BH-4', 'BH-5', 'BH-6', 'BH-7'],
    girls: ['GH-1', 'GH-2', 'MGH-1', 'MGH-2']
  };

  return {
    weeklyMenu,
    dailyItems,
    extraItems,
    hostels,
    isActive: true
  };
}

async function uploadMenu() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully!');

    // Transform the menu data
    const transformedData = transformMenuData(mbhMenuData);

    console.log('\n--- Transformed Menu Data ---');
    console.log(JSON.stringify(transformedData, null, 2));
    console.log('----------------------------\n');

    // Check if an active menu already exists
    const existingMenu = await MenuPage.findOne({ isActive: true });
    
    if (existingMenu) {
      console.log('Found existing active menu. Updating it...');
      
      // Update the existing menu
      const updatedMenu = await MenuPage.findByIdAndUpdate(
        existingMenu._id,
        { $set: transformedData },
        { new: true, runValidators: true }
      );
      
      console.log('\n✅ Menu updated successfully!');
      console.log('Menu ID:', updatedMenu._id);
      console.log('Effective From:', updatedMenu.effectiveFrom);
      console.log('Weekly Menu Days:', updatedMenu.weeklyMenu.map(d => d.day).join(', '));
    } else {
      console.log('No existing active menu found. Creating new menu...');
      
      // Create a new menu
      const newMenu = await MenuPage.create(transformedData);
      
      console.log('\n✅ Menu created successfully!');
      console.log('Menu ID:', newMenu._id);
      console.log('Effective From:', newMenu.effectiveFrom);
      console.log('Weekly Menu Days:', newMenu.weeklyMenu.map(d => d.day).join(', '));
    }

    console.log('\n📝 Notes from original menu:');
    mbhMenuData.note.forEach((note, index) => {
      console.log(`   ${index + 1}. ${note}`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Database connection closed. Upload complete!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error uploading menu:', error);
    if (error.errors) {
      console.error('Validation errors:', error.errors);
    }
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the upload
uploadMenu();
