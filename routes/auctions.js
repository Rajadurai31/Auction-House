const express = require('express');
const AuctionController = require('../controllers/auctionController');

const router = express.Router();

// Get all auctions
router.get('/', AuctionController.getAllAuctions);

// Get active auctions
router.get('/active', AuctionController.getActiveAuctions);

// Get ended auctions
router.get('/ended', AuctionController.getEndedAuctions);

// Get single auction by ID
router.get('/:id', AuctionController.getAuctionById);

// Create new auction
router.post('/', AuctionController.createAuction);

module.exports = router;