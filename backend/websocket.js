const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const Bid = require('./models/Bid');
const Auction = require('./models/Auction');
const User = require('./models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

class WebSocketServer {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // Map of clientId -> { ws, userId, subscriptions }
        this.auctionSubscriptions = new Map(); // Map of auctionId -> Set of clientIds
        
        this.setupEventHandlers();
        console.log('🔌 WebSocket server initialized');
    }

    setupEventHandlers() {
        this.wss.on('connection', (ws, req) => {
            const clientId = this.generateClientId();
            const token = this.extractTokenFromRequest(req);
            let userId = null;
            let username = 'Anonymous';

            // Authenticate user if token is provided
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    userId = decoded.userId;
                    username = decoded.username;
                } catch (error) {
                    console.log('Invalid token for WebSocket connection');
                }
            }

            // Store client information
            this.clients.set(clientId, {
                ws,
                userId,
                username,
                subscriptions: new Set()
            });

            console.log(`🔌 New WebSocket connection: ${clientId} (User: ${username})`);

            // Send welcome message
            this.sendToClient(clientId, {
                type: 'connected',
                message: 'Connected to live auction updates',
                clientId,
                username
            });

            // Setup message handler
            ws.on('message', async (message) => {
                try {
                    const data = JSON.parse(message);
                    await this.handleMessage(clientId, data);
                } catch (error) {
                    console.error('Error processing WebSocket message:', error);
                    this.sendToClient(clientId, {
                        type: 'error',
                        error: 'Invalid message format'
                    });
                }
            });

            // Setup close handler
            ws.on('close', () => {
                console.log(`🔌 WebSocket connection closed: ${clientId}`);
                this.handleDisconnect(clientId);
            });

            // Setup error handler
            ws.on('error', (error) => {
                console.error(`WebSocket error for client ${clientId}:`, error);
                this.handleDisconnect(clientId);
            });
        });
    }

    generateClientId() {
        return Math.random().toString(36).substring(2, 15);
    }

    extractTokenFromRequest(req) {
        const url = new URL(req.url, `http://${req.headers.host}`);
        return url.searchParams.get('token');
    }

    async handleMessage(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client) return;

        switch (data.type) {
            case 'subscribe':
                await this.handleSubscribe(clientId, data.auctionId);
                break;

            case 'unsubscribe':
                this.handleUnsubscribe(clientId, data.auctionId);
                break;

            case 'bid':
                await this.handleBid(clientId, data.auctionId, data.bidAmount);
                break;

            case 'ping':
                this.sendToClient(clientId, { type: 'pong' });
                break;

            default:
                console.log(`Unknown message type: ${data.type}`);
        }
    }

    async handleSubscribe(clientId, auctionId) {
        const client = this.clients.get(clientId);
        if (!client) return;

        try {
            // Verify auction exists
            const auction = await Auction.findById(auctionId);
            if (!auction) {
                this.sendToClient(clientId, {
                    type: 'error',
                    error: 'Auction not found'
                });
                return;
            }

            // Add subscription
            client.subscriptions.add(auctionId);

            // Update auction subscriptions map
            if (!this.auctionSubscriptions.has(auctionId)) {
                this.auctionSubscriptions.set(auctionId, new Set());
            }
            this.auctionSubscriptions.get(auctionId).add(clientId);

            console.log(`📡 Client ${clientId} subscribed to auction ${auctionId}`);

            // Send current auction state
            this.sendToClient(clientId, {
                type: 'subscribed',
                auctionId,
                auction: {
                    _id: auction._id,
                    title: auction.title,
                    current_bid: auction.current_bid,
                    end_time: auction.end_time
                }
            });

            // Send recent bids
            const recentBids = await Bid.find({ auction: auctionId })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('bidder', 'username');

            recentBids.forEach(bid => {
                this.sendToClient(clientId, {
                    type: 'new_bid',
                    auctionId,
                    bid: {
                        _id: bid._id,
                        bidAmount: bid.bidAmount,
                        bidder: {
                            username: bid.bidder.username
                        },
                        createdAt: bid.createdAt
                    }
                });
            });

        } catch (error) {
            console.error('Error handling subscription:', error);
            this.sendToClient(clientId, {
                type: 'error',
                error: 'Failed to subscribe to auction'
            });
        }
    }

    handleUnsubscribe(clientId, auctionId) {
        const client = this.clients.get(clientId);
        if (!client) return;

        client.subscriptions.delete(auctionId);

        const auctionSubs = this.auctionSubscriptions.get(auctionId);
        if (auctionSubs) {
            auctionSubs.delete(clientId);
            if (auctionSubs.size === 0) {
                this.auctionSubscriptions.delete(auctionId);
            }
        }

        console.log(`📡 Client ${clientId} unsubscribed from auction ${auctionId}`);

        this.sendToClient(clientId, {
            type: 'unsubscribed',
            auctionId
        });
    }

    async handleBid(clientId, auctionId, bidAmount) {
        const client = this.clients.get(clientId);
        if (!client || !client.userId) {
            this.sendToClient(clientId, {
                type: 'error',
                error: 'Authentication required to place bids'
            });
            return;
        }

        try {
            // Verify auction exists and is active
            const auction = await Auction.findById(auctionId);
            if (!auction) {
                this.sendToClient(clientId, {
                    type: 'error',
                    error: 'Auction not found'
                });
                return;
            }

            if (new Date(auction.end_time) <= new Date()) {
                this.sendToClient(clientId, {
                    type: 'error',
                    error: 'Auction has ended'
                });
                return;
            }

            // Verify bid amount is higher than current bid
            if (bidAmount <= auction.current_bid) {
                this.sendToClient(clientId, {
                    type: 'error',
                    error: `Bid must be higher than current bid: ${auction.current_bid}`
                });
                return;
            }

            // Create bid
            const bid = new Bid({
                auction: auctionId,
                bidder: client.userId,
                bidAmount
            });

            await bid.save();

            // Update auction current bid
            auction.current_bid = bidAmount;
            await auction.save();

            // Populate bidder info
            await bid.populate('bidder', 'username');

            console.log(`💰 New bid placed: ${bidAmount} on auction ${auctionId} by ${client.username}`);

            // Broadcast new bid to all subscribed clients
            this.broadcastToAuction(auctionId, {
                type: 'new_bid',
                auctionId,
                bid: {
                    _id: bid._id,
                    bidAmount: bid.bidAmount,
                    bidder: {
                        username: bid.bidder.username
                    },
                    createdAt: bid.createdAt
                }
            });

            // Check if auction has ended
            if (new Date(auction.end_time) <= new Date()) {
                this.broadcastToAuction(auctionId, {
                    type: 'auction_ended',
                    auctionId,
                    winner: bid.bidder.username,
                    winningBid: bidAmount
                });
            }

        } catch (error) {
            console.error('Error handling bid:', error);
            this.sendToClient(clientId, {
                type: 'error',
                error: 'Failed to place bid'
            });
        }
    }

    handleDisconnect(clientId) {
        const client = this.clients.get(clientId);
        if (!client) return;

        // Remove from all subscriptions
        client.subscriptions.forEach(auctionId => {
            const auctionSubs = this.auctionSubscriptions.get(auctionId);
            if (auctionSubs) {
                auctionSubs.delete(clientId);
                if (auctionSubs.size === 0) {
                    this.auctionSubscriptions.delete(auctionId);
                }
            }
        });

        this.clients.delete(clientId);
    }

    sendToClient(clientId, data) {
        const client = this.clients.get(clientId);
        if (!client || client.ws.readyState !== WebSocket.OPEN) return;

        try {
            client.ws.send(JSON.stringify(data));
        } catch (error) {
            console.error('Error sending message to client:', error);
        }
    }

    broadcastToAuction(auctionId, data) {
        const subscribers = this.auctionSubscriptions.get(auctionId);
        if (!subscribers) return;

        subscribers.forEach(clientId => {
            this.sendToClient(clientId, data);
        });
    }

    broadcastToAll(data) {
        this.clients.forEach((client, clientId) => {
            this.sendToClient(clientId, data);
        });
    }

    getStats() {
        return {
            totalClients: this.clients.size,
            totalSubscriptions: Array.from(this.auctionSubscriptions.values())
                .reduce((sum, set) => sum + set.size, 0),
            activeAuctions: this.auctionSubscriptions.size
        };
    }
}

module.exports = WebSocketServer;