/**
 * React hook for WebSocket functionality
 */
import { useEffect, useCallback, useState } from 'react';
import webSocketService from '../services/websocket';

export const useWebSocket = (token = null, autoConnect = true) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    if (autoConnect) {
      // Subscribe to connection events
      const unsubscribeConnection = webSocketService.subscribe('connection', (data) => {
        setIsConnected(data.status === 'connected');
        if (data.status === 'disconnected') {
          setIsAuthenticated(false);
        }
      });

      // Subscribe to authentication events
      const unsubscribeAuth = webSocketService.subscribe('auth', (data) => {
        setIsAuthenticated(data.status === 'success');
      });

      // Subscribe to error events
      const unsubscribeError = webSocketService.subscribe('error', (data) => {
        setConnectionError(data.error);
      });

      // Connect to WebSocket
      webSocketService.connect(token);
      webSocketService.startPing();

      // Cleanup on unmount
      return () => {
        unsubscribeConnection();
        unsubscribeAuth();
        unsubscribeError();
        webSocketService.stopPing();
      };
    }
  }, [token, autoConnect]);

  const sendMessage = useCallback((message) => {
    webSocketService.send(message);
  }, []);

  const subscribe = useCallback((eventType, callback) => {
    return webSocketService.subscribe(eventType, callback);
  }, []);

  return {
    isConnected,
    isAuthenticated,
    connectionError,
    sendMessage,
    subscribe
  };
};

// Hook for booking updates
export const useBookingUpdates = (token = null) => {
  const [bookingUpdates, setBookingUpdates] = useState([]);
  const { isConnected, isAuthenticated, subscribe } = useWebSocket(token);

  useEffect(() => {
    if (isConnected) {
      const unsubscribe = subscribe('booking_update', (data) => {
        console.log('Received booking update:', data);
        setBookingUpdates(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 updates
      });

      return unsubscribe;
    }
  }, [isConnected, subscribe]);

  return {
    bookingUpdates,
    isConnected,
    isAuthenticated
  };
};

// Hook for room availability updates
export const useRoomAvailability = (roomId, token = null) => {
  const [availability, setAvailability] = useState(null);
  const { isConnected, subscribe } = useWebSocket(token);

  useEffect(() => {
    if (isConnected && roomId) {
      const unsubscribe = subscribe('room_availability_update', (data) => {
        if (data.room_id === roomId) {
          console.log('Received room availability update:', data);
          setAvailability(data);
        }
      });

      return unsubscribe;
    }
  }, [isConnected, roomId, subscribe]);

  return {
    availability,
    isConnected
  };
};

// Hook for booking status changes
export const useBookingStatusUpdates = (token = null) => {
  const [statusUpdates, setStatusUpdates] = useState([]);
  const { isConnected, subscribe } = useWebSocket(token);

  useEffect(() => {
    if (isConnected) {
      const unsubscribe = subscribe('booking_status_change', (data) => {
        console.log('Received booking status change:', data);
        setStatusUpdates(prev => [data, ...prev.slice(0, 9)]); // Keep last 10 updates
      });

      return unsubscribe;
    }
  }, [isConnected, subscribe]);

  return {
    statusUpdates,
    isConnected
  };
};