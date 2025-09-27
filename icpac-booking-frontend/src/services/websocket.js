/**
 * WebSocket service for real-time communication
 */

class WebSocketService {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectInterval = 3000;
    this.subscribers = new Map();
    this.messageQueue = [];
  }

  connect(token = null) {
    try {
      // Determine WebSocket URL based on environment
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = window.location.host;
      let wsUrl = `${protocol}//${host}/ws/bookings/`;
      
      // Add token to query string for authentication
      if (token) {
        wsUrl += `?token=${encodeURIComponent(token)}`;
      }
      
      console.log('Connecting to WebSocket:', wsUrl);
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Authenticate if token provided
        if (token) {
          this.authenticate(token);
        }
        
        // Send any queued messages
        this.flushMessageQueue();
        
        // Notify subscribers
        this.notifySubscribers('connection', { status: 'connected' });
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket message received:', data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        this.isConnected = false;
        this.notifySubscribers('connection', { status: 'disconnected' });
        
        // Attempt to reconnect
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            this.connect(token);
          }, this.reconnectInterval);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifySubscribers('error', { error: 'Connection error' });
      };
      
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  authenticate(token) {
    this.send({
      type: 'auth',
      token: token
    });
  }

  send(message) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is established
      this.messageQueue.push(message);
    }
  }

  flushMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.send(message);
    }
  }

  handleMessage(data) {
    const { type } = data;
    
    switch (type) {
      case 'auth_success':
        console.log('Authentication successful');
        this.notifySubscribers('auth', { status: 'success' });
        break;
        
      case 'auth_failed':
        console.log('Authentication failed');
        this.notifySubscribers('auth', { status: 'failed' });
        break;
        
      case 'booking_update':
        this.notifySubscribers('booking_update', data.data);
        break;
        
      case 'room_availability_update':
        this.notifySubscribers('room_availability_update', data.data);
        break;
        
      case 'booking_status_change':
        this.notifySubscribers('booking_status_change', data.data);
        break;
        
      case 'pong':
        // Handle ping response
        break;
        
      default:
        console.log('Unknown message type:', type);
    }
  }

  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get(eventType);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  notifySubscribers(eventType, data) {
    const callbacks = this.subscribers.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in WebSocket subscriber callback:', error);
        }
      });
    }
  }

  // Ping to keep connection alive
  ping() {
    this.send({
      type: 'ping',
      timestamp: Date.now()
    });
  }

  // Start periodic ping
  startPing(interval = 30000) {
    this.stopPing();
    this.pingInterval = setInterval(() => {
      if (this.isConnected) {
        this.ping();
      }
    }, interval);
  }

  stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }
}

// Create and export singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;