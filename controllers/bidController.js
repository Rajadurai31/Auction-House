const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

class BidController {
    // Place a bid
    static async placeBid(req, res) {
        try {
            const { auctionId, bidAmount } = req.body;
            const userId = req.user.id;

            // Validate input
            if (!auctionId || !bidAmount) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Auction ID and bid amount are required' 
                });
            }

            // Get auction details
            const auction = await Auction.getById(auctionId);
            if (!auction) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Auction not found' 
                });
            }

            // Check if auction can be bid on
            const canBid = auction.canBid(bidAmount);
            if (!canBid.valid) {
                return res.status(400).json({ 
                    success: false,
                    error: canBid.reason 
                });
            }

            // Create bid record
            const bid = await Bid.createBid(auctionId, userId, bidAmount);

            // Update auction current bid
            await Auction.updateBid(auctionId, bidAmount);

            // Mark previous highest bid as outbid
            await Bid.updateMany(
                { 
                    auction: auctionId,
                    _id: { $ne: bid._id },
                    status: 'active'
                },
                { status: 'outbid' }
            );

            res.status(201).json({
                success: true,
                message: 'Bid placed successfully',
                data: {
                    bid: bid,
                    newCurrentBid: bidAmount,
                    auctionTitle: auction.title
                }
            });
        } catch (error) {
            console.error('Error placing bid:', error);
            
            // Handle invalid ObjectId
            if (error.name === 'CastError') {
                return res.status(400).json({ 
                    success: false,
                    error: 'Invalid auction ID format' 
                });
            }

            res.status(500).json({ 
                success: false,
                error: 'Internal server error' 
            });
        }
    }

    // Get bids for a specific auction
    static async getBidsByAuction(req, res) {
        try {
            const bids = await Bid.getBidsByAuction(req.params.auctionId);

            res.json({
                success: true,
                count: bids.length,
                data: bids
            });
        } catch (error) {
            console.error('Error fetching bids:', error);
            
            // Handle invalid ObjectId
            if (error.name === 'CastError') {
                return res.status(400).json({ 
                    success: false,
                    error: 'Invalid auction ID format' 
                });
            }

            res.status(500).json({ 
                success: false,
                error: 'Internal server error' 
            });
        }
    }

    // Get user's bids
    static async getUserBids(req, res) {
        try {
            const userId = req.user.id;
            const bids = await Bid.getUserBids(userId);

            res.json({
                success: true,
                count: bids.length,
                data: bids
            });
        } catch (error) {
            console.error('Error fetching user bids:', error);
            res.status(500).json({ 
                success: false,
                error: 'Internal server error' 
            });
        }
    }

    // Get highest bid for auction
    static async getHighestBid(req, res) {
        try {
            const highestBid = await Bid.getHighestBid(req.params.auctionId);

            if (!highestBid) {
                return res.status(404).json({ 
                    success: false,
                    error: 'No bids found for this auction' 
                });
            }

            res.json({
                success: true,
                data: highestBid
            });
        } catch (error) {
            console.error('Error fetching highest bid:', error);
            
            // Handle invalid ObjectId
            if (error.name === 'CastError') {
                return res.status(400).json({ 
                    success: false,
                    error: 'Invalid auction ID format' 
                });
            }

            res.status(500).json({ 
                success: false,
                error: 'Internal server error' 
            });
        }
    }

    // Get bid history for auction (with pagination)
    static async getBidHistory(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            const skip = (page - 1) * limit;

            const bids = await Bid.find({ auction: req.params.auctionId })
                .populate('user', 'username')
                .sort({ bidAmount: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec();

            const totalBids = await Bid.countDocuments({ auction: req.params.auctionId });

            res.json({
                success: true,
                page,
                limit,
                totalPages: Math.ceil(totalBids / limit),
                totalBids,
                data: bids
            });
        } catch (error) {
            console.error('Error fetching bid history:', error);
            
            // Handle invalid ObjectId
            if (error.name === 'CastError') {
                return res.status(400).json({ 
                    success: false,
                    error: 'Invalid auction ID format' 
                });
            }

            res.status(500).json({ 
                success: false,
                error: 'Internal server error' 
            });
        }
    }
}

module.exports = BidController;