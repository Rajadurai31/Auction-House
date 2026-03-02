const express = require('express');
const BidController = require('../controllers/bidController');

const router = express.Router();

// Place a bid
router.post('/', BidController.placeBid);

// Get bids for a specific auction
router.get('/auction/:auctionId', BidController.getBidsByAuction);

// Get user's bids
router.get('/my-bids', BidController.getUserBids);

// Get highest bid for auction
router.get('/highest/:auctionId', BidController.getHighestBid);

// Get bid history with pagination
router.get('/history/:auctionId', BidController.getBidHistory);

module.exports = router;