const Auction = require('../models/Auction');
const WebSocketService = require('../services/websocketService');

class AuctionController {
    // Get all auctions
    static async getAllAuctions(req, res) {
        try {
            const auctions = await Auction.getAll();
            
            // Add virtual properties to response
            const auctionsWithDetails = auctions.map(auction => ({
                ...auction.toObject(),
                timeLeft: auction.timeLeft,
                isActive: auction.isActive,
                status: auction.isActive ? 'active' : 'ended'
            }));

            res.json({
                success: true,
                count: auctionsWithDetails.length,
                data: auctionsWithDetails
            });
        } catch (error) {
            console.error('Error fetching auctions:', error);
            res.status(500).json({ 
                success: false,
                error: 'Internal server error' 
            });
        }
    }

    // Get single auction by ID
    static async getAuctionById(req, res) {
        try {
            const auction = await Auction.getById(req.params.id);

            if (!auction) {
                return res.status(404).json({ 
                    success: false,
                    error: 'Auction not found' 
                });
            }

            const auctionWithDetails = {
                ...auction.toObject(),
                timeLeft: auction.timeLeft,
                isActive: auction.isActive,
                status: auction.isActive ? 'active' : 'ended'
            };

            res.json({
                success: true,
                data: auctionWithDetails
            });
        } catch (error) {
            console.error('Error fetching auction:', error);
            
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

    // Create new auction
    static async createAuction(req, res) {
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

            // Validate required fields
            if (!title || !starting_bid || !end_time) {
                return res.status(400).json({ 
                    success: false,
                    error: 'Title, starting bid, and end time are required' 
                });
            }

            // Validate end time is in future
            const endTime = new Date(end_time);
            if (endTime <= new Date()) {
                return res.status(400).json({ 
                    success: false,
                    error: 'End time must be in the future' 
                });
            }

            const auctionData = {
                title,
                description,
                image_url,
                starting_bid,
                current_bid: current_bid || starting_bid,
                buy_now_price,
                end_time: endTime
            };

            const auction = await Auction.createAuction(auctionData);

            // Broadcast new auction via WebSocket
            WebSocketService.broadcastNewAuction(auction);

            res.status(201).json({
                success: true,
                message: 'Auction created successfully',
                data: auction
            });
        } catch (error) {
            console.error('Error creating auction:', error);
            
            // Handle Mongoose validation errors
            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ 
                    success: false,
                    error: errors.join(', ') 
                });
            }

            res.status(500).json({ 
                success: false,
                error: 'Internal server error' 
            });
        }
    }

    // Get active auctions
    static async getActiveAuctions(req, res) {
        try {
            const auctions = await Auction.getActiveAuctions();
            
            const auctionsWithDetails = auctions.map(auction => ({
                ...auction.toObject(),
                timeLeft: auction.timeLeft,
                isActive: auction.isActive
            }));

            res.json({
                success: true,
                count: auctionsWithDetails.length,
                data: auctionsWithDetails
            });
        } catch (error) {
            console.error('Error fetching active auctions:', error);
            res.status(500).json({ 
                success: false,
                error: 'Internal server error' 
            });
        }
    }

    // Get ended auctions
    static async getEndedAuctions(req, res) {
        try {
            const auctions = await Auction.getEndedAuctions();
            
            const auctionsWithDetails = auctions.map(auction => ({
                ...auction.toObject(),
                timeLeft: 0,
                isActive: false
            }));

            res.json({
                success: true,
                count: auctionsWithDetails.length,
                data: auctionsWithDetails
            });
        } catch (error) {
            console.error('Error fetching ended auctions:', error);
            res.status(500).json({ 
                success: false,
                error: 'Internal server error' 
            });
        }
    }
}

module.exports = AuctionController;