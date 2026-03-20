import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext({});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [latency, setLatency] = useState(0);
  const [activeAuctions, setActiveAuctions] = useState(new Set());
  const [bidHistory, setBidHistory] = useState([]);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const eventHandlersRef = useRef(new Map());
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const wsUrl = `ws://localhost:3003/ws?token=${token || ''}`;
    console.log('Connecting to WebSocket:', wsUrl);
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket connected');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        
        // Start heartbeat
        startHeartbeat();
        
        // Resubscribe to auctions
        activeAuctions.forEach(auctionId => {
          subscribeToAuction(auctionId);
        });
        
        toast.success('Connected to live updates');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleIncomingMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        handleDisconnect();
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error');
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      scheduleReconnect();
    }
  }, [token]);

  const handleIncomingMessage = (data) => {
    const { type, payload } = data;
    
    switch(type) {
      case 'bid_placed':
        handleNewBid(payload);
        break;
      case 'auction_updated':
        handleAuctionUpdate(payload);
        break;
      case 'auction_ended':
        handleAuctionEnded(payload);
        break;
      case 'new_bidder':
        handleNewBidder(payload);
        break;
      case 'heartbeat':
        handleHeartbeat(payload);
        break;
      default:
        console.log('Unknown message type:', type);
    }
  };

  const handleNewBid = (bidData) => {
    const { auctionId, bidAmount, bidder, timestamp } = bidData;
    
    // Update bid history
    setBidHistory(prev => [{
      auctionId,
      bidAmount,
      bidder,
      timestamp,
      type: 'bid'
    }, ...prev].slice(0, 50)); // Keep last 50 bids

    // Trigger event for new bid
    triggerEvent('new_bid', bidData);
    
    // Show toast notification
    toast.info(`New bid: $${bidAmount} by ${bidder}`);
  };

  const handleAuctionUpdate = (auctionData) => {
    const { auctionId, currentBid, bidCount, timeRemaining } = auctionData;
    
    // Update auction data
    triggerEvent('auction_update', auctionData);
  };

  const handleAuctionEnded = (auctionData) => {
    const { auctionId, winner, winningBid } = auctionData;
    
    toast.success(`Auction ${auctionId} ended! Winner: ${winner} with $${winningBid}`);
    triggerEvent('auction_ended', auctionData);
  };

  const handleNewBidder = (bidderData) => {
    const { auctionId, bidderId, username } = bidderData;
    toast.info(`${username} joined the auction`);
  };

  const handleHeartbeat = (data) => {
    // Update latency
    const now = Date.now();
    const latency = now - data.timestamp;
    setLatency(latency);
  };

  const startHeartbeat = () => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
    }
    
    pingIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: 'ping',
          timestamp: Date.now()
        }));
      }
    }, 30000); // Every 30 seconds
  };

  const subscribeToAuction = (auctionId) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }

    const message = {
      type: 'subscribe',
      auctionId
    };
    
    wsRef.current.send(JSON.stringify(message));
    setActiveAuctions(prev => new Set([...prev, auctionId]));
  };

  const unsubscribeFromAuction = (auctionId) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    const message = {
      type: 'unsubscribe',
      auctionId
    };
    
    wsRef.current.send(JSON.stringify(message));
    setActiveAuctions(prev => {
      const newSet = new Set(prev);
      newSet.delete(auctionId);
      return newSet;
    });
  };

  const placeBid = (auctionId, amount) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      toast.error('Not connected to server');
      return false;
    }

    const bidData = {
      type: 'place_bid',
      auctionId,
      amount,
      timestamp: Date.now()
    };

    wsRef.current.send(JSON.stringify(bidData));
    return true;
  };

  const triggerEvent = (event, data) => {
    if (eventHandlersRef.current.has(event)) {
      eventHandlersRef.current.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      });
    }
  };

  const on = (event, handler) => {
    if (!eventHandlersRef.current.has(event)) {
      eventHandlersRef.current.set(event, []);
    }
    eventHandlersRef.current.get(event).push(handler);
  };

  const off = (event, handler) => {
    if (!eventHandlersRef.current.has(event)) return;
    
    const handlers = eventHandlersRef.current.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  };

  // Auto-reconnect logic
  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectionStatus('reconnecting');
    
    if (reconnectAttemptsRef.current < maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
      
      reconnectTimeoutRef.current = setTimeout(() => {
        reconnectAttemptsRef.current++;
        connect();
      }, delay);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
    };
  }, []);

  const value = {
    isConnected,
    connectionStatus,
    latency,
    activeAuctions: Array.from(activeAuctions),
    bidHistory,
    subscribeToAuction,
    unsubscribeFromAuction,
    placeBid,
    on,
    off,
    connect,
    disconnect: () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    }
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export { WebSocketContext, useWebSocket, WebSocketProvider };