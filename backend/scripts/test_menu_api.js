const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
const MENU_URL = `${BASE_URL}/munshi/menu`;
const AUTH_URL = `${BASE_URL}/auth`;

async function testMenuAPI() {
    try {
        console.log('Testing Menu API...');

        // 0. Login
        console.log('\n0. Logging in...');
        let token;
        try {
            const loginRes = await axios.post(`${AUTH_URL}/login`, {
                email: 'clerk@example.com',
                password: 'password123'
            });
            token = loginRes.data.token;
            console.log('Login Success. Token received.');
        } catch (err) {
            console.error('Login Failed:', err.response ? err.response.data : err.message);
            // Try creating the clerk if login fails (maybe it doesn't exist yet)
            console.log('Attempting to create clerk via script (if not exists)...');
            // We can't easily run the other script from here without exec, but let's assume it exists or fail.
            return;
        }

        const authHeaders = {
            'Authorization': `Bearer ${token}`
        };

        // 1. Test POST /weekly (without files first)
        console.log('\n1. Testing POST /weekly (No files)...');
        const menuData = {
            Monday: {
                breakfast: [{ name: 'Test Breakfast', price: 50, isAvailable: true }],
                lunch: [{ name: 'Test Lunch', price: 80, isAvailable: true }]
            }
        };

        const form = new FormData();
        form.append('menuData', JSON.stringify(menuData));

        try {
            const res = await axios.post(`${MENU_URL}/weekly`, form, {
                headers: {
                    ...form.getHeaders(),
                    ...authHeaders
                }
            });
            console.log('POST /weekly Success:', res.data);
        } catch (err) {
            console.error('POST /weekly Failed:', err.response ? err.response.data : err.message);
        }

        // 2. Test GET /current (Specific Day)
        console.log('\n2. Testing GET /current?day=Monday...');
        try {
            const res = await axios.get(`${MENU_URL}/current?day=Monday`, { headers: authHeaders });
            console.log('GET /current?day=Monday Success:', JSON.stringify(res.data, null, 2));
        } catch (err) {
            console.error('GET /current Failed:', err.response ? err.response.data : err.message);
        }

        // 3. Test POST /weekly (With Dummy File)
        const dummyFilePath = path.join(__dirname, 'test_image.jpg');
        fs.writeFileSync(dummyFilePath, 'dummy image content');

        console.log('\n3. Testing POST /weekly (With File)...');
        const menuDataWithImage = {
            Tuesday: {
                breakfast: [{ name: 'Image Breakfast', price: 60, isAvailable: true, imageKey: 'image-Tuesday-breakfast-0' }]
            }
        };

        const formWithFile = new FormData();
        formWithFile.append('menuData', JSON.stringify(menuDataWithImage));
        formWithFile.append('image-Tuesday-breakfast-0', fs.createReadStream(dummyFilePath));

        try {
            const res = await axios.post(`${MENU_URL}/weekly`, formWithFile, {
                headers: {
                    ...formWithFile.getHeaders(),
                    ...authHeaders
                }
            });
            console.log('POST /weekly (With File) Success:', res.data);
        } catch (err) {
            console.error('POST /weekly (With File) Failed:', err.response ? err.response.data : err.message);
        }
        
        fs.unlinkSync(dummyFilePath);

        // 4. Verify Image Path in GET
        console.log('\n4. Testing GET /current?day=Tuesday...');
        try {
            const res = await axios.get(`${MENU_URL}/current?day=Tuesday`, { headers: authHeaders });
            console.log('GET /current?day=Tuesday Success:', JSON.stringify(res.data, null, 2));
        } catch (err) {
            console.error('GET /current Failed:', err.response ? err.response.data : err.message);
        }

    } catch (error) {
        console.error('Test Script Error:', error);
    }
}

testMenuAPI();
