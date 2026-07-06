// Test script to verify OTP registration endpoint
const testEmail = `test${Date.now()}@nitj.ac.in`;

const testData = {
  name: "Test User",
  email: testEmail,
  password: "test123",
  rollNo: `TEST${Date.now()}`,
  hostelNo: "BH-1",
  roomNo: "101",
  phoneNo: "9876543210"
};

console.log("Testing registration with:", testEmail);

fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
  console.log('\n=== BACKEND RESPONSE ===');
  console.log('Success:', data.success);
  console.log('Message:', data.message);
  console.log('Email:', data.email);
  console.log('Full response:', JSON.stringify(data, null, 2));
  
  if (data.message && data.message.includes("Verification code sent")) {
    console.log('\n✅ OTP flow is working correctly!');
    console.log('The backend is sending the correct response.');
    console.log('Issue is likely in the frontend.');
  } else {
    console.log('\n Backend is NOT sending OTP response!');
    console.log('The backend might be creating the student directly.');
  }
})
.catch(error => {
  console.error('Error:', error);
});
