
require('dotenv').config();
const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const Student = require('./models/Student');
const Munshi = require('./models/Munshi');

async function testEmail() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB.');

    const testEmailAddress = 'adityakm.cs.23@nitj.ac.in'; // From screenshot
    console.log(`Checking if user exists: ${testEmailAddress}`);

    let user = await Student.findOne({ email: testEmailAddress.toLowerCase() });
    if (user) {
      console.log('Found Student:', user.name);
    } else {
      user = await Munshi.findOne({ email: testEmailAddress.toLowerCase() });
      if (user) {
        console.log('Found Munshi:', user.name);
      } else {
        console.log('User NOT found in database.');
      }
    }

    console.log('Testing Email Transporter...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    try {
      await transporter.verify();
      console.log('Transporter verification successful!');
    } catch (verifyError) {
      console.error('Transporter verification FAILED:', verifyError);
      process.exit(1);
    }

    const mailOptions = {
      from: `"NITJ Mess Portal Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self to test
      subject: 'Test Email from NITJ Mess Portal',
      text: 'This is a test email to verify credentials.',
    };

    console.log('Sending test email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Test email sent successfully!', info.messageId);

  } catch (error) {
    console.error('An error occurred during testing:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

testEmail();
