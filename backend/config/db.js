const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;
        
        if (!mongoURI) {
            console.error('❌ MONGO_URI is not defined in environment variables');
            console.error('💡 Please create a .env file with your MongoDB Atlas connection string');
            console.error('📋 Copy .env.example to .env and update with your credentials');
            console.error('🔗 Get your connection string from: https://www.mongodb.com/cloud/atlas');
            process.exit(1);
        }

        // Check if it's still the placeholder
        if (mongoURI.includes('YOUR_USERNAME') || mongoURI.includes('YOUR_CLUSTER')) {
            console.error('❌ MONGO_URI contains placeholder values');
            console.error('💡 Please update your .env file with actual MongoDB Atlas credentials');
            console.error('📋 Steps to get your connection string:');
            console.error('   1. Go to https://www.mongodb.com/cloud/atlas');
            console.error('   2. Create a cluster (free tier available)');
            console.error('   3. Create database user with username/password');
            console.error('   4. Add your IP address to whitelist');
            console.error('   5. Click "Connect" → "Connect your application"');
            console.error('   6. Copy the connection string and update .env');
            process.exit(1);
        }

        console.log('🔗 Connecting to MongoDB Atlas...');
        const conn = await mongoose.connect(mongoURI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);
        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        console.error('💡 Troubleshooting tips:');
        console.error('   - Check your internet connection');
        console.error('   - Verify MongoDB Atlas cluster is running');
        console.error('   - Ensure IP address is whitelisted in MongoDB Atlas');
        console.error('   - Check username/password in connection string');
        process.exit(1);
    }
};

module.exports = connectDB;