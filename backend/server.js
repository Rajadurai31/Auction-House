const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');
const Auction = require('./models/Auction');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../frontend')); // Serve static files from frontend folder

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

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api/bids', authenticateToken, bidRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true,
        status: 'ok', 
        message: 'Auction House API is running',
        database: 'MongoDB Atlas',
        timestamp: new Date().toISOString()
    });
});

// API Documentation
app.get('/api', (req, res) => {
    res.json({
        success: true,
        message: 'Auction House API',
        version: '1.0.0',
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

// Error handling middleware
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

// Seed initial data
async function seedInitialData() {
    try {
        const auctionCount = await Auction.countDocuments();
        
        if (auctionCount === 0) {
            const now = new Date();
            const sampleAuctions = [
                {
                    title: 'Luxury Rolex Watch',
                    description: 'Premium luxury watch in excellent condition',
                    image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=300&fit=crop',
                    starting_bid: 85000,
                    current_bid: 85000,
                    buy_now_price: 127500,
                    end_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000) // 2 days from now
                },
                {
                    title: 'Painting',
                    description: 'Beautiful artwork by renowned artist',
                    image_url: 'painting.webp',
                    starting_bid: 45000,
                    current_bid: 45000,
                    buy_now_price: 67500,
                    end_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000) // 1 day from now
                },
                {
                    title: 'Abstract Canvas Art',
                    description: 'Modern abstract art piece',
                    image_url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=300&fit=crop',
                    starting_bid: 125000,
                    current_bid: 125000,
                    buy_now_price: 187500,
                    end_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
                },
                {
                    title: 'Diamond Necklace',
                    description: 'Exquisite diamond necklace',
                    image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=300&fit=crop',
                    starting_bid: 250000,
                    current_bid: 250000,
                    buy_now_price: 375000,
                    end_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
                },
                {
                    title: 'Antique Violin',
                    description: 'Rare antique violin',
                    image_url: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?w=500&h=300&fit=crop',
                    starting_bid: 95000,
                    current_bid: 95000,
                    buy_now_price: 142500,
                    end_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
                },
                {
                    title: 'Designer Handbag',
                    description: 'Luxury designer handbag',
                    image_url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500&h=300&fit=crop',
                    starting_bid: 65000,
                    current_bid: 65000,
                    buy_now_price: 97500,
                    end_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
                },
                {
                    title: 'Rare Mobile',
                    description: 'Vintage rare mobile phone',
                    image_url: 'Rare mobile.webp',
                    starting_bid: 18000,
                    current_bid: 18000,
                    buy_now_price: 27000,
                    end_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
                },
                {
                    title: 'Rare Vinyl Records',
                    description: 'Collection of rare vinyl records',
                    image_url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=500&h=300&fit=crop',
                    starting_bid: 55000,
                    current_bid: 55000,
                    buy_now_price: 82500,
                    end_time: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
                },
                {
                    title: 'Luxury Fountain Pen',
                    description: 'Premium luxury fountain pen',
                    image_url: 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=500&h=300&fit=crop',
                    starting_bid: 32000,
                    current_bid: 32000,
                    buy_now_price: 48000,
                    end_time: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
                },
                {
                    title: 'Vintage Telescope',
                    description: 'Antique vintage telescope',
                    image_url: 'https://images.unsplash.com/photo-1614642264762-d0a3b8bf3700?w=500&h=300&fit=crop',
                    starting_bid: 72000,
                    current_bid: 72000,
                    buy_now_price: 108000,
                    end_time: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000)
                }
            ];

            await Auction.insertMany(sampleAuctions);
            console.log('✅ Seeded initial auction data');
        }
    } catch (error) {
        console.error('❌ Error seeding data:', error);
    }
}

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
    
    // Seed data after server starts
    seedInitialData();
});

module.exports = { authenticateToken, JWT_SECRET };