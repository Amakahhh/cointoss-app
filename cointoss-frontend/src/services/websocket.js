import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start with 1 second
    this.maxReconnectDelay = 30000; // Max 30 seconds
    this.callbacks = {
      onConnect: null,
      onDisconnect: null,
      onError: null,
      onBettingUpdate: null
    };
  }

  // Initialize WebSocket connection
  connect() {
    if (this.connected && this.client) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Create SockJS socket - use relative path so webpack dev-server proxy routes to backend in development
        // In development, connect directly to the backend WebSocket endpoint to avoid
        // issues with the webpack-dev-server websocket proxy (some environments show
        // ERR_STREAM_WRITE_AFTER_END / ECONNREFUSED when proxying /ws upgrades).
        const isLocalhost = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'));
        const wsPath = isLocalhost ? 'http://localhost:8081/ws' : '/ws';
        const socket = new SockJS(wsPath);

        // Create STOMP client
        this.client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: {
            Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}`
          },
          debug: (str) => {
            console.log('STOMP Debug:', str);
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        // Connection successful
        this.client.onConnect = (frame) => {
          console.log('WebSocket connected successfully:', frame);
          this.connected = true;
          this.reconnectAttempts = 0;
          this.reconnectDelay = 1000; // Reset delay
          
          // Subscribe to betting updates
          this.subscribeToBettingUpdates();
          
          if (this.callbacks.onConnect) {
            this.callbacks.onConnect(frame);
          }
          
          resolve(frame);
        };

        // Connection failed
        this.client.onDisconnect = (frame) => {
          console.log('WebSocket disconnected:', frame);
          this.connected = false;
          this.subscriptions.clear();
          
          if (this.callbacks.onDisconnect) {
            this.callbacks.onDisconnect(frame);
          }
        };

        // Connection error
        this.client.onStompError = (frame) => {
          console.error('STOMP error:', frame);
          this.connected = false;
          
          if (this.callbacks.onError) {
            this.callbacks.onError(frame);
          }
          
          // Attempt to reconnect with exponential backoff
          this.attemptReconnect();
          
          reject(new Error(`STOMP error: ${frame.body}`));
        };

        // WebSocket error
        this.client.onWebSocketError = (error) => {
          console.error('WebSocket error:', error);
          this.connected = false;
          
          if (this.callbacks.onError) {
            this.callbacks.onError(error);
          }
          
          this.attemptReconnect();
        };

        // Activate the client
        this.client.activate();
        
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        reject(error);
      }
    });
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.client) {
      console.log('Disconnecting WebSocket...');
      this.client.deactivate();
      this.client = null;
      this.connected = false;
      this.subscriptions.clear();
    }
  }

  // Subscribe to betting updates
  subscribeToBettingUpdates() {
    if (!this.connected || !this.client) {
      console.warn('Cannot subscribe: WebSocket not connected');
      return;
    }

    try {
      const subscription = this.client.subscribe('/topic/betting-updates', (message) => {
        try {
          const data = JSON.parse(message.body);
          console.log('Received betting update:', data);
          
          if (this.callbacks.onBettingUpdate) {
            this.callbacks.onBettingUpdate(data);
          }
        } catch (error) {
          console.error('Failed to parse betting update:', error);
        }
      });

      this.subscriptions.set('betting-updates', subscription);
      console.log('Subscribed to betting updates');
    } catch (error) {
      console.error('Failed to subscribe to betting updates:', error);
    }
  }

  // Subscribe to custom topic
  subscribe(topic, callback) {
    if (!this.connected || !this.client) {
      console.warn(`Cannot subscribe to ${topic}: WebSocket not connected`);
      return null;
    }

    try {
      const subscription = this.client.subscribe(topic, callback);
      this.subscriptions.set(topic, subscription);
      console.log(`Subscribed to ${topic}`);
      return subscription;
    } catch (error) {
      console.error(`Failed to subscribe to ${topic}:`, error);
      return null;
    }
  }

  // Unsubscribe from topic
  unsubscribe(topic) {
    const subscription = this.subscriptions.get(topic);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
      console.log(`Unsubscribed from ${topic}`);
    }
  }

  // Send message to server
  sendMessage(destination, body = {}, headers = {}) {
    if (!this.connected || !this.client) {
      console.warn('Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      this.client.publish({
        destination,
        body: JSON.stringify(body),
        headers: {
          'content-type': 'application/json',
          ...headers
        }
      });
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  // Attempt to reconnect with exponential backoff
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxReconnectDelay);
    
    console.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch((error) => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  // Set callback functions
  setCallbacks({
    onConnect = null,
    onDisconnect = null,
    onError = null,
    onBettingUpdate = null
  }) {
    this.callbacks = {
      onConnect,
      onDisconnect,
      onError,
      onBettingUpdate
    };
  }

  // Get connection status
  isConnected() {
    return this.connected && this.client && this.client.connected;
  }

  // Update authentication token
  updateAuthToken(token) {
    if (this.client) {
      this.client.connectHeaders.Authorization = `Bearer ${token}`;
      
      // If connected, reconnect with new token
      if (this.connected) {
        this.disconnect();
        this.connect();
      }
    }
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;