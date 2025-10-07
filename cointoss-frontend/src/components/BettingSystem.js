import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Clock, Users } from 'lucide-react';
import useStore from '../store/useStore';

const BettingSystem = () => {
  const { 
    balance, 
    updateBalance, 
    addTransaction, 
    user 
  } = useStore();

  const [currentPool, setCurrentPool] = useState({
    id: Date.now(),
    upPool: 1250,
    downPool: 850,
    upBets: [],
    downBets: [],
    status: 'OPEN', // OPEN, LOCKED, SETTLED
    timeRemaining: 300, // 5 minutes in seconds
    lockTimeRemaining: 0,
    startPrice: 65000,
    currentPrice: 65000,
    endPrice: null
  });

  const [userActiveBets, setUserActiveBets] = useState([]);
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState(null);
  const [betAmount, setBetAmount] = useState('');
  const [showResultModal, setShowResultModal] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  // Fake users for realistic pool display
  const fakeUsers = [
    'CryptoTrader_88', 'BitcoinBull', 'EthereumMax', 'SatoshiNakamoto', 'DogeCoinFan',
    'AltcoinHunter', 'BlockchainKing', 'CoinMaster', 'TradingPro', 'HODLer4Life',
    'MoonLambo', 'DiamondHands', 'PaperHands', 'WhaleWatcher', 'MemeCoinLord'
  ];

  // Generate fake bets
  useEffect(() => {
    const generateFakeBets = () => {
      const upBets = [];
      const downBets = [];
      const numUsers = 15 + Math.floor(Math.random() * 10);

      for (let i = 0; i < numUsers; i++) {
        const user = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
        const amount = 10 + Math.floor(Math.random() * 500);
        const direction = Math.random() > 0.6 ? 'UP' : 'DOWN'; // Slightly favor UP

        const bet = {
          id: `fake_${i}`,
          user,
          amount,
          timestamp: Date.now() - Math.random() * 300000
        };

        if (direction === 'UP') {
          upBets.push(bet);
        } else {
          downBets.push(bet);
        }
      }

      const totalUp = upBets.reduce((sum, bet) => sum + bet.amount, 0);
      const totalDown = downBets.reduce((sum, bet) => sum + bet.amount, 0);

      setCurrentPool(prev => ({
        ...prev,
        upBets,
        downBets,
        upPool: totalUp,
        downPool: totalDown
      }));
    };

    generateFakeBets();
  }, []);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPool(prev => {
        if (prev.status === 'OPEN' && prev.timeRemaining > 0) {
          const newTime = prev.timeRemaining - 1;
          if (newTime === 0) {
            return {
              ...prev,
              timeRemaining: 0,
              status: 'LOCKED',
              lockTimeRemaining: 300 // 5 minutes lock period
            };
          }
          return { ...prev, timeRemaining: newTime };
        } else if (prev.status === 'LOCKED' && prev.lockTimeRemaining > 0) {
          const newLockTime = prev.lockTimeRemaining - 1;
          if (newLockTime === 0) {
            // Simulate price movement and settle bets
            const priceChange = (Math.random() - 0.5) * 2000; // ±$1000 movement
            const endPrice = prev.startPrice + priceChange;
            const result = endPrice > prev.startPrice ? 'UP' : 'DOWN';
            
            // Settle user bets
            settleBets(result, endPrice);
            
            return {
              ...prev,
              lockTimeRemaining: 0,
              status: 'SETTLED',
              endPrice,
              currentPrice: endPrice
            };
          }
          // Simulate price movement during lock period
          const priceChange = (Math.random() - 0.5) * 100;
          return { 
            ...prev, 
            lockTimeRemaining: newLockTime,
            currentPrice: prev.startPrice + priceChange * (300 - newLockTime) / 300
          };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const settleBets = (result, endPrice) => {
    const winningPool = result === 'UP' ? currentPool.upPool : currentPool.downPool;
    const losingPool = result === 'UP' ? currentPool.downPool : currentPool.upPool;
    const totalPool = winningPool + losingPool;
    
    userActiveBets.forEach(bet => {
      if (bet.direction === result) {
        // Calculate winnings based on pool share
        const userShare = bet.amount / winningPool;
        const winnings = totalPool * userShare;
        
        updateBalance(winnings);
        addTransaction({
          type: 'WIN',
          amount: winnings,
          timestamp: new Date().toISOString(),
          status: 'Completed',
          description: `Won ${winnings.toFixed(2)} USDT`
        });

        setLastResult({
          type: 'win',
          amount: winnings,
          direction: result,
          betAmount: bet.amount
        });
      } else {
        addTransaction({
          type: 'LOSS',
          amount: -bet.amount,
          timestamp: new Date().toISOString(),
          status: 'Completed',
          description: `Lost ${bet.amount.toFixed(2)} USDT`
        });

        setLastResult({
          type: 'loss',
          amount: bet.amount,
          direction: result,
          betAmount: bet.amount
        });
      }
    });

    setUserActiveBets([]);
    setShowResultModal(true);

    // Start new cycle after 3 seconds
    setTimeout(() => {
      setCurrentPool({
        id: Date.now(),
        upPool: 800 + Math.floor(Math.random() * 1000),
        downPool: 600 + Math.floor(Math.random() * 800),
        upBets: [],
        downBets: [],
        status: 'OPEN',
        timeRemaining: 300,
        lockTimeRemaining: 0,
        startPrice: endPrice,
        currentPrice: endPrice,
        endPrice: null
      });
    }, 3000);
  };

  const handleBetClick = (direction) => {
    if (currentPool.status !== 'OPEN') {
      alert('Betting is currently closed');
      return;
    }
    setSelectedDirection(direction);
    setShowBettingModal(true);
  };

  const placeBet = () => {
    const amount = parseFloat(betAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (amount > balance) {
      alert('Insufficient balance');
      return;
    }

    const newBet = {
      id: Date.now(),
      direction: selectedDirection,
      amount,
      timestamp: Date.now(),
      user: user?.firstName || 'You'
    };

    // Update user balance
    updateBalance(-amount);
    
    // Add to user active bets
    setUserActiveBets(prev => [...prev, newBet]);

    // Add to current pool
    setCurrentPool(prev => ({
      ...prev,
      upPool: selectedDirection === 'UP' ? prev.upPool + amount : prev.upPool,
      downPool: selectedDirection === 'DOWN' ? prev.downPool + amount : prev.downPool,
      upBets: selectedDirection === 'UP' ? [...prev.upBets, newBet] : prev.upBets,
      downBets: selectedDirection === 'DOWN' ? [...prev.downBets, newBet] : prev.downBets
    }));

    addTransaction({
      type: 'BET',
      amount: -amount,
      timestamp: new Date().toISOString(),
      status: 'Completed',
      description: `Bet ${amount} USDT on ${selectedDirection}`
    });

    setShowBettingModal(false);
    setBetAmount('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateUserShare = (direction) => {
    const pool = direction === 'UP' ? currentPool.upPool : currentPool.downPool;
    const amount = parseFloat(betAmount) || 0;
    if (pool === 0 && amount === 0) return 100;
    return ((amount / (pool + amount)) * 100).toFixed(1);
  };

  return (
    <div className="betting-system">
      {/* Timer and Status */}
      <div className="text-center mb-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex items-center justify-center space-x-4">
            <Clock className="w-5 h-5 text-gray-600" />
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {currentPool.status === 'OPEN' && formatTime(currentPool.timeRemaining)}
                {currentPool.status === 'LOCKED' && `Lock: ${formatTime(currentPool.lockTimeRemaining)}`}
                {currentPool.status === 'SETTLED' && 'Settled'}
              </div>
              <div className="text-sm text-gray-600">
                {currentPool.status === 'OPEN' && 'Betting Open'}
                {currentPool.status === 'LOCKED' && 'Betting Locked'}
                {currentPool.status === 'SETTLED' && 'Round Complete'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pool Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* UP Pool */}
        <button
          onClick={() => handleBetClick('UP')}
          disabled={currentPool.status !== 'OPEN'}
          className="bg-green-50 border-2 border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-lg font-semibold text-green-800">UP</div>
            <div className="text-2xl font-bold text-green-600">${currentPool.upPool.toLocaleString()}</div>
            <div className="text-sm text-green-700 flex items-center justify-center mt-1">
              <Users className="w-4 h-4 mr-1" />
              {currentPool.upBets.length} bettors
            </div>
          </div>
        </button>

        {/* DOWN Pool */}
        <button
          onClick={() => handleBetClick('DOWN')}
          disabled={currentPool.status !== 'OPEN'}
          className="bg-red-50 border-2 border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="text-center">
            <TrendingDown className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-lg font-semibold text-red-800">DOWN</div>
            <div className="text-2xl font-bold text-red-600">${currentPool.downPool.toLocaleString()}</div>
            <div className="text-sm text-red-700 flex items-center justify-center mt-1">
              <Users className="w-4 h-4 mr-1" />
              {currentPool.downBets.length} bettors
            </div>
          </div>
        </button>
      </div>

      {/* Active User Bets */}
      {userActiveBets.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Your Active Bets</h3>
          {userActiveBets.map(bet => (
            <div key={bet.id} className="flex justify-between items-center py-1">
              <span className="text-blue-800">{bet.direction} ${bet.amount}</span>
              <span className="text-sm text-blue-600">Pending...</span>
            </div>
          ))}
        </div>
      )}

      {/* Recent Bettors Grid */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Recent Bets</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
          {[...currentPool.upBets, ...currentPool.downBets]
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 20)
            .map((bet, index) => (
            <div key={index} className="text-xs p-2 bg-gray-50 rounded">
              <div className="font-medium truncate">{bet.user}</div>
              <div className={`text-xs ${bet.direction === 'UP' ? 'text-green-600' : 'text-red-600'}`}>
                {bet.direction} ${bet.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Betting Modal */}
      {showBettingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Place Bet - {selectedDirection}
            </h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount (USDT)
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">Available: ${balance.toFixed(2)}</p>
            </div>
            {betAmount && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">Your share: {calculateUserShare(selectedDirection)}%</div>
                <div className="text-sm text-gray-600">
                  Potential multiplier: {(((currentPool.upPool + currentPool.downPool + parseFloat(betAmount)) / (selectedDirection === 'UP' ? currentPool.upPool + parseFloat(betAmount) : currentPool.downPool + parseFloat(betAmount))) || 1).toFixed(2)}x
                </div>
              </div>
            )}
            <div className="flex space-x-3">
              <button
                onClick={placeBet}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm Bet
              </button>
              <button
                onClick={() => setShowBettingModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {showResultModal && lastResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="text-center">
              <div className={`text-6xl mb-4 ${lastResult.type === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                {lastResult.type === 'win' ? '🎉' : '😔'}
              </div>
              <h3 className={`text-xl font-bold mb-2 ${lastResult.type === 'win' ? 'text-green-600' : 'text-red-600'}`}>
                {lastResult.type === 'win' ? 'You Won!' : 'You Lost'}
              </h3>
              <p className="text-gray-600 mb-4">
                {lastResult.type === 'win' 
                  ? `You won $${lastResult.amount.toFixed(2)}!`
                  : `You lost $${lastResult.amount.toFixed(2)}`
                }
              </p>
              <button
                onClick={() => setShowResultModal(false)}
                className={`px-6 py-2 rounded-lg text-white ${
                  lastResult.type === 'win' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                {lastResult.type === 'win' ? 'Collect Winnings' : 'Try Again'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BettingSystem;