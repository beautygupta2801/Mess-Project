// Detailed test script to verify OTP registration endpoint
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
console.log("Request data:", JSON.stringify(testData, null, 2));

fetch('http://localhost:5000/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => {
  console.log('\n=== HTTP RESPONSE ===');
  console.log('Status:', response.status);
  console.log('Status Text:', response.statusText);
  console.log('Headers:', Object.fromEntries(response.headers.entries()));
  return response.text();
})
.then(text => {
  console.log('\n=== RAW RESPONSE BODY ===');
  console.log(text);
  
  try {
    const data = JSON.parse(text);
    console.log('\n=== PARSED JSON ===');
    console.log(JSON.stringify(data, null, 2));
    
    console.log('\n=== ANALYSIS ===');
    console.log('Success:', data.success);
    console.log('Message:', data.message);
    console.log('Email:', data.email);
    console.log('Has token:', !!data.token);
    console.log('Has student:', !!data.student);
    
    if (data.message && data.message.includes("Verification code sent")) {
      console.log('\n✅ OTP flow is working correctly!');
    } else if (data.token && data.student) {
      console.log('\n❌ Backend created student directly WITHOUT OTP!');
    } else {
      console.log('\n⚠️  Unexpected response format');
    }
  } catch (e) {
    console.error('Failed to parse JSON:', e.message);
  }
})
.catch(error => {
  console.error('\n=== ERROR ===');
  console.error(error);
});
