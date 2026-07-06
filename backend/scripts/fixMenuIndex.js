const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mess_management';
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const fixIndex = async () => {
  await connectDB();

  try {
    console.log('Attempting to drop index "day_1" from "menus" collection...');
    
    // Access the raw collection
    const collection = mongoose.connection.collection('menus');
    
    // Check if index exists
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes);

    const indexExists = indexes.some(idx => idx.name === 'day_1');

    if (indexExists) {
      await collection.dropIndex('day_1');
      console.log('SUCCESS: Dropped index "day_1".');
    } else {
      console.log('INFO: Index "day_1" does not exist.');
    }

  } catch (error) {
    console.error('Error dropping index:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

fixIndex();
