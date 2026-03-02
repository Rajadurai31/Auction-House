// Mock MongoDB connection for testing without actual database
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Mock database connection
console.log('🔧 Starting Auction House Backend with Mock Database');
console.log('💡 This is for testing the API structure without MongoDB');
console.log('📋 To use real MongoDB Atlas:');
console.log('   1. Get connection string from https://www.mongodb.com/cloud/atlas');
console.log('   2. Update .env file with MONGO_URI');
console.log('   3. Run: npm run dev\n');

// JWT verification middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false,
            error: 'Access token required' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false,
                error: 'Invalid or expired token' 
            });
        }
        req.user = user;
        next();
    });
};

// Mock routes for testing
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        status: 'ok', 
        message: 'Auction House API is running (Mock Mode)',
        database: 'Mock Database - Update .env for MongoDB Atlas',
        timestamp: new Date().toISOString()
    });
});

app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Auction House API (Mock Mode)',
        version: '1.0.0',
        note: 'Running in mock mode. Update .env with MONGO_URI for full functionality',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                verify: 'GET /api/auth/verify'
            },
            auctions: {
                getAll: 'GET /api/auctions',
                getActive: 'GET /api/auctions/active',
                getEnded: 'GET /api/auctions/ended',
                getById: 'GET /api/auctions/:id',
                create: 'POST /api/auctions'
            },
            bids: {
                placeBid: 'POST /api/bids',
                getByAuction: 'GET /api/bids/auction/:auctionId',
                getUserBids: 'GET /api/bids/my-bids',
                getHighestBid: 'GET /api/bids/highest/:auctionId',
                getBidHistory: 'GET /api/bids/history/:auctionId'
            }
        }
    });
});

// Mock authentication endpoints
app.post('/api/auth/register', (req, res) => {
    res.status(201).json({
        success: true,
        message: 'User registration endpoint (Mock)',
        note: 'Update .env with MONGO_URI for real registration',
        token: 'mock-jwt-token-for-testing',
        user: { id: 'mock-user-id', username: req.body.username || 'testuser' }
    });
});

app.post('/api/auth/login', (req, res) => {
    res.json({
        success: true,
        message: 'User login endpoint (Mock)',
        note: 'Update .env with MONGO_URI for real login',
        token: 'mock-jwt-token-for-testing',
        user: { id: 'mock-user-id', username: req.body.username || 'testuser' }
    });
});

// Mock auction data
const mockAuctions = [
    {
        id: '1',
        title: 'Luxury Rolex Watch',
        description: 'Premium luxury watch in excellent condition',
        image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=300&fit=crop',
        starting_bid: 85000,
        current_bid: 85000,
        buy_now_price: 127500,
        end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        timeLeft: 172800,
        status: 'active'
    },
    {
        id: '2',
        title: 'Painting',
        description: 'Beautiful artwork by renowned artist',
        image_url: 'painting.webp',
        starting_bid: 45000,
        current_bid: 45000,
        buy_now_price: 67500,
        end_time: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        timeLeft: 86400,
        status: 'active'
    }
];

app.get('/api/auctions', (req, res) => {
    res.json({
        success: true,
        count: mockAuctions.length,
        note: 'Mock auction data - Update .env with MONGO_URI for real data',
        data: mockAuctions
    });
});

app.get('/api/auctions/:id', (req, res) => {
    const auction = mockAuctions.find(a => a.id === req.params.id);
    if (auction) {
        res.json({
            success: true,
            data: auction
        });
    } else {
        res.status(404).json({
            success: false,
            error: 'Auction not found'
        });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Endpoint not found' 
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Mock Server running on http://localhost:${PORT}`);
    console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
    console.log('\n💡 To switch to real MongoDB:');
    console.log('   1. Get MongoDB Atlas connection string');
    console.log('   2. Update .env file with MONGO_URI');
    console.log('   3. Stop this server (Ctrl+C)');
    console.log('   4. Run: npm run dev');
});