require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mess_management';

console.log('Attempting to connect to MongoDB...');
console.log('URI:', uri.replace(/:([^:@]+)@/, ':****@')); // Hide password in logs

mongoose.connect(uri)
  .then(() => {
    console.log('SUCCESS: MongoDB Connected!');
    process.exit(0);
  })
  .catch(err => {
    console.error('ERROR: MongoDB Connection Failed');
    console.error('Error Name:', err.name);
    console.error('Error Message:', err.message);
    if (err.cause) console.error('Error Cause:', err.cause);
    process.exit(1);
  });
