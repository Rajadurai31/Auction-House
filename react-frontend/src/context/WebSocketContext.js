import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext';

const WebSocketContext = createContext({});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [subscribedAuctions, setSubscribedAuctions] = useState(new Set());
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const eventHandlersRef = useRef(new Map());

  const connect = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    const token = localStorage.getItem('authToken');
    let wsUrl = `ws://localhost:3003`;
    if (token) {
      wsUrl += `?token=${encodeURIComponent(token)}`;
    }

    try {
      wsRef.current = new WebSocket(wsUrl);
      setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      scheduleReconnect();
    }
  };

  const setupEventHandlers = () => {
    const ws = wsRef.current;
    if (!ws) return;

    ws.onopen = () => {
      console.log('🔌 WebSocket connected');
      setIsConnected(true);
      triggerEvent('connected', {});
      
      // Resubscribe to previously subscribed auctions
      subscribedAuctions.forEach(auctionId => {
        subscribeToAuction(auctionId);
      });
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📨 WebSocket message:', data.type, data);
        triggerEvent(data.type, data);
        triggerEvent('message', data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      triggerEvent('disconnected', { code: event.code, reason: event.reason });
      
      if (event.code !== 1000) {
        scheduleReconnect();
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      triggerEvent('error', { error });
    };
  };

  const subscribeToAuction = (auctionId) => {
    if (!isConnected || !wsRef.current) {
      console.log('Not connected, storing subscription for later');
      setSubscribedAuctions(prev => new Set([...prev, auctionId]));
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'subscribe',
      auctionId
    }));

    setSubscribedAuctions(prev => new Set([...prev, auctionId]));
  };

  const unsubscribeFromAuction = (auctionId) => {
    if (!isConnected || !wsRef.current) {
      setSubscribedAuctions(prev => {
        const newSet = new Set(prev);
        newSet.delete(auctionId);
        return newSet;
      });
      return;
    }

    wsRef.current.send(JSON.stringify({
      type: 'unsubscribe',
      auctionId
    }));

    setSubscribedAuctions(prev => {
      const newSet = new Set(prev);
      newSet.delete(auctionId);
      return newSet;
    });
  };

  const placeBid = (auctionId, bidAmount) => {
    if (!isConnected || !wsRef.current) {
      toast.error('Cannot place bid: Not connected to live updates');
      return false;
    }

    wsRef.current.send(JSON.stringify({
      type: 'bid',
      auctionId,
      bidAmount
    }));

    return true;
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isConnected) {
        connect();
      }
    }, 3000);
  };

  // Event handling
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

  const triggerEvent = (event, data) => {
    if (!eventHandlersRef.current.has(event)) return;
    
    eventHandlersRef.current.get(event).forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    setIsConnected(false);
    setSubscribedAuctions(new Set());
  };

  // Connect on mount and when user changes
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        subscribeToAuction,
        unsubscribeFromAuction,
        placeBid,
        on,
        off,
        disconnect,
        connect
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};