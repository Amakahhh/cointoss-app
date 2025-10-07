// API Service Layer for Cointoss Backend Integration
// This file handles all communication with the backend API
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// Use proxy in development, direct URL in production (guarded for browser runtime)
const getNodeEnv = () => {
  try {
    return (typeof process !== 'undefined' && process.env && process.env.NODE_ENV) ? process.env.NODE_ENV : 'production';
  } catch (_) {
    return 'production';
  }
};

const NODE_ENV_SAFE = getNodeEnv();

// Prefer relative URLs when running on localhost so the webpack dev-server proxy handles requests.
const API_BASE_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
  ? '' // Use relative URLs in development (webpack proxy will handle it)
  : (NODE_ENV_SAFE === 'development' ? '' : 'https://cointoss-app-latest.onrender.com');

// Check if we're in production and should use mock data due to CORS issues
const shouldUseMockDataInProduction = () => {
  // Only use demo mode if explicitly enabled via environment variable or localStorage flag
  let envDemo = false;
  try {
    envDemo = typeof process !== 'undefined' && process.env && process.env.REACT_APP_DEMO_MODE === 'true';
  } catch (_) {
    envDemo = false;
  }
  return envDemo || localStorage.getItem('forceDemoMode') === 'true';
};

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('accessToken');
};

// Helper function to get user ID from localStorage
const getUserId = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).id : null;
};

// Mock data for development fallback
const mockData = {
  currentPool: {
    id: 1,
    assetPair: 'BTC/USDT',
    status: 'OPEN',
    totalUpPool: 1250.50,
    totalDownPool: 890.25,
    startPrice: 110699.58,
    currentPrice: 110750.32,
    lockTime: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
    endPrice: null
  },
  user: {
    id: 1,
    firstName: '',
    lastName: '',
    email: '',
    balance: 100
  }
};

// Check if we should use mock data (development or production CORS issues)
const shouldUseMockData = () => {
  return (NODE_ENV_SAFE === 'development' &&
         (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) ||
         shouldUseMockDataInProduction();
};

// Generic API request function with fallback to mock data
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add authorization header if token exists
  if (token) {
    defaultHeaders.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    mode: 'cors'
  };

  try {
    const response = await fetch(url, config);

    // Handle different response types
    if (response.status === 204) {
      return { success: true }; // No content response
    }

    const contentType = response.headers.get('content-type') || '';
    let data;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (_) {
        if (!response.ok) {
          throw new Error(text || `HTTP error! status: ${response.status}`);
        }
        // If OK but not JSON, return raw text
        return text;
      }
    }

    if (!response.ok) {
      throw new Error((data && (data.error || data.message)) || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    
    // Check if this is a CORS error specifically
    const isCorsError = error.message.includes('CORS') || 
                        error.message.includes('fetch') || 
                        error.message.includes('blocked');
    
    // Fall back to mock data for development or explicit demo mode
    if (shouldUseMockData()) {
      console.warn('Using mock data due to API failure or CORS issues');
      
      // Set demo mode flag only for actual CORS issues
      if (isCorsError && NODE_ENV_SAFE === 'production') {
        localStorage.setItem('isDemoMode', 'true');
        console.warn('CORS error detected - switching to demo mode');
      }
      
      return getMockDataForEndpoint(endpoint, options);
    }
    
    throw error;
  }
};

// Test backend connection
export const testBackendConnection = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/bets/current-pool`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      // Backend is working, clear demo mode
      localStorage.removeItem('isDemoMode');
      localStorage.removeItem('forceDemoMode');
      console.log('Backend connection successful - demo mode cleared');
      return true;
    }
  } catch (error) {
    console.log('Backend connection failed:', error.message);
  }
  return false;
};

// Get your Vercel URL for backend CORS configuration
export const getVercelUrl = () => {
  return 'https://coin-toss-tw57.vercel.app';
};

// Get mock data based on endpoint
const getMockDataForEndpoint = (endpoint, options) => {
  if (endpoint === '/api/bets/current-pool') {
    return mockData.currentPool;
  }
  
  if (endpoint === '/users' && options.method === 'POST') {
    // Mock user registration
    const userData = JSON.parse(options.body);
    return {
      id: Date.now(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      balance: 100
    };
  }
  
  if (endpoint === '/api/auth/login' && options.method === 'POST') {
    // Mock login
    return {
      token: 'mock-jwt-token-' + Date.now(),
      user: mockData.user
    };
  }
  
  if (endpoint === '/api/auth/me') {
    return mockData.user;
  }
  
  // Default mock response
  return { success: true, message: 'Mock response' };
};

// Authentication API
export const authAPI = {
  // Login user
  login: async (email, password) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Store the access token
    if (response.token) {
      localStorage.setItem('accessToken', response.token);
    }
    
    return response;
  },

  // Refresh access token
  refresh: async () => {
    const response = await apiRequest('/api/auth/refresh', {
      method: 'POST',
    });
    
    // Update the stored access token
    if (response.token) {
      localStorage.setItem('accessToken', response.token);
    }
    
    return response;
  },

  // Get current user profile
  getProfile: async () => {
    return await apiRequest('/api/auth/me');
  },

  // Logout (clear local storage)
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  }
};

// User Management API
export const userAPI = {
  // Register new user
  register: async (userData) => {
    const response = await apiRequest('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Store user data if registration successful
    if (response.id) {
      localStorage.setItem('user', JSON.stringify(response));
    }
    
    return response;
  },

  // Change password
  changePassword: async (userId, oldPassword, newPassword) => {
    return await apiRequest(`/users/${userId}/change-password`, {
      method: 'POST',
      body: JSON.stringify({
        oldPassword,
        newPassword
      }),
    });
  },

  // Update username (first and last name)
  updateUsername: async (userId, firstName, lastName) => {
    return await apiRequest(`/users/${userId}/changeUsername`, {
      method: 'PUT',
      body: JSON.stringify({
        firstName,
        lastName
      }),
    });
  },

  // Update email
  updateEmail: async (userId, email) => {
    return await apiRequest(`/users/${userId}/changeEmail`, {
      method: 'PUT',
      body: JSON.stringify({ email }),
    });
  }
};

// Betting API
export const bettingAPI = {
  // Get current betting pool
  getCurrentPool: async () => {
    return await apiRequest('/api/bets/current-pool');
  },

  // Place a bet
  placeBet: async (poolId, amount, direction) => {
    return await apiRequest('/api/bets', {
      method: 'POST',
      body: JSON.stringify({
        poolId,
        amount,
        direction
      }),
    });
  }
};

// Admin API (for future use)
export const adminAPI = {
  // Get all users
  getAllUsers: async () => {
    return await apiRequest('/admin');
  },

  // Get specific user
  getUser: async (userId) => {
    return await apiRequest(`/admin/${userId}`);
  }
};

// WebSocket Service for real-time updates
export class WebSocketService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.subscriptions = new Map();
    this.connectionAttempts = 0;
    this.maxConnectionAttempts = 3;
  }

  // Initialize WebSocket connection with CORS handling
  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Create SockJS connection with CORS configuration
        // Force direct backend websocket connection in development to avoid
        // the webpack-dev-server proxy websocket errors seen on some systems
        // (ERR_STREAM_WRITE_AFTER_END / ECONNREFUSED). Use absolute backend
        // address when running locally.
        const wsUrl = process.env.NODE_ENV === 'development'
          ? 'http://localhost:8081/ws'
          : `${API_BASE_URL}/ws`;

        const sockJS = new SockJS(wsUrl, null, {
          // Add CORS headers for the connection
          transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
          // Add authentication token if available
          sessionId: () => {
            const token = getAuthToken();
            return token ? `Bearer ${token}` : '';
          }
        });

        this.client = new Client({
          webSocketFactory: () => sockJS,
          debug: (str) => {
            console.log('STOMP Debug:', str);
          },
          reconnectDelay: 5000,
          // Add connection timeout
          connectionTimeout: 10000,
          // Add heartbeat configuration
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
          console.log('WebSocket Connected:', frame);
          this.isConnected = true;
          this.connectionAttempts = 0;
          resolve(frame);
        };

        this.client.onStompError = (frame) => {
          console.error('STOMP Error:', frame);
          this.isConnected = false;
          this.connectionAttempts++;
          
          // If we've exceeded max attempts, reject
          if (this.connectionAttempts >= this.maxConnectionAttempts) {
            console.error('Max WebSocket connection attempts reached');
            reject(new Error('WebSocket connection failed after multiple attempts'));
          } else {
            // Try to reconnect after a delay
            setTimeout(() => {
              console.log(`Attempting WebSocket reconnection (${this.connectionAttempts}/${this.maxConnectionAttempts})`);
              this.connect().catch(reject);
            }, 5000);
          }
        };

        this.client.onWebSocketClose = (event) => {
          console.log('WebSocket Closed:', event);
          this.isConnected = false;
        };

        this.client.onWebSocketError = (error) => {
          console.error('WebSocket Error:', error);
          this.isConnected = false;
          this.connectionAttempts++;
          
          // Handle CORS errors specifically
          if (error.message && error.message.includes('CORS')) {
            console.warn('CORS error detected. WebSocket connection may not work in development.');
            // Don't reject immediately for CORS errors, let it try other transports
          }
        };

        this.client.activate();
      } catch (error) {
        console.error('WebSocket Connection Error:', error);
        reject(error);
      }
    });
  }

  // Subscribe to pool updates
  subscribeToPool(poolId, callback) {
    if (!this.isConnected || !this.client) {
      console.error('WebSocket not connected');
      return;
    }

    const topic = `/topic/pool/${poolId}`;
    const subscription = this.client.subscribe(topic, (message) => {
      try {
        const update = JSON.parse(message.body);
        callback(update);
      } catch (error) {
        console.error('Error parsing pool update:', error);
      }
    });

    this.subscriptions.set(topic, subscription);
    console.log(`Subscribed to pool ${poolId}`);
  }

  // Check if WebSocket is available and working
  isWebSocketAvailable() {
    return this.isConnected && this.client;
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      connectionAttempts: this.connectionAttempts,
      maxAttempts: this.maxConnectionAttempts
    };
  }

  // Unsubscribe from pool updates
  unsubscribeFromPool(poolId) {
    const topic = `/topic/pool/${poolId}`;
    const subscription = this.subscriptions.get(topic);
    
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(topic);
      console.log(`Unsubscribed from pool ${poolId}`);
    }
  }

  // Disconnect WebSocket
  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
      this.subscriptions.clear();
      console.log('WebSocket disconnected');
    }
  }
}

// Create a singleton instance of WebSocket service
export const webSocketService = new WebSocketService();

// Error handling utility
export const handleAPIError = (error) => {
  console.error('API Error:', error);
  
  // Handle specific error cases
  if (error.message.includes('401')) {
    // Token expired, try to refresh
    return authAPI.refresh().catch(() => {
      // Refresh failed, redirect to login
      authAPI.logout();
      window.location.href = '/login';
    });
  }
  
  // For other errors, just throw them
  throw error;
};

export default {
  authAPI,
  userAPI,
  bettingAPI,
  adminAPI,
  webSocketService,
  handleAPIError
};

