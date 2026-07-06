/**
 * Add Munshi Script
 * 
 * One-time script to add or update a munshi user.
 * Run from backend directory: node addMunshi.js
 * 
 * Environment Variables:
 * - MUNSHI_NAME: Full name of the munshi
 * - MUNSHI_EMAIL: Email address
 * - MUNSHI_PASSWORD: Password (min 6 characters)
 * - MUNSHI_HOSTEL: Hostel assignment (e.g., BH-1, MBH, GH-1)
 * - MUNSHI_UPDATE: Set to 'true' to update existing munshi
 * 
 * Example Usage:
 *   MUNSHI_HOSTEL=BH-1 MUNSHI_EMAIL=munshi@bh1.mess node addMunshi.js
 *   MUNSHI_UPDATE=true MUNSHI_HOSTEL=BH-1 node addMunshi.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Munshi = require('./models/Munshi');
const { VALIDATION_PATTERNS } = require('./utils/constants');

// ==================== CONFIGURATION ====================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mess_management';
const name = process.env.MUNSHI_NAME || 'Munshi BH-1';
const email = (process.env.MUNSHI_EMAIL || 'munshi@bh1.mess').toLowerCase().trim();
const password = process.env.MUNSHI_PASSWORD || 'munshi123';
const hostel = (process.env.MUNSHI_HOSTEL || 'BH-1').toUpperCase().trim();
const shouldUpdate = process.env.MUNSHI_UPDATE === 'true';

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
    console.log('Munshi Account Setup');
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

    // Check if munshi exists
    const existing = await Munshi.findOne({ email });

    if (existing && !shouldUpdate) {
      console.log('\n⚠️  Munshi already exists with this email:');
      console.log(`   Name: ${existing.name}`);
      console.log(`   Email: ${existing.email}`);
      console.log(`   Hostel: ${existing.hostel}`);
      console.log(`   Active: ${existing.isActive}`);
      console.log('\n💡 To update, set MUNSHI_UPDATE=true');
      await mongoose.connection.close();
      process.exit(0);
    }

    if (existing && shouldUpdate) {
      // Update existing munshi
      console.log('\n🔄 Updating existing munshi...');
      existing.name = name;
      existing.password = password; // Will be hashed by pre-save hook
      existing.hostel = hostel;
      existing.isActive = true;
      await existing.save();

      console.log('\n✅ Munshi updated successfully:');
      console.log(`   Name: ${existing.name}`);
      console.log(`   Email: ${existing.email}`);
      console.log(`   Hostel: ${existing.hostel}`);
      console.log(`   Active: ${existing.isActive}`);
    } else {
      // Create new munshi
      console.log('\n➕ Creating new munshi...');
      const munshi = await Munshi.create({ name, email, password, hostel });

      console.log('\n✅ Munshi created successfully:');
      console.log(`   ID: ${munshi._id}`);
      console.log(`   Name: ${munshi.name}`);
      console.log(`   Email: ${munshi.email}`);
      console.log(`   Hostel: ${munshi.hostel}`);
      console.log(`   Active: ${munshi.isActive}`);
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

