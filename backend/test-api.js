// Simple API test script
const axios = require('axios');

const API_BASE = 'http://localhost:3003/api';

async function testAPI() {
    console.log('🧪 Testing Auction House API...\n');

    try {
        // Test 1: Health Check
        console.log('1. Testing Health Check...');
        const healthResponse = await axios.get(`${API_BASE}/health`);
        console.log(`   ✅ Status: ${healthResponse.data.status}`);
        console.log(`   ✅ Database: ${healthResponse.data.database}`);
        console.log(`   ✅ Message: ${healthResponse.data.message}\n`);

        // Test 2: API Documentation
        console.log('2. Testing API Documentation...');
        const apiResponse = await axios.get(`${API_BASE}`);
        console.log(`   ✅ API Version: ${apiResponse.data.version}`);
        console.log(`   ✅ Endpoints available: ${Object.keys(apiResponse.data.endpoints).length}\n`);

        // Test 3: Get All Auctions
        console.log('3. Testing Get All Auctions...');
        const auctionsResponse = await axios.get(`${API_BASE}/auctions`);
        console.log(`   ✅ Status: ${auctionsResponse.data.success}`);
        console.log(`   ✅ Auctions Count: ${auctionsResponse.data.count}`);
        console.log(`   ✅ First Auction: ${auctionsResponse.data.data[0]?.title || 'No auctions'}\n`);

        // Test 4: Get Active Auctions
        console.log('4. Testing Get Active Auctions...');
        const activeResponse = await axios.get(`${API_BASE}/auctions/active`);
        console.log(`   ✅ Status: ${activeResponse.data.success}`);
        console.log(`   ✅ Active Auctions: ${activeResponse.data.count}\n`);

        // Test 5: Get Ended Auctions
        console.log('5. Testing Get Ended Auctions...');
        const endedResponse = await axios.get(`${API_BASE}/auctions/ended`);
        console.log(`   ✅ Status: ${endedResponse.data.success}`);
        console.log(`   ✅ Ended Auctions: ${endedResponse.data.count}\n`);

        console.log('🎉 All API tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log('─'.repeat(40));
        console.log(`Total Auctions: ${auctionsResponse.data.count}`);
        console.log(`Active Auctions: ${activeResponse.data.count}`);
        console.log(`Ended Auctions: ${endedResponse.data.count}`);
        console.log('─'.repeat(40));
        console.log('\n🚀 API is ready for use!');

    } catch (error) {
        console.error('❌ API Test Failed:', error.message);
        
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Error: ${error.response.data.error || error.response.data.message}`);
        }
        
        console.log('\n💡 Troubleshooting Tips:');
        console.log('1. Make sure the server is running: npm run dev');
        console.log('2. Check MongoDB connection in config/db.js');
        console.log('3. Verify .env file has correct MONGO_URI');
        console.log('4. Check if port 3000 is available');
    }
}

// Run tests
testAPI();