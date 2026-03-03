// Test MongoDB connection
require('dotenv').config();

console.log('🔍 Testing MongoDB Connection...\n');

// Check if MONGO_URI is set
if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in .env file');
    process.exit(1);
}

console.log('✅ MONGO_URI found in .env');
console.log(`📋 Connection string (first 60 chars): ${process.env.MONGO_URI.substring(0, 60)}...`);

// Check for common issues
const mongoURI = process.env.MONGO_URI;

// Check if it contains placeholder values
if (mongoURI.includes('YOUR_USERNAME') || mongoURI.includes('YOUR_PASSWORD') || mongoURI.includes('YOUR_CLUSTER')) {
    console.error('❌ MONGO_URI still contains placeholder values');
    console.error('💡 Please update with your actual MongoDB Atlas credentials');
    process.exit(1);
}

// Check if it has the correct format
if (!mongoURI.startsWith('mongodb+srv://')) {
    console.error('❌ MONGO_URI should start with mongodb+srv://');
    process.exit(1);
}

// Check if it has database name
if (!mongoURI.includes('/auction-house')) {
    console.warn('⚠️  MONGO_URI might be missing database name (/auction-house)');
}

// Check for special characters in password that need encoding
if (mongoURI.includes('@') && mongoURI.split('@').length > 2) {
    console.warn('⚠️  Password might contain @ symbol that needs URL encoding');
    console.warn('💡 Change @ to %40 in password');
}

console.log('\n✅ Connection string format looks good');
console.log('🚀 Attempting to connect to MongoDB Atlas...\n');

// Try to connect
const mongoose = require('mongoose');

mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
})
.then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🏷️  Host: ${mongoose.connection.host}`);
    
    // Close connection
    mongoose.connection.close();
    console.log('\n🔒 Connection closed');
    console.log('🎉 MongoDB Atlas connection test PASSED!');
    process.exit(0);
})
.catch((error) => {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('1. Check your internet connection');
    console.error('2. Verify MongoDB Atlas cluster is running');
    console.error('3. Ensure IP address is whitelisted in MongoDB Atlas');
    console.error('4. Check username/password in connection string');
    console.error('5. Make sure database user has correct permissions');
    
    if (error.message.includes('bad auth') || error.message.includes('authentication failed')) {
        console.error('\n🔐 Authentication failed - check:');
        console.error('   - Username is correct');
        console.error('   - Password is correct (remember @ needs to be %40)');
        console.error('   - Database user exists in MongoDB Atlas');
    }
    
    if (error.message.includes('getaddrinfo')) {
        console.error('\n🌐 Network error - check:');
        console.error('   - Internet connection');
        console.error('   - DNS resolution');
        console.error('   - Firewall settings');
    }
    
    process.exit(1);
});