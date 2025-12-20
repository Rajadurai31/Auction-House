const express = require('express');
const { Auction, Bid } = require('../database');

const router = express.Router();

// Place a bid
router.post('/', async (req, res) => {
    try {
        const { auctionId, bidAmount } = req.body;
        const userId = req.user.id;

        if (!auctionId || !bidAmount) {
            return res.status(400).json({ error: 'Auction ID and bid amount are required' });
        }

        // Get auction details
        const auction = await Auction.getById(auctionId);
        if (!auction) {
            return res.status(404).json({ error: 'Auction not found' });
        }

        // Check if auction is still active
        const now = new Date();
        const endTime = new Date(auction.end_time);
        if (endTime <= now) {
            return res.status(400).json({ error: 'Auction has ended' });
        }

        // Validate bid amount
        if (bidAmount <= auction.current_bid) {
            return res.status(400).json({ 
                error: `Bid must be higher than current bid of ₹${auction.current_bid}` 
            });
        }

        // Create bid record
        const bid = await Bid.create(auctionId, userId, bidAmount);

        // Update auction current bid
        await Auction.updateBid(auctionId, bidAmount);

        res.status(201).json({
            message: 'Bid placed successfully',
            bid: {
                ...bid,
                newCurrentBid: bidAmount
            }
        });
    } catch (error) {
        console.error('Error placing bid:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get bids for a specific auction
router.get('/auction/:auctionId', async (req, res) => {
    try {
        const bids = await Bid.getByAuctionId(req.params.auctionId);
        res.json(bids);
    } catch (error) {
        console.error('Error fetching bids:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's bids
router.get('/my-bids', async (req, res) => {
    try {
        const userId = req.user.id;
        const bids = await Bid.getUserBids(userId);
        res.json(bids);
    } catch (error) {
        console.error('Error fetching user bids:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

