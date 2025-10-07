import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Wifi, WifiOff } from 'lucide-react';

const SimpleChart = ({ currentPrice, chartType = 'line' }) => {
  const [priceData, setPriceData] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Generate mock price data for demonstration
  useEffect(() => {
    const generatePriceData = () => {
      const data = [];
      const basePrice = currentPrice || 50000;
      let price = basePrice;
      
      // Generate 20 data points for the last 20 minutes
      for (let i = 19; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60000); // 1 minute intervals
        const change = (Math.random() - 0.5) * 1000; // Random price change
        price += change;
        
        data.push({
          time: time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          price: Math.max(price, 1000), // Ensure price doesn't go too low
          timestamp: time.getTime()
        });
      }
      
      setPriceData(data);
    };

    generatePriceData();
    
    // Update data every 30 seconds
    const interval = setInterval(generatePriceData, 30000);
    return () => clearInterval(interval);
  }, [currentPrice]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const formatPrice = (value) => `$${value.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;

  return (
    <div className="w-full">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">BTC/USDT Price Chart</h3>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <BarChart3 className="w-4 h-4" />
          <span>Live</span>
        </div>
      </div>

      {/* Simple Chart Display */}
      <div className="h-64 w-full bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">
              {formatPrice(currentPrice || 50000)}
            </div>
            <div className="text-sm text-gray-400 mb-4">Current Price</div>
            
            {/* Simple Line Representation */}
            <div className="relative h-32 w-full">
              <svg width="100%" height="100%" className="overflow-visible">
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  points={priceData.map((point, index) => 
                    `${(index / (priceData.length - 1)) * 100},${100 - ((point.price - Math.min(...priceData.map(p => p.price))) / (Math.max(...priceData.map(p => p.price)) - Math.min(...priceData.map(p => p.price)))) * 100}`
                  ).join(' ')}
                />
                {priceData.map((point, index) => (
                  <circle
                    key={index}
                    cx={(index / (priceData.length - 1)) * 100}
                    cy={100 - ((point.price - Math.min(...priceData.map(p => p.price))) / (Math.max(...priceData.map(p => p.price)) - Math.min(...priceData.map(p => p.price)))) * 100}
                    r="2"
                    fill="#10B981"
                  />
                ))}
              </svg>
            </div>
            
            {/* Time Labels */}
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              {priceData.filter((_, index) => index % 4 === 0).map((point, index) => (
                <span key={index}>{point.time}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Info */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <span>Last 20 minutes</span>
          <span>•</span>
          <span>1m intervals</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span>{isOnline ? 'Live Data' : 'Offline'}</span>
        </div>
      </div>
    </div>
  );
};

export default SimpleChart;
