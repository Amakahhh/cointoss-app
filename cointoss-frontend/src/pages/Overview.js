import React from 'react';
import { Link } from 'react-router-dom';

const Overview = () => {
  const markets = [
    {
      id: 1,
      symbol: 'BTC/USDT',
      name: 'Bitcoin',
      price: 110699.58,
      change: 2.34,
      icon: '₿',
      color: 'text-orange-400'
    },
    {
      id: 2,
      symbol: 'ETH/USDT',
      name: 'Ethereum',
      price: 4285.21,
      change: -51.23,
      icon: 'Ξ',
      color: 'text-blue-400'
    },
    {
      id: 3,
      symbol: 'SOL/USDT',
      name: 'Solana',
      price: 98.45,
      change: 3.21,
      icon: '◎',
      color: 'text-purple-400'
    }
  ];

  const features = [
    {
      title: 'Fast Settlements',
      description: 'Instant payout After results',
      icon: '⚡'
    },
    {
      title: 'Multi-Asset Support',
      description: 'BTC, ETH, and Stablecoins',
      icon: '🪙'
    },
    {
      title: 'Transparent Payouts',
      description: 'No hidden fees or tricks',
      icon: '🔍'
    },
    {
      title: 'Low Volatility',
      description: 'Predict with Stable',
      icon: '📊'
    }
  ];

  const getChangeColor = (change) => {
    return change >= 0 ? 'text-green' : 'text-red';
  };

  const getChangeIcon = (change) => {
    return change >= 0 ? '↗' : '↘';
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container max-w-6xl">
        <h1 className="text-4xl font-bold text-white mb-8 text-center">
          Available Markets
        </h1>

        {/* Markets Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {markets.map((market) => (
            <Link
              key={market.id}
              to="/betting"
              className="card hover:transform hover:scale-105 transition-all duration-300 cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`text-3xl ${market.color}`}>
                    {market.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {market.symbol}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {market.name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    ${market.price.toLocaleString()}
                  </div>
                  <div className={`text-sm font-semibold ${getChangeColor(market.change)}`}>
                    {getChangeIcon(market.change)} {Math.abs(market.change).toFixed(2)}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose Cointoss?
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="card text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-blue mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;