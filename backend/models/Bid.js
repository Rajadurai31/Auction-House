const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    auction: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auction',
        required: [true, 'Auction ID is required']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required']
    },
    bidAmount: {
        type: Number,
        required: [true, 'Bid amount is required'],
        min: [0, 'Bid amount cannot be negative']
    },
    bidTime: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'outbid', 'won', 'lost'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Static method to create a new bid
bidSchema.statics.createBid = async function(auctionId, userId, bidAmount) {
    const bid = new this({
        auction: auctionId,
        user: userId,
        bidAmount: bidAmount
    });
    
    return await bid.save();
};

// Static method to get bids by auction
bidSchema.statics.getBidsByAuction = async function(auctionId) {
    return await this.find({ auction: auctionId })
        .populate('user', 'username')
        .sort({ bidAmount: -1, createdAt: -1 })
        .exec();
};

// Static method to get user's bids
bidSchema.statics.getUserBids = async function(userId) {
    return await this.find({ user: userId })
        .populate('auction', 'title current_bid')
        .sort({ createdAt: -1 })
        .exec();
};

// Static method to get highest bid for auction
bidSchema.statics.getHighestBid = async function(auctionId) {
    const highestBid = await this.findOne({ auction: auctionId })
        .sort({ bidAmount: -1 })
        .limit(1);
    
    return highestBid;
};

// Indexes for better query performance
bidSchema.index({ auction: 1, bidAmount: -1 });
bidSchema.index({ user: 1, createdAt: -1 });
bidSchema.index({ auction: 1, user: 1 });

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;