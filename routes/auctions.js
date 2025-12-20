const express = require('express');
const { Auction } = require('../database');

const router = express.Router();

// Get all active auctions
router.get('/', async (req, res) => {
    try {
        const auctions = await Auction.getAll();
        
        // Calculate time left for each auction
        const now = new Date();
        const auctionsWithTimeLeft = auctions.map(auction => {
            const endTime = new Date(auction.end_time);
            const timeLeft = Math.max(0, endTime - now);
            const isActive = timeLeft > 0;
            
            return {
                ...auction,
                timeLeft: Math.floor(timeLeft / 1000), // seconds
                isActive,
                status: isActive ? 'active' : 'ended'
            };
        });

        res.json(auctionsWithTimeLeft);
    } catch (error) {
        console.error('Error fetching auctions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get single auction by ID
router.get('/:id', async (req, res) => {
    try {
        const auction = await Auction.getById(req.params.id);
        
        if (!auction) {
            return res.status(404).json({ error: 'Auction not found' });
        }

        const now = new Date();
        const endTime = new Date(auction.end_time);
        const timeLeft = Math.max(0, endTime - now);
        const isActive = timeLeft > 0;

        res.json({
            ...auction,
            timeLeft: Math.floor(timeLeft / 1000),
            isActive,
            status: isActive ? 'active' : 'ended'
        });
    } catch (error) {
        console.error('Error fetching auction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new auction (admin endpoint - you can add admin auth later)
router.post('/', async (req, res) => {
    try {
        const {
            title,
            description,
            image_url,
            starting_bid,
            current_bid,
            buy_now_price,
            end_time
        } = req.body;

        if (!title || !starting_bid || !end_time) {
            return res.status(400).json({ error: 'Title, starting bid, and end time are required' });
        }

        const auction = await Auction.create({
            title,
            description,
            image_url,
            starting_bid,
            current_bid: current_bid || starting_bid,
            buy_now_price,
            end_time
        });

        res.status(201).json(auction);
    } catch (error) {
        console.error('Error creating auction:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

