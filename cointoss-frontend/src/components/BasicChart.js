import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart3, Wifi, WifiOff } from 'lucide-react';

const BasicChart = ({ currentPrice, chartType = 'line' }) => {
  const [priceData, setPriceData] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Generate mock price data for demonstration
  useEffect(() => {
    const generatePriceData = () => {
      const data = [];
      const basePrice = currentPrice || 50000;
      let price = basePrice;
      
      // Generate 10 data points for the last 10 minutes
      for (let i = 9; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60000); // 1 minute intervals
        const change = (Math.random() - 0.5) * 500; // Random price change
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

  // Calculate chart dimensions
  const chartWidth = 100;
  const chartHeight = 60;
  const padding = 5;
  
  const minPrice = Math.min(...priceData.map(p => p.price));
  const maxPrice = Math.max(...priceData.map(p => p.price));
  const priceRange = maxPrice - minPrice;
  
  const getX = (index) => padding + (index / (priceData.length - 1)) * (chartWidth - 2 * padding);
  const getY = (price) => padding + ((maxPrice - price) / priceRange) * (chartHeight - 2 * padding);

  return (
    <div className="w-full">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">BTC/USDT Price Chart</h3>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4 text-green-400" />
              <span className="text-green-400">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4 text-red-400" />
              <span className="text-red-400">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64 w-full bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="h-full flex flex-col">
          {/* Price Display */}
          <div className="text-center mb-4">
            <div className="text-2xl font-bold text-white mb-1">
              {formatPrice(currentPrice || 50000)}
            </div>
            <div className="text-sm text-gray-400">Current Price</div>
          </div>
          
          {/* Chart Area */}
          <div className="flex-1 relative">
            <svg width="100%" height="100%" className="overflow-visible">
              {/* Grid Lines */}
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#374151" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3"/>
              
              {/* Chart Line */}
              {priceData.length > 1 && (
                <polyline
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2"
                  points={priceData.map((point, index) => 
                    `${getX(index)},${getY(point.price)}`
                  ).join(' ')}
                />
              )}
              
              {/* Data Points */}
              {priceData.map((point, index) => (
                <circle
                  key={index}
                  cx={getX(index)}
                  cy={getY(point.price)}
                  r="3"
                  fill="#10B981"
                  className="hover:r-4 transition-all"
                />
              ))}
              
              {/* Price Labels */}
              <text x="5" y="15" fill="#9CA3AF" fontSize="12" className="font-mono">
                {formatPrice(maxPrice)}
              </text>
              <text x="5" y="55" fill="#9CA3AF" fontSize="12" className="font-mono">
                {formatPrice(minPrice)}
              </text>
            </svg>
          </div>
          
          {/* Time Labels */}
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            {priceData.filter((_, index) => index % 2 === 0).map((point, index) => (
              <span key={index}>{point.time}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Info */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <span>Last 10 minutes</span>
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

export default BasicChart;










