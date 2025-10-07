import { create } from 'zustand';
import { authAPI, userAPI, bettingAPI, webSocketService, handleAPIError } from '../services/api';

// Helpers to safely access localStorage (SSR/initial load guard)
const safeGet = (key, fallback) => {
  try {
    if (typeof window === 'undefined') return fallback;
    const v = window.localStorage.getItem(key);
    return v !== null ? v : fallback;
  } catch { return fallback; }
};
const persist = (key, value) => {
  try { if (typeof window !== 'undefined') window.localStorage.setItem(key, value); } catch(_) {}
};

// Helper function to calculate time remaining from pool data
const calculateTimeRemaining = (poolData) => {
  if (!poolData.lockTime) return 0;
  
  const now = new Date();
  const lockTime = new Date(poolData.lockTime);
  const timeDiff = Math.max(0, Math.floor((lockTime - now) / 1000));
  
  return timeDiff;
};

const useStore = create((set, get) => ({
  // User state
  user: null,
  isAuthenticated: false,
  
  // Wallet state
  balance: 100, // Mock $100 USDT balance
  transactions: [],
  
  // Betting state
  currentBets: [],
  activeCycle: {
    id: 1,
    market: 'BTC/USDT',
    status: 'OPEN', // OPEN, LOCKED, SETTLED
    timeRemaining: 600, // 10 minutes in seconds (5 min open + 5 min locked)
    totalCycleTime: 600, // 10 minutes total
    openTime: 300, // First 5 minutes for betting
    lockedTime: 300, // Last 5 minutes for settlement
    upPool: 1250.75, // Mock pool values
    downPool: 845.25, // Mock pool values
    upBets: [], // Array of individual bets
    downBets: [], // Array of individual bets
    currentPrice: 110699.58,
    startPrice: 110699.58, // Price when cycle started
    endPrice: null,
    result: null, // 'UP' or 'DOWN'
    cyclePhase: 'OPEN' // OPEN, LOCKED, SETTLING
  },
  selectedCurrencyPair: 'BTC/USDT',
  
  // Mock pool animation state
  poolUpdateInterval: null,
  
  // UI state
  currentPage: 'home',
  showModal: false,
  modalType: null,
  modalData: null,
  theme: 'light', // 'light' or 'dark'
  chartInterval: safeGet('chartInterval','1m'), // 1m,5m,15m,1h default
  chartSymbol: safeGet('chartSymbol','BTCUSDT'), // Trading symbol for charts (no slash, matches exchange API format)
  pollingInterval: null, // For fallback polling when WebSocket fails
  isDemoMode: false, // Shows when running in demo mode due to CORS issues
  
  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  // Authentication actions
  login: async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      
      // Get user profile after successful login
      const userProfile = await authAPI.getProfile();
      
      // Store user data
      const userData = {
        id: userProfile.id,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        balance: 100, // Default balance, will be updated from backend
        level: 'Beginner',
        signUpDate: new Date().toISOString(),
        totalBets: 0,
        winRate: 0,
        totalWinnings: 0
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      set({ user: userData, isAuthenticated: true });
      
      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await userAPI.register(userData);
      
      // Store user data
      const user = {
        id: response.id,
        firstName: response.firstName,
        lastName: response.lastName,
        email: response.email,
        balance: 100, // Default balance from backend
        level: 'Beginner',
        signUpDate: new Date().toISOString(),
        totalBets: 0,
        winRate: 0,
        totalWinnings: 0
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, isAuthenticated: true });
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: () => {
    authAPI.logout();
    set({ user: null, isAuthenticated: false });
  },

  // Initialize user from localStorage on app start
  initializeAuth: () => {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('accessToken');
      
      if (storedUser && token) {
        const user = JSON.parse(storedUser);
        
        // Ensure user has required properties with defaults
        const userWithDefaults = {
          ...user,
          balance: user.balance || 100, // Default balance if missing
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          level: user.level || 'Beginner',
          signUpDate: user.signUpDate || new Date().toISOString(),
          totalBets: user.totalBets || 0,
          winRate: user.winRate || 0,
          totalWinnings: user.totalWinnings || 0
        };
        
        set({ user: userWithDefaults, isAuthenticated: true });
        
        // Verify token is still valid by getting profile
        authAPI.getProfile().catch(() => {
          // Token invalid, logout
          authAPI.logout();
          set({ user: null, isAuthenticated: false });
        });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      authAPI.logout();
      set({ user: null, isAuthenticated: false });
    }
  },
  
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),

  setChartInterval: (interval) => {
    persist('chartInterval', interval);
    set({ chartInterval: interval });
  },
  setChartSymbol: (symbol) => {
    persist('chartSymbol', symbol);
    set({ chartSymbol: symbol });
  },

  updateBalance: (amount) => set((state) => ({
    balance: Math.max(0, state.balance + amount)
  })),
  
  addTransaction: (transaction) => set((state) => ({
    transactions: [transaction, ...state.transactions]
  })),

  // Deposit functionality
  deposit: (amount) => set((state) => {
    const transaction = {
      id: Date.now(),
      type: 'DEPOSIT',
      amount: amount,
      description: `Deposited ${amount} USDT`,
      timestamp: new Date().toISOString(),
      status: 'Completed'
    };

    return {
      balance: state.balance + amount,
      transactions: [transaction, ...state.transactions]
    };
  }),

  // Withdraw functionality
  withdraw: (amount) => set((state) => {
    if (state.balance < amount) {
      throw new Error('Insufficient funds');
    }

    const transaction = {
      id: Date.now(),
      type: 'WITHDRAW',
      amount: -amount,
      description: `Withdrew ${amount} USDT`,
      timestamp: new Date().toISOString(),
      status: 'Completed'
    };

    return {
      balance: state.balance - amount,
      transactions: [transaction, ...state.transactions]
    };
  }),

  // Get active bets (pending bets for current cycle)
  getActiveBets: () => {
    const state = get();
    return state.currentBets.filter(bet => bet.status === 'PENDING');
  },
  
  placeBet: async (bet) => {
    try {
      // Get current pool from backend
      const currentPool = await bettingAPI.getCurrentPool();
      
      // Place bet with backend
      const response = await bettingAPI.placeBet(currentPool.id, bet.amount, bet.direction);
      
      // Get current state
      const currentState = get();
      
      // Update local state with backend response
      const newBet = {
        id: response.id || Date.now(),
        ...bet,
        timestamp: new Date().toISOString(),
        status: 'PENDING',
        userPercentage: 0 // Will be calculated
      };
      
      const newBalance = currentState.balance - bet.amount;
      const newTransaction = {
        id: Date.now(),
        type: 'BET',
        amount: -bet.amount,
        description: `Bet ${bet.amount} USDT on ${bet.direction}`,
        timestamp: new Date().toISOString()
      };
      
      // Update pools with backend data
      const updatedUpBets = bet.direction === 'UP' ? [...currentState.activeCycle.upBets, newBet] : currentState.activeCycle.upBets;
      const updatedDownBets = bet.direction === 'DOWN' ? [...currentState.activeCycle.downBets, newBet] : currentState.activeCycle.downBets;
      
      // Use backend pool totals
      const newUpPool = currentPool.totalUpPool || 0;
      const newDownPool = currentPool.totalDownPool || 0;
      
      // Calculate user's percentage in the pool they bet on
      const userPool = bet.direction === 'UP' ? newUpPool : newDownPool;
      const userPercentage = userPool > 0 ? (bet.amount / userPool) * 100 : 0;
      
      set((state) => ({
        currentBets: [...state.currentBets, newBet],
        balance: newBalance,
        transactions: [newTransaction, ...state.transactions],
        activeCycle: {
          ...state.activeCycle,
          upPool: newUpPool,
          downPool: newDownPool,
          upBets: updatedUpBets,
          downBets: updatedDownBets
        }
      }));
      
      return { success: true, bet: newBet };
    } catch (error) {
      console.error('Place bet error:', error);
      throw error;
    }
  },
  
  settleBets: (result) => set((state) => {
    const winningPool = result === 'UP' ? state.activeCycle.upPool : state.activeCycle.downPool;
    const losingPool = result === 'UP' ? state.activeCycle.downPool : state.activeCycle.upPool;
    const totalPool = winningPool + losingPool;
    
    // Apply 5% house commission as per PRD
    const houseCommission = totalPool * 0.05;
    const winningsPool = totalPool - houseCommission;
    
    const settledBets = state.currentBets.map(bet => {
      if (bet.direction === result) {
        // Calculate user's percentage of the winning pool
        const userPool = result === 'UP' ? state.activeCycle.upPool : state.activeCycle.downPool;
        const userPercentage = userPool > 0 ? (bet.amount / userPool) : 0;
        const winnings = winningsPool * userPercentage;
        
        return {
          ...bet,
          status: 'WON',
          winnings: winnings,
          userPercentage: userPercentage
        };
      } else {
        return {
          ...bet,
          status: 'LOST',
          winnings: 0,
          userPercentage: 0
        };
      }
    });
    
    const totalWinnings = settledBets
      .filter(bet => bet.status === 'WON')
      .reduce((sum, bet) => sum + bet.winnings, 0);
    
    const newTransactions = settledBets
      .filter(bet => bet.status === 'WON')
      .map(bet => ({
        id: Date.now() + Math.random(),
        type: 'WIN',
        amount: bet.winnings,
        description: `Won ${bet.winnings.toFixed(2)} USDT (${bet.userPercentage.toFixed(2)}% of pool)`,
        timestamp: new Date().toISOString()
      }));
    
    return {
      currentBets: [],
      balance: state.balance + totalWinnings,
      transactions: [...newTransactions, ...state.transactions],
      activeCycle: {
        ...state.activeCycle,
        status: 'SETTLED',
        result: result,
        upBets: [],
        downBets: [],
        upPool: 0,
        downPool: 0
      }
    };
  }),

  // Calculate payout multipliers
  getPayoutMultipliers: () => {
    const state = get();
    const { upPool, downPool } = state.activeCycle;
    const totalPool = upPool + downPool;
    
    if (totalPool === 0) {
      return { upMultiplier: 1.0, downMultiplier: 1.0 };
    }
    
    // Apply 5% house commission
    const winningsPool = totalPool * 0.95;
    
    // Calculate multipliers (how much you get back for each $1 bet)
    const upMultiplier = upPool > 0 ? winningsPool / upPool : 1.0;
    const downMultiplier = downPool > 0 ? winningsPool / downPool : 1.0;
    
    return {
      upMultiplier: Math.max(upMultiplier, 0.1), // Minimum 0.1x multiplier
      downMultiplier: Math.max(downMultiplier, 0.1)
    };
  },
  
  updateActiveCycle: (updates) => set((state) => ({
    activeCycle: { ...state.activeCycle, ...updates }
  })),

  // Load current pool from backend
  loadCurrentPool: async () => {
    try {
      const poolData = await bettingAPI.getCurrentPool();
      
      // Convert backend pool data to frontend format
      const activeCycle = {
        id: poolData.id,
        market: poolData.assetPair || 'BTC/USDT',
        status: poolData.status,
        timeRemaining: calculateTimeRemaining(poolData),
        totalCycleTime: 600, // 10 minutes total
        openTime: 300, // First 5 minutes for betting
        lockedTime: 300, // Last 5 minutes for settlement
        upPool: poolData.totalUpPool || 0,
        downPool: poolData.totalDownPool || 0,
        upBets: [], // Individual bets not provided by backend
        downBets: [], // Individual bets not provided by backend
        currentPrice: poolData.startPrice || 110699.58,
        startPrice: poolData.startPrice || 110699.58,
        endPrice: poolData.endPrice,
        result: null, // Will be set when pool closes
        cyclePhase: poolData.status === 'OPEN' ? 'OPEN' : 'LOCKED'
      };
      
      set({ activeCycle });
      return activeCycle;
    } catch (error) {
      console.error('Load current pool error:', error);
      throw error;
    }
  },

  // Initialize WebSocket connection for real-time updates
  initializeWebSocket: async () => {
    try {
      console.log('Attempting to initialize WebSocket connection...');
      await webSocketService.connect();
      
      // Subscribe to pool updates
      const currentPool = await bettingAPI.getCurrentPool();
      webSocketService.subscribeToPool(currentPool.id, (update) => {
        set((state) => ({
          activeCycle: {
            ...state.activeCycle,
            upPool: update.totalUpPool,
            downPool: update.totalDownPool
          }
        }));
      });
      
      console.log('WebSocket connection established successfully');
    } catch (error) {
      console.error('WebSocket initialization error:', error);
      console.log('Falling back to polling for real-time updates...');
      
      // Fallback to polling when WebSocket fails
      get().startPollingForUpdates();
    }
  },

  // Fallback polling mechanism when WebSocket fails
  startPollingForUpdates: () => {
    console.log('Starting polling fallback for real-time updates...');
    
    // Poll every 5 seconds for pool updates
    const pollInterval = setInterval(async () => {
      try {
        const poolData = await bettingAPI.getCurrentPool();
        set((state) => ({
          activeCycle: {
            ...state.activeCycle,
            upPool: poolData.totalUpPool || 0,
            downPool: poolData.totalDownPool || 0,
            currentPrice: poolData.currentPrice || state.activeCycle.currentPrice
          }
        }));
      } catch (error) {
        console.error('Polling error:', error);
        // If polling also fails, simulate some data changes for demo purposes
        if (process.env.NODE_ENV === 'development') {
          console.log('Simulating pool updates for demo...');
          set((state) => ({
            activeCycle: {
              ...state.activeCycle,
              upPool: state.activeCycle.upPool + Math.random() * 10,
              downPool: state.activeCycle.downPool + Math.random() * 10,
              currentPrice: state.activeCycle.currentPrice + (Math.random() - 0.5) * 100
            }
          }));
        }
      }
    }, 5000);
    
    // Store the interval ID so we can clear it later
    set({ pollingInterval: pollInterval });
  },

  // Stop polling when WebSocket becomes available
  stopPolling: () => {
    const state = get();
    if (state.pollingInterval) {
      clearInterval(state.pollingInterval);
      set({ pollingInterval: null });
      console.log('Stopped polling fallback');
    }
  },

  // Cleanup function to stop all connections
  cleanup: () => {
    // Stop WebSocket connection
    if (webSocketService.isWebSocketAvailable()) {
      webSocketService.disconnect();
    }
    
    // Stop polling
    get().stopPolling();
    
    console.log('Cleaned up all connections');
  },
  
  setCurrentPage: (page) => set({ currentPage: page }),
  
  setCurrencyPair: (pair) => set({ selectedCurrencyPair: pair }),
  
  showModal: (type, data = null) => set({ 
    showModal: true, 
    modalType: type, 
    modalData: data 
  }),
  
  hideModal: () => set({ 
    showModal: false, 
    modalType: null, 
    modalData: null 
  }),
  
  // Timer functions
  startTimer: () => {
    const interval = setInterval(() => {
      const state = get();
      if (state.activeCycle.timeRemaining > 0) {
        const newTimeRemaining = state.activeCycle.timeRemaining - 1;
        
        // Determine phase based on time remaining
        let newCyclePhase = 'OPEN';
        let newStatus = 'OPEN';
        
        if (newTimeRemaining > 300) {
          // First 5 minutes - Open for betting
          newCyclePhase = 'OPEN';
          newStatus = 'OPEN';
        } else if (newTimeRemaining > 0) {
          // Last 5 minutes - Locked for settlement
          newCyclePhase = 'LOCKED';
          newStatus = 'LOCKED';
        } else {
          // Time's up - Settlement
          newCyclePhase = 'SETTLING';
          newStatus = 'SETTLED';
        }
        
        set({
          activeCycle: {
            ...state.activeCycle,
            timeRemaining: Math.max(0, newTimeRemaining),
            status: newStatus,
            cyclePhase: newCyclePhase
          }
        });
        
        // Auto-settle when cycle completes
        if (newTimeRemaining <= 0 && state.activeCycle.status !== 'SETTLED') {
          const result = Math.random() > 0.5 ? 'UP' : 'DOWN';
          
          // Set end price for settlement
          set({
            activeCycle: {
              ...state.activeCycle,
              endPrice: state.activeCycle.currentPrice,
              result: result
            }
          });
          
          get().settleBets(result);
          get().showModal('RESULT', { result, winnings: 0 });
          
          // Reset cycle after a brief delay
          setTimeout(() => {
            set({
              activeCycle: {
                id: state.activeCycle.id + 1,
                market: 'BTC/USDT',
                status: 'OPEN',
                timeRemaining: 600, // Reset to 10 minutes
                totalCycleTime: 600,
                openTime: 300,
                lockedTime: 300,
                upPool: Math.random() * 2000 + 500, // Random starting pools
                downPool: Math.random() * 2000 + 500,
                upBets: [],
                downBets: [],
                currentPrice: state.activeCycle.currentPrice,
                startPrice: state.activeCycle.currentPrice, // New start price
                endPrice: null,
                result: null,
                cyclePhase: 'OPEN'
              }
            });
          }, 3000); // 3 second delay before new cycle
        }
      }
    }, 1000);
    
    return interval;
  },

  // Start dynamic pool updates
  startPoolUpdates: () => {
    const poolInterval = setInterval(() => {
      const state = get();
      if (state.activeCycle.status === 'OPEN') {
        // Simulate pool updates every 3-5 seconds
        const upIncrease = Math.random() * 50 + 10; // 10-60 USDT
        const downIncrease = Math.random() * 50 + 10;
        
        set({
          activeCycle: {
            ...state.activeCycle,
            upPool: state.activeCycle.upPool + upIncrease,
            downPool: state.activeCycle.downPool + downIncrease
          }
        });
      }
    }, Math.random() * 2000 + 3000); // Random 3-5 second intervals
    
    set({ poolUpdateInterval: poolInterval });
    return poolInterval;
  },

  // Calculate payout multipliers
  getPayoutMultipliers: () => {
    const state = get();
    const totalPool = state.activeCycle.upPool + state.activeCycle.downPool;
    const houseCommission = 0.05; // 5% house edge
    const availableWinnings = totalPool * (1 - houseCommission);
    
    return {
      up: state.activeCycle.upPool > 0 ? (availableWinnings / state.activeCycle.upPool) : 1,
      down: state.activeCycle.downPool > 0 ? (availableWinnings / state.activeCycle.downPool) : 1
    };
  }
}));

export default useStore;