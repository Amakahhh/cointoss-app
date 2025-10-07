import React from 'react';

const SimpleWorkingChart = () => {
  console.log('SimpleWorkingChart component is rendering!');
  return (
    <div className="w-full">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-white text-sm">BTC/USDT Price Chart</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="text-green-400">Live</span>
        </div>
      </div>

      {/* Current Price Display */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-white mb-1">
          $110,699.58
        </div>
        <div className="text-sm text-gray-400">Current Price</div>
      </div>

      {/* Chart Area - SIMPLE BARS */}
      <div className="h-32 w-full bg-gray-900/50 rounded-lg p-4 mb-4 relative">
        <div className="h-full flex items-end justify-between gap-2">
          {/* Bar 1 */}
          <div className="flex-1 flex flex-col items-center justify-end">
            <div className="w-3/4 bg-green-500 rounded-t" style={{ height: '60%' }}></div>
          </div>
          {/* Bar 2 */}
          <div className="flex-1 flex flex-col items-center justify-end">
            <div className="w-3/4 bg-red-500 rounded-t" style={{ height: '40%' }}></div>
          </div>
          {/* Bar 3 */}
          <div className="flex-1 flex flex-col items-center justify-end">
            <div className="w-3/4 bg-green-500 rounded-t" style={{ height: '80%' }}></div>
          </div>
          {/* Bar 4 */}
          <div className="flex-1 flex flex-col items-center justify-end">
            <div className="w-3/4 bg-red-500 rounded-t" style={{ height: '30%' }}></div>
          </div>
          {/* Bar 5 */}
          <div className="flex-1 flex flex-col items-center justify-end">
            <div className="w-3/4 bg-green-500 rounded-t" style={{ height: '70%' }}></div>
          </div>
          {/* Bar 6 */}
          <div className="flex-1 flex flex-col items-center justify-end">
            <div className="w-3/4 bg-red-500 rounded-t" style={{ height: '50%' }}></div>
          </div>
          {/* Bar 7 */}
          <div className="flex-1 flex flex-col items-center justify-end">
            <div className="w-3/4 bg-green-500 rounded-t" style={{ height: '90%' }}></div>
          </div>
          {/* Bar 8 */}
          <div className="flex-1 flex flex-col items-center justify-end">
            <div className="w-3/4 bg-red-500 rounded-t" style={{ height: '35%' }}></div>
          </div>
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

export default SimpleWorkingChart;
