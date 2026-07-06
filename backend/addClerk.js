/**
 * Add Clerk Script
 * 
 * One-time script to add or update a Clerk (assistant) user.
 * Run from backend directory: node addClerk.js
 * 
 * Environment Variables:
 * - CLERK_NAME: Full name of the clerk
 * - CLERK_EMAIL: Email address
 * - CLERK_PASSWORD: Password (min 6 characters)
 * - CLERK_HOSTEL: Hostel assignment (e.g., BH-1, MBH, GH-1)
 * - CLERK_UPDATE: Set to 'true' to update existing clerk
 * 
 * Example Usage:
 *   CLERK_HOSTEL=BH-1 CLERK_EMAIL=clerk@bh1.mess node addClerk.js
 *   CLERK_UPDATE=true CLERK_HOSTEL=BH-1 node addClerk.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Munshi = require('./models/Munshi');
const { VALIDATION_PATTERNS } = require('./utils/constants');

// ==================== CONFIGURATION ====================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mess_management';
const name = process.env.CLERK_NAME || 'Clerk BH-1';
const email = (process.env.CLERK_EMAIL || 'clerk@bh1.mess').toLowerCase().trim();
const password = process.env.CLERK_PASSWORD || 'clerk123';
const hostel = (process.env.CLERK_HOSTEL || 'BH-1').toUpperCase().trim();
const shouldUpdate = process.env.CLERK_UPDATE === 'true';

// ==================== VALIDATION ====================

/**
 * Validate input parameters
 */
function validateInputs() {
  const errors = [];

  // Validate email format
  if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
    errors.push(`Invalid email format: ${email}`);
  }

  // Validate password length
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Validate hostel name
  if (!hostel || hostel.length < 2) {
    errors.push('Hostel name must be at least 2 characters');
  }

  // Validate name
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  return errors;
}

// ==================== MAIN FUNCTION ====================

/**
 * Main execution function
 */
async function run() {
  try {
    console.log('='.repeat(50));
    console.log('Clerk Account Setup');
    console.log('='.repeat(50));

    // Validate inputs
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      console.error('\n❌ Validation Errors:');
      validationErrors.forEach((err) => console.error(`  - ${err}`));
      process.exit(1);
    }

    // Connect to MongoDB
    console.log('\n📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user exists
    const existing = await Munshi.findOne({ email });

    if (existing && !shouldUpdate) {
      console.log('\n⚠️  User already exists with this email:');
      console.log(`   Name: ${existing.name}`);
      console.log(`   Email: ${existing.email}`);
      console.log(`   Hostel: ${existing.hostel}`);
      console.log(`   Type: ${existing.type}`);
      console.log(`   Active: ${existing.isActive}`);
      console.log('\n💡 To update, set CLERK_UPDATE=true');
      await mongoose.connection.close();
      process.exit(0);
    }

    if (existing && shouldUpdate) {
      // Update existing user to be a clerk
      console.log('\n🔄 Updating existing user to Clerk...');
      existing.name = name;
      existing.password = password; // Will be hashed by pre-save hook
      existing.hostel = hostel;
      existing.type = 'clerk'; // Enforce type
      existing.isActive = true;
      await existing.save();

      console.log('\n✅ Clerk updated successfully:');
      console.log(`   Name: ${existing.name}`);
      console.log(`   Email: ${existing.email}`);
      console.log(`   Hostel: ${existing.hostel}`);
      console.log(`   Type: ${existing.type}`);
      console.log(`   Active: ${existing.isActive}`);
    } else {
      // Create new clerk
      console.log('\n➕ Creating new clerk...');
      const clerk = await Munshi.create({ 
        name, 
        email, 
        password, 
        hostel, 
        type: 'clerk' // Enforce type
      });

      console.log('\n✅ Clerk created successfully:');
      console.log(`   ID: ${clerk._id}`);
      console.log(`   Name: ${clerk.name}`);
      console.log(`   Email: ${clerk.email}`);
      console.log(`   Hostel: ${clerk.hostel}`);
      console.log(`   Type: ${clerk.type}`);
      console.log(`   Active: ${clerk.isActive}`);
    }

    console.log('\n' + '='.repeat(50));
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 11000) {
      console.error('   Duplicate key error - email already exists');
    }
    await mongoose.connection.close();
    process.exit(1);
  }
}

// ==================== EXECUTION ====================

run().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
