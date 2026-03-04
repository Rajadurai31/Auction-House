// WebSocket server for real-time auction updates
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

class AuctionWebSocket {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // Map of client connections
        this.auctionRooms = new Map(); // Map of auction rooms
        
        console.log('🔌 WebSocket server initialized');
        
        this.setupConnectionHandlers();
    }
    
    setupConnectionHandlers() {
        this.wss.on('connection', (ws, req) => {
            console.log('🔗 New WebSocket connection');
            
            // Extract token from query parameters
            const url = new URL(req.url, `http://${req.headers.host}`);
            const token = url.searchParams.get('token');
            
            let userId = null;
            let username = null;
            
            // Verify JWT token if provided
            if (token) {
                try {
                    const decoded = jwt.verify(token, JWT_SECRET);
                    userId = decoded.id;
                    username = decoded.username;
                    console.log(`   Authenticated as: ${username} (${userId})`);
                } catch (error) {
                    console.log('   Invalid token, connection will be read-only');
                }
            }
            
            // Store client information
            const clientId = Date.now() + Math.random().toString(36).substr(2, 9);
            this.clients.set(clientId, {
                ws,
                userId,
                username,
                subscribedAuctions: new Set()
            });
            
            // Setup message handler
            ws.on('message', (message) => {
                this.handleMessage(clientId, message);
            });
            
            // Setup close handler
            ws.on('close', () => {
                this.handleDisconnect(clientId);
            });
            
            // Setup error handler
            ws.on('error', (error) => {
                console.error('WebSocket error:', error);
                this.handleDisconnect(clientId);
            });
            
            // Send welcome message
            this.sendToClient(clientId, {
                type: 'welcome',
                message: 'Connected to Auction House Live',
                timestamp: new Date().toISOString(),
                clientId
            });
        });
    }
    
    handleMessage(clientId, message) {
        try {
            const data = JSON.parse(message);
            const client = this.clients.get(clientId);
            
            if (!client) return;
            
            switch (data.type) {
                case 'subscribe':
                    this.handleSubscribe(clientId, data.auctionId);
                    break;
                    
                case 'unsubscribe':
                    this.handleUnsubscribe(clientId, data.auctionId);
                    break;
                    
                case 'bid':
                    this.handleBid(clientId, data);
                    break;
                    
                case 'ping':
                    this.sendToClient(clientId, { type: 'pong', timestamp: new Date().toISOString() });
                    break;
                    
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('Error handling message:', error);
        }
    }
    
    handleSubscribe(clientId, auctionId) {
        const client = this.clients.get(clientId);
        if (!client) return;
        
        client.subscribedAuctions.add(auctionId);
        
        // Add client to auction room
        if (!this.auctionRooms.has(auctionId)) {
            this.auctionRooms.set(auctionId, new Set());
        }
        this.auctionRooms.get(auctionId).add(clientId);
        
        console.log(`   Client ${clientId} subscribed to auction ${auctionId}`);
        
        this.sendToClient(clientId, {
            type: 'subscribed',
            auctionId,
            message: `Subscribed to auction ${auctionId}`,
            timestamp: new Date().toISOString()
        });
    }
    
    handleUnsubscribe(clientId, auctionId) {
        const client = this.clients.get(clientId);
        if (!client) return;
        
        client.subscribedAuctions.delete(auctionId);
        
        // Remove client from auction room
        if (this.auctionRooms.has(auctionId)) {
            this.auctionRooms.get(auctionId).delete(clientId);
        }
        
        console.log(`   Client ${clientId} unsubscribed from auction ${auctionId}`);
        
        this.sendToClient(clientId, {
            type: 'unsubscribed',
            auctionId,
            message: `Unsubscribed from auction ${auctionId}`,
            timestamp: new Date().toISOString()
        });
    }
    
    handleBid(clientId, bidData) {
        const client = this.clients.get(clientId);
        if (!client || !client.userId) {
            this.sendToClient(clientId, {
                type: 'error',
                message: 'Authentication required to place bids',
                timestamp: new Date().toISOString()
            });
            return;
        }
        
        const { auctionId, bidAmount } = bidData;
        
        // Broadcast bid to all subscribers
        this.broadcastToAuction(auctionId, {
            type: 'new_bid',
            auctionId,
            bidAmount,
            userId: client.userId,
            username: client.username,
            timestamp: new Date().toISOString()
        });
        
        console.log(`   New bid on auction ${auctionId}: ${bidAmount} by ${client.username}`);
    }
    
    handleDisconnect(clientId) {
        const client = this.clients.get(clientId);
        if (!client) return;
        
        // Remove client from all auction rooms
        client.subscribedAuctions.forEach(auctionId => {
            if (this.auctionRooms.has(auctionId)) {
                this.auctionRooms.get(auctionId).delete(clientId);
            }
        });
        
        this.clients.delete(clientId);
        console.log(`   Client ${clientId} disconnected`);
    }
    
    sendToClient(clientId, message) {
        const client = this.clients.get(clientId);
        if (!client || !client.ws || client.ws.readyState !== WebSocket.OPEN) return;
        
        try {
            client.ws.send(JSON.stringify(message));
        } catch (error) {
            console.error('Error sending to client:', error);
        }
    }
    
    broadcastToAuction(auctionId, message) {
        if (!this.auctionRooms.has(auctionId)) return;
        
        const clients = this.auctionRooms.get(auctionId);
        clients.forEach(clientId => {
            this.sendToClient(clientId, message);
        });
    }
    
    // Public methods for server to trigger events
    broadcastAuctionUpdate(auctionId, auctionData) {
        this.broadcastToAuction(auctionId, {
            type: 'auction_update',
            auctionId,
            auction: auctionData,
            timestamp: new Date().toISOString()
        });
    }
    
    broadcastAuctionEnded(auctionId, winnerData) {
        this.broadcastToAuction(auctionId, {
            type: 'auction_ended',
            auctionId,
            winner: winnerData,
            timestamp: new Date().toISOString()
        });
    }
    
    broadcastNewAuction(auctionData) {
        // Broadcast to all connected clients
        this.clients.forEach((client, clientId) => {
            this.sendToClient(clientId, {
                type: 'new_auction',
                auction: auctionData,
                timestamp: new Date().toISOString()
            });
        });
    }
    
    getStats() {
        return {
            totalClients: this.clients.size,
            totalAuctionRooms: this.auctionRooms.size,
            connectedUsers: Array.from(this.clients.values())
                .filter(client => client.userId)
                .map(client => client.username)
        };
    }
}

module.exports = AuctionWebSocket;