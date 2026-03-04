const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [3, 'Title must be at least 3 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    image_url: {
        type: String,
        trim: true
    },
    starting_bid: {
        type: Number,
        required: [true, 'Starting bid is required'],
        min: [0, 'Starting bid cannot be negative']
    },
    current_bid: {
        type: Number,
        default: function() {
            return this.starting_bid;
        },
        min: [0, 'Current bid cannot be negative']
    },
    buy_now_price: {
        type: Number,
        min: [0, 'Buy now price cannot be negative']
    },
    end_time: {
        type: Date,
        required: [true, 'End time is required'],
        validate: {
            validator: function(value) {
                return value > new Date();
            },
            message: 'End time must be in the future'
        }
    },
    status: {
        type: String,
        enum: ['active', 'ended', 'sold'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Virtual for checking if auction is active
auctionSchema.virtual('isActive').get(function() {
    return this.end_time > new Date() && this.status === 'active';
});

// Virtual for time left in seconds
auctionSchema.virtual('timeLeft').get(function() {
    const now = new Date();
    const timeLeft = this.end_time - now;
    return Math.max(0, Math.floor(timeLeft / 1000));
});

// Static method to get all auctions
auctionSchema.statics.getAll = async function() {
    return await this.find().sort({ createdAt: -1 });
};

// Static method to get auction by ID
auctionSchema.statics.getById = async function(id) {
    return await this.findOne({ _id: id });
};

// Static method to create auction
auctionSchema.statics.createAuction = async function(auctionData) {
    const auction = new this(auctionData);
    return await auction.save();
};

// Static method to update bid
auctionSchema.statics.updateBid = async function(id, newBid) {
    return await this.findByIdAndUpdate(
        id,
        { 
            current_bid: newBid,
            $inc: { __v: 1 } // Increment version for optimistic concurrency
        },
        { new: true }
    );
};

// Static method to get active auctions
auctionSchema.statics.getActiveAuctions = async function() {
    return await this.find({
        end_time: { $gt: new Date() },
        status: 'active'
    }).sort({ end_time: 1 });
};

// Static method to get ended auctions
auctionSchema.statics.getEndedAuctions = async function() {
    return await this.find({
        end_time: { $lte: new Date() },
        status: 'active'
    }).sort({ end_time: -1 });
};

// Method to check if auction can be bid on
auctionSchema.methods.canBid = function(bidAmount) {
    if (!this.isActive) {
        return { valid: false, reason: 'Auction has ended' };
    }
    
    if (bidAmount <= this.current_bid) {
        return { 
            valid: false, 
            reason: `Bid must be higher than current bid of ₹${this.current_bid}` 
        };
    }
    
    return { valid: true };
};

// Indexes for better query performance
auctionSchema.index({ end_time: 1, status: 1 });
auctionSchema.index({ current_bid: -1 });
auctionSchema.index({ createdAt: -1 });

const Auction = mongoose.model('Auction', auctionSchema);

module.exports = Auction;