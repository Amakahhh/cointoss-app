import React, { useState, useEffect } from 'react';
import { TrendingUp, Wifi } from 'lucide-react';

const ImageChart = ({ currentPrice }) => {
  const [priceData, setPriceData] = useState([]);

  useEffect(() => {
    const generatePriceData = () => {
      const data = [];
      const basePrice = currentPrice || 110699.58;
      let price = basePrice;
      
      // Generate 8 data points for the last 8 minutes
      for (let i = 7; i >= 0; i--) {
        const time = new Date(Date.now() - i * 60000);
        const change = (Math.random() - 0.5) * 200;
        price += change;
        
        data.push({
          time: time.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true
          }),
          price: Math.max(price, 100000),
          timestamp: time.getTime()
        });
      }
      
      setPriceData(data);
    };

    generatePriceData();
    const interval = setInterval(generatePriceData, 30000);
    return () => clearInterval(interval);
  }, [currentPrice]);

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
          <span className="text-white text-sm">BTC/USDT Price Chart</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Wifi className="w-4 h-4 text-green-400" />
          <span className="text-green-400">Live</span>
        </div>
      </div>

      {/* Current Price Display */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-white mb-1">
          {formatPrice(currentPrice || 110699.58)}
        </div>
        <div className="text-sm text-gray-400">Current Price</div>
      </div>

      {/* Chart Area */}
      <div className="h-32 w-full bg-gray-900/50 rounded-lg p-4 mb-4 relative">
        <div className="h-full flex items-end justify-between gap-1">
          {priceData.map((point, index) => {
            const height = Math.max(40, (point.price / Math.max(...priceData.map(p => p.price))) * 90);
            const isUp = index === 0 || point.price > priceData[index - 1]?.price;
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center justify-end">
                <div 
                  className={`w-4/5 rounded-t ${
                    isUp ? 'bg-green-500' : 'bg-red-500'
                  }`}
                  style={{ height: `${height}%` }}
                ></div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Labels */}
      <div className="flex justify-between text-xs text-gray-400 mb-4">
        <span>11:45 PM</span>
        <span>11:47 PM</span>
        <span>11:49 PM</span>
        <span>11:51 PM</span>
      </div>

      {/* Chart Info */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <span>Last 8 minutes</span>
          <span>•</span>
          <span>1m intervals</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Live Data</span>
        </div>
      </div>
    </div>
  );
};

export default ImageChart;
