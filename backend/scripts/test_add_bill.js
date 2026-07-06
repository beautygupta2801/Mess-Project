const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAddBill() {
  console.log('Testing Add Bill API...\n');

  try {
    // Step 1: Login as munshi
    console.log('1. Logging in as munshi...');
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'munshi@bh1.com',
      password: 'password123'
    });

    if (!loginRes.data.success) {
      console.error('Login failed:', loginRes.data.message);
      return;
    }

    const token = loginRes.data.token;
    const munshiHostel = loginRes.data.munshi.hostel;
    console.log(`✓ Login successful. Hostel: ${munshiHostel}\n`);

    // Step 2: Add a bill charge
    console.log('2. Adding bill charge (Fines: ₹100)...');
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const addBillRes = await axios.post(
      `${API_BASE}/munshi/bill/add-charge`,
      {
        month: currentMonth,
        year: currentYear,
        chargeType: 'fines',
        amount: 100,
        description: 'Test fine for late payment'
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!addBillRes.data.success) {
      console.error('Add bill failed:', addBillRes.data.message);
      return;
    }

    console.log('✓ Bill charge added successfully!');
    console.log(`  Students affected: ${addBillRes.data.data.studentsAffected}`);
    console.log(`  Charge type: ${addBillRes.data.data.chargeType}`);
    console.log(`  Amount: ₹${addBillRes.data.data.amount}`);
    console.log(`  Month: ${addBillRes.data.data.month}/${addBillRes.data.data.year}\n`);

    // Step 3: Verify by checking a student's bill
    console.log('3. Verifying bill was added...');
    const Bill = require('../models/Bill');
    const Student = require('../models/Student');

    const student = await Student.findOne({ hostelNo: munshiHostel }).select('_id name rollNo');
    if (!student) {
      console.log('⚠ No students found in hostel to verify');
      return;
    }

    const bill = await Bill.findOne({
      studentId: student._id,
      month: currentMonth,
      year: currentYear
    });

    if (!bill) {
      console.error('✗ Bill not found for student');
      return;
    }

    console.log(`✓ Bill verified for student: ${student.name} (${student.rollNo})`);
    console.log(`  Fines: ₹${bill.fines}`);
    console.log(`  Extras: ₹${bill.extras}`);
    console.log(`  Total: ₹${bill.totalBill}\n`);

    console.log('✅ All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testAddBill();
