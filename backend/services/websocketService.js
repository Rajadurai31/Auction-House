// WebSocket service for broadcasting events
let auctionWebSocket = null;

class WebSocketService {
    static setWebSocket(wsInstance) {
        auctionWebSocket = wsInstance;
    }
    
    static broadcastNewBid(auctionId, bidData) {
        if (!auctionWebSocket) {
            console.warn('WebSocket not initialized');
            return;
        }
        
        auctionWebSocket.broadcastToAuction(auctionId, {
            type: 'new_bid',
            auctionId,
            bidAmount: bidData.bidAmount,
            userId: bidData.userId,
            username: bidData.username,
            timestamp: new Date().toISOString()
        });
    }
    
    static broadcastAuctionUpdate(auctionId, auctionData) {
        if (!auctionWebSocket) {
            console.warn('WebSocket not initialized');
            return;
        }
        
        auctionWebSocket.broadcastAuctionUpdate(auctionId, auctionData);
    }
    
    static broadcastAuctionEnded(auctionId, winnerData) {
        if (!auctionWebSocket) {
            console.warn('WebSocket not initialized');
            return;
        }
        
        auctionWebSocket.broadcastAuctionEnded(auctionId, winnerData);
    }
    
    static broadcastNewAuction(auctionData) {
        if (!auctionWebSocket) {
            console.warn('WebSocket not initialized');
            return;
        }
        
        auctionWebSocket.broadcastNewAuction(auctionData);
    }
    
    static getStats() {
        if (!auctionWebSocket) {
            return { error: 'WebSocket not initialized' };
        }
        
        return auctionWebSocket.getStats();
    }
}

module.exports = WebSocketService;