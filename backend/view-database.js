// MongoDB database viewer for Auction House
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Auction = require('./models/Auction');
const Bid = require('./models/Bid');

async function viewDatabase() {
    try {
        // Connect to MongoDB
        await connectDB();
        
        console.log('\n=== AUCTION HOUSE DATABASE VIEWER ===\n');

        // View Users
        const users = await User.find().sort({ createdAt: -1 });
        console.log('📋 USERS COLLECTION:');
        console.log('─'.repeat(60));
        if (users.length === 0) {
            console.log('No users found.');
        } else {
            users.forEach(user => {
                console.log(`ID: ${user._id} | Username: ${user.username} | Created: ${user.createdAt}`);
            });
        }
        console.log(`Total Users: ${users.length}\n`);

        // View Auctions
        const auctions = await Auction.find().sort({ createdAt: -1 });
        console.log('🏛️ AUCTIONS COLLECTION:');
        console.log('─'.repeat(60));
        if (auctions.length === 0) {
            console.log('No auctions found.');
        } else {
            auctions.forEach(auction => {
                const endTime = new Date(auction.end_time);
                const now = new Date();
                const isActive = endTime > now ? 'ACTIVE' : 'ENDED';
                console.log(`\nID: ${auction._id}`);
                console.log(`Title: ${auction.title}`);
                console.log(`Current Bid: ₹${auction.current_bid.toLocaleString('en-IN')}`);
                console.log(`Buy Now Price: ₹${auction.buy_now_price?.toLocaleString('en-IN') || 'N/A'}`);
                console.log(`Status: ${auction.status} | ${isActive}`);
                console.log(`End Time: ${auction.end_time}`);
                console.log(`Created: ${auction.createdAt}`);
            });
        }
        console.log(`\nTotal Auctions: ${auctions.length}\n`);

        // View Bids
        const bids = await Bid.find()
            .populate('auction', 'title current_bid')
            .populate('user', 'username')
            .sort({ createdAt: -1 });

        console.log('💰 BIDS COLLECTION:');
        console.log('─'.repeat(60));
        if (bids.length === 0) {
            console.log('No bids found.');
        } else {
            bids.forEach(bid => {
                console.log(`\nBid ID: ${bid._id}`);
                console.log(`Auction: ${bid.auction?.title || 'N/A'} (ID: ${bid.auction?._id || 'N/A'})`);
                console.log(`User: ${bid.user?.username || 'N/A'}`);
                console.log(`Amount: ₹${bid.bidAmount.toLocaleString('en-IN')}`);
                console.log(`Time: ${bid.bidTime}`);
                console.log(`Status: ${bid.status}`);
            });
        }
        console.log(`\nTotal Bids: ${bids.length}\n`);

        // Summary Statistics
        const userCount = await User.countDocuments();
        const auctionCount = await Auction.countDocuments();
        const bidCount = await Bid.countDocuments();
        
        const totalValueResult = await Auction.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$current_bid' }
                }
            }
        ]);
        
        const totalValue = totalValueResult.length > 0 ? totalValueResult[0].total : 0;

        console.log('📊 SUMMARY STATISTICS:');
        console.log('─'.repeat(60));
        console.log(`Total Users: ${userCount}`);
        console.log(`Total Auctions: ${auctionCount}`);
        console.log(`Total Bids: ${bidCount}`);
        console.log(`Total Auction Value: ₹${totalValue.toLocaleString('en-IN')}`);
        console.log('─'.repeat(60));

        // Database connection info
        const db = mongoose.connection;
        console.log('\n🔗 DATABASE CONNECTION INFO:');
        console.log('─'.repeat(60));
        console.log(`Database: ${db.name}`);
        console.log(`Host: ${db.host}`);
        console.log(`Port: ${db.port}`);
        console.log(`Collections: ${Object.keys(db.collections).length}`);
        console.log('─'.repeat(60));

        console.log('\n✅ Database viewer completed.\n');
        
        // Close connection
        await mongoose.connection.close();
        console.log('🔒 MongoDB connection closed.\n');

    } catch (error) {
        console.error('❌ Error viewing database:', error);
        process.exit(1);
    }
}

// Run the viewer
viewDatabase();