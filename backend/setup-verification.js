// Setup verification script
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Auction House Backend Setup...\n');

const requiredFiles = [
    '.env.example',
    'package.json',
    'server.js',
    'config/db.js',
    'models/User.js',
    'models/Auction.js',
    'models/Bid.js',
    'controllers/authController.js',
    'controllers/auctionController.js',
    'controllers/bidController.js',
    'routes/auth.js',
    'routes/auctions.js',
    'routes/bids.js',
    'README.md',
    'REFACTOR_DOCUMENTATION.md'
];

const requiredFolders = [
    'config',
    'models',
    'controllers',
    'routes'
];

console.log('📁 Checking folder structure...');
let folderErrors = 0;
requiredFolders.forEach(folder => {
    if (fs.existsSync(folder)) {
        console.log(`   ✅ ${folder}/`);
    } else {
        console.log(`   ❌ ${folder}/ - Missing`);
        folderErrors++;
    }
});

console.log('\n📄 Checking required files...');
let fileErrors = 0;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ ${file} - Missing`);
        fileErrors++;
    }
});

console.log('\n📦 Checking package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    // Check required dependencies
    const requiredDeps = ['express', 'mongoose', 'jsonwebtoken', 'bcryptjs', 'cors', 'dotenv'];
    const missingDeps = requiredDeps.filter(dep => !packageJson.dependencies[dep]);
    
    if (missingDeps.length === 0) {
        console.log('   ✅ All required dependencies found');
    } else {
        console.log(`   ❌ Missing dependencies: ${missingDeps.join(', ')}`);
        fileErrors++;
    }
    
    // Check scripts
    const requiredScripts = ['start', 'dev', 'view-db'];
    const missingScripts = requiredScripts.filter(script => !packageJson.scripts[script]);
    
    if (missingScripts.length === 0) {
        console.log('   ✅ All required scripts found');
    } else {
        console.log(`   ❌ Missing scripts: ${missingScripts.join(', ')}`);
        fileErrors++;
    }
    
} catch (error) {
    console.log(`   ❌ Error reading package.json: ${error.message}`);
    fileErrors++;
}

console.log('\n🔧 Checking environment setup...');
if (fs.existsSync('.env')) {
    console.log('   ✅ .env file exists');
    
    const envContent = fs.readFileSync('.env', 'utf8');
    const hasMongoURI = envContent.includes('MONGO_URI=');
    const hasJWTSecret = envContent.includes('JWT_SECRET=');
    
    if (hasMongoURI) {
        console.log('   ✅ MONGO_URI configured');
    } else {
        console.log('   ⚠️  MONGO_URI not found in .env');
    }
    
    if (hasJWTSecret) {
        console.log('   ✅ JWT_SECRET configured');
    } else {
        console.log('   ⚠️  JWT_SECRET not found in .env');
    }
} else {
    console.log('   ⚠️  .env file not found (copy .env.example to .env)');
}

console.log('\n📊 Summary:');
console.log('─'.repeat(40));
console.log(`Total folders checked: ${requiredFolders.length}`);
console.log(`Folder errors: ${folderErrors}`);
console.log(`Total files checked: ${requiredFiles.length}`);
console.log(`File errors: ${fileErrors}`);
console.log('─'.repeat(40));

if (folderErrors === 0 && fileErrors === 0) {
    console.log('\n🎉 Setup verification PASSED!');
    console.log('\n🚀 Next steps:');
    console.log('1. Update .env with your MongoDB Atlas connection string');
    console.log('2. Run: npm install');
    console.log('3. Run: npm run dev');
    console.log('4. Test API: npm run test-api');
    console.log('5. View database: npm run view-db');
} else {
    console.log('\n❌ Setup verification FAILED!');
    console.log('Please fix the issues above before proceeding.');
}

console.log('\n📚 Documentation:');
console.log('- README.md - Setup and usage instructions');
console.log('- REFACTOR_DOCUMENTATION.md - Detailed refactoring documentation');
console.log('- API Documentation: http://localhost:3000/api (when server is running)');