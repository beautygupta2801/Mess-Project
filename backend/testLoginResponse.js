const https = require('http');

const data = JSON.stringify({
  email: 'clerk@bh1.mess',
  password: 'clerk123'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let responseData = '';

  res.on('data', chunk => {
    responseData += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(responseData);
      console.log('Status Code:', res.statusCode);
      
      if (json.success) {
        console.log('Login Successful');
        console.log('User Role:', json.role);
        console.log('User Type:', json.munshi?.type); // Check for the type field
        
        if (json.munshi?.type === 'clerk') {
             console.log('✅ SUCCESS: Clerk type is present in response');
        } else {
             console.log('❌ FAILURE: Clerk type missing or incorrect');
        }
      } else {
        console.log('Login Failed:', json.message);
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', responseData);
    }
  });
});

req.on('error', error => {
  console.error('Request error:', error);
});

req.write(data);
req.end();
