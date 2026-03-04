// WebSocket client for real-time auction updates
class AuctionWebSocketClient {
    constructor() {
        this.ws = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 3000; // 3 seconds
        this.eventHandlers = new Map();
        this.subscribedAuctions = new Set();
        this.authToken = null;
    }
    
    connect(token = null) {
        if (this.connected && this.ws) {
            console.log('WebSocket already connected');
            return;
        }
        
        this.authToken = token || localStorage.getItem('authToken');
        
        // Build WebSocket URL with token if available
        let wsUrl = `ws://localhost:3003`;
        if (this.authToken) {
            wsUrl += `?token=${encodeURIComponent(this.authToken)}`;
        }
        
        try {
            this.ws = new WebSocket(wsUrl);
            this.setupEventHandlers();
        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            this.scheduleReconnect();
        }
    }
    
    setupEventHandlers() {
        this.ws.onopen = () => {
            console.log('🔌 WebSocket connected');
            this.connected = true;
            this.reconnectAttempts = 0;
            this.triggerEvent('connected', {});
            
            // Resubscribe to previously subscribed auctions
            this.subscribedAuctions.forEach(auctionId => {
                this.subscribeToAuction(auctionId);
            });
        };
        
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (error) {
                console.error('Error parsing WebSocket message:', error);
            }
        };
        
        this.ws.onclose = (event) => {
            console.log('🔌 WebSocket disconnected:', event.code, event.reason);
            this.connected = false;
            this.ws = null;
            this.triggerEvent('disconnected', { code: event.code, reason: event.reason });
            
            if (event.code !== 1000) { // Normal closure
                this.scheduleReconnect();
            }
        };
        
        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.triggerEvent('error', { error });
        };
    }
    
    handleMessage(data) {
        console.log('📨 WebSocket message:', data.type, data);
        
        // Trigger event handlers for this message type
        this.triggerEvent(data.type, data);
        
        // Also trigger a generic message event
        this.triggerEvent('message', data);
    }
    
    subscribeToAuction(auctionId) {
        if (!this.connected || !this.ws) {
            console.log('Not connected, storing subscription for later');
            this.subscribedAuctions.add(auctionId);
            return;
        }
        
        this.ws.send(JSON.stringify({
            type: 'subscribe',
            auctionId: auctionId
        }));
        
        this.subscribedAuctions.add(auctionId);
    }
    
    unsubscribeFromAuction(auctionId) {
        if (!this.connected || !this.ws) {
            this.subscribedAuctions.delete(auctionId);
            return;
        }
        
        this.ws.send(JSON.stringify({
            type: 'unsubscribe',
            auctionId: auctionId
        }));
        
        this.subscribedAuctions.delete(auctionId);
    }
    
    placeBid(auctionId, bidAmount) {
        if (!this.connected || !this.ws) {
            console.error('Cannot place bid: WebSocket not connected');
            return false;
        }
        
        this.ws.send(JSON.stringify({
            type: 'bid',
            auctionId: auctionId,
            bidAmount: bidAmount
        }));
        
        return true;
    }
    
    ping() {
        if (!this.connected || !this.ws) {
            return false;
        }
        
        this.ws.send(JSON.stringify({
            type: 'ping',
            timestamp: Date.now()
        }));
        
        return true;
    }
    
    disconnect() {
        if (this.ws) {
            this.ws.close(1000, 'User disconnected');
            this.ws = null;
        }
        this.connected = false;
        this.subscribedAuctions.clear();
    }
    
    scheduleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached');
            this.triggerEvent('reconnect_failed', {});
            return;
        }
        
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * this.reconnectAttempts;
        
        console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
        
        setTimeout(() => {
            if (!this.connected) {
                this.connect(this.authToken);
            }
        }, delay);
    }
    
    // Event handling
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }
    
    off(event, handler) {
        if (!this.eventHandlers.has(event)) return;
        
        const handlers = this.eventHandlers.get(event);
        const index = handlers.indexOf(handler);
        if (index > -1) {
            handlers.splice(index, 1);
        }
    }
    
    triggerEvent(event, data) {
        if (!this.eventHandlers.has(event)) return;
        
        this.eventHandlers.get(event).forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`Error in event handler for ${event}:`, error);
            }
        });
    }
    
    // Utility methods
    isConnected() {
        return this.connected;
    }
    
    getSubscribedAuctions() {
        return Array.from(this.subscribedAuctions);
    }
    
    setAuthToken(token) {
        this.authToken = token;
        
        // Reconnect with new token if currently connected
        if (this.connected) {
            this.disconnect();
            setTimeout(() => this.connect(token), 100);
        }
    }
}

// Create a singleton instance
const auctionWebSocket = new AuctionWebSocketClient();

// Export the singleton
window.AuctionWebSocket = auctionWebSocket;

// Auto-connect when token is available
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    if (token) {
        setTimeout(() => auctionWebSocket.connect(token), 1000);
    }
});

// Reconnect when user logs in
window.addEventListener('storage', (event) => {
    if (event.key === 'authToken') {
        if (event.newValue) {
            auctionWebSocket.setAuthToken(event.newValue);
        } else {
            auctionWebSocket.disconnect();
        }
    }
});

export default auctionWebSocket;