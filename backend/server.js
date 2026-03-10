const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const http = require('http');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctions');
const bidRoutes = require('./routes/bids');
const Auction = require('./models/Auction');
const WebSocketServer = require('./websocket');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize WebSocket server
const wss = new WebSocketServer(server);

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
            
            // Create 5 LIVE auctions (ending soon - within 1 hour)
            const liveAuctions = [
                {
                    title: 'Vintage Luxury Car',
                    description: 'Classic vintage car in perfect condition, fully restored. Limited edition model with only 100 units produced worldwide.',
                    image_url: 'car.webp',
                    starting_bid: 2500000,
                    current_bid: 2850000,
                    buy_now_price: 3750000,
                    end_time: new Date(now.getTime() + 45 * 60 * 1000), // 45 minutes from now
                    active_bidders: 8,
                    total_bids: 24
                },
                {
                    title: 'Designer Wedding Dress',
                    description: 'Exclusive designer wedding dress, never worn. Custom designed by famous fashion designer, includes matching accessories.',
                    image_url: 'dress.webp',
                    starting_bid: 125000,
                    current_bid: 187000,
                    buy_now_price: 250000,
                    end_time: new Date(now.getTime() + 30 * 60 * 1000), // 30 minutes from now
                    active_bidders: 12,
                    total_bids: 42
                },
                {
                    title: 'Rare Vintage Mobile Phone',
                    description: 'Extremely rare vintage mobile phone, collector\'s item. First generation model in mint condition with original packaging.',
                    image_url: 'Rare mobile.webp',
                    starting_bid: 45000,
                    current_bid: 78000,
                    buy_now_price: 120000,
                    end_time: new Date(now.getTime() + 15 * 60 * 1000), // 15 minutes from now
                    active_bidders: 15,
                    total_bids: 56
                },
                {
                    title: 'Premium Mountain Bike',
                    description: 'High-end mountain bike with full suspension, carbon fiber frame. Professional racing model used in championship.',
                    image_url: 'bike.webp',
                    starting_bid: 85000,
                    current_bid: 125000,
                    buy_now_price: 180000,
                    end_time: new Date(now.getTime() + 20 * 60 * 1000), // 20 minutes from now
                    active_bidders: 9,
                    total_bids: 31
                },
                {
                    title: 'Abstract Art Painting',
                    description: 'Beautiful abstract painting by contemporary artist. Award-winning piece exhibited in international galleries.',
                    image_url: 'painting.webp',
                    starting_bid: 95000,
                    current_bid: 165000,
                    buy_now_price: 250000,
                    end_time: new Date(now.getTime() + 10 * 60 * 1000), // 10 minutes from now
                    active_bidders: 11,
                    total_bids: 38
                }
            ];
            
            // Create UPCOMING auctions (starting later today or tomorrow)
            const upcomingAuctions = [
                {
                    title: 'Designer Leather Shoes',
                    description: 'Premium designer leather shoes, limited edition. Handcrafted Italian leather with gold accents.',
                    image_url: 'shoe.webp',
                    starting_bid: 32000,
                    current_bid: 32000,
                    buy_now_price: 55000,
                    end_time: new Date(now.getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
                    active_bidders: 0,
                    total_bids: 0
                },
                {
                    title: 'Golden Statue Art Piece',
                    description: 'Exquisite golden statue, handcrafted artwork. 24K gold plated with precious stone镶嵌.',
                    image_url: 'golden.png',
                    starting_bid: 180000,
                    current_bid: 180000,
                    buy_now_price: 300000,
                    end_time: new Date(now.getTime() + 4 * 60 * 60 * 1000), // 4 hours from now
                    active_bidders: 0,
                    total_bids: 0
                },
                {
                    title: 'Antique Item Collection',
                    description: 'Collection of rare antique items from different eras. Includes Victorian era artifacts.',
                    image_url: 'item1.jpg',
                    starting_bid: 125000,
                    current_bid: 125000,
                    buy_now_price: 200000,
                    end_time: new Date(now.getTime() + 8 * 60 * 60 * 1000), // 8 hours from now
                    active_bidders: 0,
                    total_bids: 0
                },
                {
                    title: 'Vintage Camera Collection',
                    description: 'Rare collection of vintage cameras in working condition. Includes Leica and Hasselblad models.',
                    image_url: 'item2.jpg',
                    starting_bid: 75000,
                    current_bid: 75000,
                    buy_now_price: 125000,
                    end_time: new Date(now.getTime() + 12 * 60 * 60 * 1000), // 12 hours from now
                    active_bidders: 0,
                    total_bids: 0
                },
                {
                    title: 'Luxury Watch Collection',
                    description: 'Premium luxury watches from top brands. Includes Rolex, Patek Philippe, and Audemars Piguet.',
                    image_url: 'item3.jpg',
                    starting_bid: 350000,
                    current_bid: 350000,
                    buy_now_price: 600000,
                    end_time: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 24 hours from now
                    active_bidders: 0,
                    total_bids: 0
                },
                {
                    title: 'Diamond Jewelry Set',
                    description: 'Complete diamond jewelry set with necklace, earrings, and bracelet. Certified natural diamonds.',
                    image_url: 'auction logo.png',
                    starting_bid: 500000,
                    current_bid: 500000,
                    buy_now_price: 850000,
                    end_time: new Date(now.getTime() + 36 * 60 * 60 * 1000), // 36 hours from now
                    active_bidders: 0,
                    total_bids: 0
                },
                {
                    title: 'Sports Car Supercar',
                    description: 'Limited edition sports supercar with only 50 units worldwide. 0-100 km/h in 2.5 seconds.',
                    image_url: 'car.webp',
                    starting_bid: 3500000,
                    current_bid: 3500000,
                    buy_now_price: 5000000,
                    end_time: new Date(now.getTime() + 48 * 60 * 60 * 1000), // 48 hours from now
                    active_bidders: 0,
                    total_bids: 0
                },
                {
                    title: 'Luxury Yacht Model',
                    description: 'Detailed scale model of luxury yacht. Perfect for collectors and maritime enthusiasts.',
                    image_url: 'golden.png',
                    starting_bid: 65000,
                    current_bid: 65000,
                    buy_now_price: 110000,
                    end_time: new Date(now.getTime() + 60 * 60 * 60 * 1000), // 60 hours from now
                    active_bidders: 0,
                    total_bids: 0
                },
                {
                    title: 'Rare Coin Collection',
                    description: 'Collection of rare historical coins from different countries and eras.',
                    image_url: 'item1.jpg',
                    starting_bid: 95000,
                    current_bid: 95000,
                    buy_now_price: 160000,
                    end_time: new Date(now.getTime() + 72 * 60 * 60 * 1000), // 72 hours from now
                    active_bidders: 0,
                    total_bids: 0
                },
                {
                    title: 'Vintage Wine Collection',
                    description: 'Rare vintage wine collection from famous vineyards. Includes 100-year-old bottles.',
                    image_url: 'item2.jpg',
                    starting_bid: 280000,
                    current_bid: 280000,
                    buy_now_price: 450000,
                    end_time: new Date(now.getTime() + 84 * 60 * 60 * 1000), // 84 hours from now
                    active_bidders: 0,
                    total_bids: 0
                }
            ];

            // Combine all auctions
            const sampleAuctions = [...liveAuctions, ...upcomingAuctions];
            
            await Auction.insertMany(sampleAuctions);
            console.log('✅ Seeded initial auction data');
            console.log(`   - ${liveAuctions.length} LIVE auctions (ending soon)`);
            console.log(`   - ${upcomingAuctions.length} UPCOMING auctions`);
            console.log(`   - Total: ${sampleAuctions.length} auctions created`);
        } else {
            // Update existing auctions to use local images
            const auctions = await Auction.find();
            const imageFiles = [
                'car.webp', 'dress.webp', 'Rare mobile.webp', 'bike.webp',
                'painting.webp', 'shoe.webp', 'golden.png', 'item1.jpg',
                'item2.jpg', 'item3.jpg'
            ];
            
            let updatedCount = 0;
            for (let i = 0; i < auctions.length; i++) {
                const auction = auctions[i];
                const imageIndex = i % imageFiles.length;
                
                // Only update if image_url is different
                if (auction.image_url !== imageFiles[imageIndex]) {
                    // Use updateOne to avoid validation for end_time
                    await Auction.updateOne(
                        { _id: auction._id },
                        { $set: { image_url: imageFiles[imageIndex] } }
                    );
                    updatedCount++;
                }
            }
            console.log(`✅ Updated ${updatedCount} existing auctions with local images`);
        }
    } catch (error) {
        console.error('❌ Error seeding data:', error);
    }
}

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔌 WebSocket server running on ws://localhost:${PORT}`);
    console.log(`📊 API Documentation: http://localhost:${PORT}/api`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/api/health`);
    
    // Seed data after server starts
    seedInitialData();
});

module.exports = { 
    authenticateToken, 
    JWT_SECRET,
    wss,
    server 
};