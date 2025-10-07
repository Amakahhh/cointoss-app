import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, BarChart3, Wifi, WifiOff } from 'lucide-react';
import useCryptoData from '../hooks/useCryptoData';

const PriceChart = ({ currentPrice, chartType = 'line' }) => {
  const [priceData, setPriceData] = useState([]);
  const { price: realTimePrice, loading, error } = useCryptoData('bitcoin');
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Generate mock price data for demonstration
  useEffect(() => {
    const generatePriceData = () => {
      const data = [];
      const basePrice = realTimePrice?.current || currentPrice || 50000;
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
  }, [realTimePrice, currentPrice]);

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

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const formatPrice = (value) => `$${value.toLocaleString('en-US', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-400 text-sm">{`Time: ${label}`}</p>
          <p className="text-white font-bold">
            {formatPrice(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

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
          {error && (
            <span className="text-yellow-400 text-xs">(Using fallback data)</span>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatPrice}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#10B981' }}
              />
            </LineChart>
          ) : (
            <BarChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatPrice}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="price" 
                fill="#10B981"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-400">
        <div className="flex items-center gap-4">
          <span>Last 20 minutes</span>
          <span>•</span>
          <span>1m intervals</span>
          {realTimePrice && (
            <>
              <span>•</span>
              <span className={realTimePrice.change24h >= 0 ? 'text-green-400' : 'text-red-400'}>
                24h: {realTimePrice.change24h >= 0 ? '+' : ''}{realTimePrice.change24h.toFixed(2)}%
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`}></div>
          <span>{isOnline ? 'Live Data' : 'Offline'}</span>
        </div>
      </div>
    </div>
  );
};

export default PriceChart;
