import React, { useState, useEffect, useMemo } from 'react';
import useStore from '../store/useStore';
import { TrendingUp, TrendingDown, Clock, Activity, BarChart3, Target } from 'lucide-react';
import LineChart from '../components/LineChart';
import CandlestickChart from '../components/CandlestickChart';
import useMarketData from '../hooks/useMarketData';
import ResultModal from '../components/ResultModal';
import BettingModal from '../components/BettingModal';

const Betting = () => {
  const { 
    activeCycle, 
    balance, 
    currentBets, 
    placeBet, 
    startTimer,
    modalType,
    modalData,
    hideModal,
    getPayoutMultipliers,
    getActiveBets,
    theme,
    chartInterval,
    setChartInterval,
    chartSymbol,
    setChartSymbol,
    isAuthenticated
  } = useStore();

  const store = useStore();
  
  const [chartType, setChartType] = useState('line');
  const [showBettingModal, setShowBettingModal] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState(null);

  // Apply theme to document element when component mounts or theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const interval = startTimer();
    return () => clearInterval(interval);
  }, [startTimer]);

  const handleBetClick = (direction) => {
    // Check if user is authenticated first
    if (!isAuthenticated) {
      alert('Please login to place bets');
      window.location.href = '/login';
      return;
    }
    
    if (activeCycle.status !== 'OPEN') {
      alert('Betting is currently closed');
      return;
    }
    setSelectedDirection(direction);
    setShowBettingModal(true);
  };

  const handleConfirmBet = async (amount) => {
    try {
      await placeBet({
        direction: selectedDirection,
        amount: amount,
        cycleId: activeCycle.id
      });
      alert(`Bet placed successfully! ${selectedDirection} $${amount}`);
    } catch (error) {
      console.error('Bet placement error:', error);
      alert(`Failed to place bet: ${error.message}`);
      throw error;
    }
  };

  const payoutMultipliers = getPayoutMultipliers();

  // Market data hook
  const { candles, line, loading: marketLoading, error: marketError, source: marketSource, wsConnected, refresh } = useMarketData(chartInterval, chartSymbol);

  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles[candles.length - 2];
  const lastPrice = lastCandle ? lastCandle.close : null;
  const prevClose = prevCandle ? prevCandle.close : lastPrice;
  const pctChange = lastPrice && prevClose ? ((lastPrice - prevClose) / prevClose) * 100 : 0;
  const priceColor = pctChange > 0 ? 'var(--accent-green)' : pctChange < 0 ? 'var(--accent-red)' : 'var(--text-secondary)';

  const symbolOptions = useMemo(() => [
    'BTCUSDT','ETHUSDT','BNBUSDT','ETHBTC','SOLUSDT','XRPUSDT','ADAUSDT','DOGEUSDT','AVAXUSDT','MATICUSDT','BTCNGN'
  ], []);

  const formatSymbol = (sym) => {
    if (sym.endsWith('USDT')) return sym.replace('USDT','/USDT');
    if (sym.endsWith('USDC')) return sym.replace('USDC','/USDC');
    if (sym.endsWith('NGN')) return sym.replace('NGN','/NGN');
    if (sym.length === 6) return sym.slice(0,3) + '/' + sym.slice(3);
    return sym;
  };

  return (
    <div className="betting-container">
      <style>
        {`
        /* Theme Variables */
        :root {
          --bg-primary: linear-gradient(135deg, #0F0F23 0%, #1E1E38 100%);
          --bg-secondary: #1A1B2E;
          --bg-tertiary: #252640;
          --text-primary: #F8FAFC;
          --text-secondary: #94A3B8;
          --border-color: rgba(248, 250, 252, 0.08);
          --accent-purple: #8B5CF6;
          --accent-green: #22C55E;
          --accent-blue: #3B82F6;
          --accent-red: #EF4444;
          --accent-gold: #F59E0B;
          --card-bg: rgba(26, 27, 46, 0.95);
          --shadow: rgba(0, 0, 0, 0.3);
          --glass-bg: rgba(26, 27, 46, 0.8);
          --glass-border: rgba(248, 250, 252, 0.1);
          --hover-bg: rgba(37, 38, 64, 0.7);
        }
        
        [data-theme="light"] {
          --bg-primary: linear-gradient(135deg, #FAFBFC 0%, #F4F6F8 100%);
          --bg-secondary: #FFFFFF;
          --bg-tertiary: #F8FAFC;
          --text-primary: #0F172A;
          --text-secondary: #475569;
          --border-color: rgba(15, 23, 42, 0.08);
          --card-bg: rgba(255, 255, 255, 0.95);
          --shadow: rgba(15, 23, 42, 0.1);
          --glass-bg: rgba(255, 255, 255, 0.8);
          --glass-border: rgba(15, 23, 42, 0.1);
          --hover-bg: rgba(248, 250, 252, 0.7);
        }

        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: var(--bg-primary);
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity:0; transform:translateY(6px); }
          to { opacity:1; transform:translateY(0); }
        }

        .symbol-btn:hover:not(.active) { background: var(--hover-bg); color: var(--text-primary) !important; }
        .symbol-btn.active { box-shadow:0 4px 14px rgba(139,92,246,0.35); }

        .betting-container {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        /* Header Styles */
        .header {
          background: var(--glass-bg);
          border-bottom: 1px solid var(--border-color);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .header-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 1.5rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 2rem;
        }

        .header-left h1 {
          font-size: 2rem;
          font-weight: 800;
          margin: 0 0 0.5rem 0;
          color: var(--text-primary);
        }

        .header-left p {
          font-size: 1rem;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Chart Toggle Buttons */
        .chart-toggle {
          display: flex;
          background: var(--card-bg);
          border: 1px solid var(--glass-border);
          border-radius: 1rem;
          padding: 0.5rem;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px var(--shadow);
        }

        .interval-toggle {
          display: flex;
          background: var(--card-bg);
          border: 1px solid var(--glass-border);
          border-radius: 1rem;
          padding: 0.4rem;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px var(--shadow);
          gap: 0.25rem;
        }

        .interval-button {
          padding: 0.5rem 0.9rem;
          border: none;
          border-radius: 0.65rem;
          font-weight: 600;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.25s ease;
          background: transparent;
          color: var(--text-secondary);
          letter-spacing: .03em;
        }
        .interval-button.active {
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
          color: white;
          box-shadow: 0 4px 14px rgba(139,92,246,0.35);
        }
        .interval-button:hover:not(.active) { background: var(--hover-bg); color: var(--text-primary); }

        .chart-button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.75rem;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.3s ease;
          background: transparent;
          color: var(--text-secondary);
        }

        .chart-button.active {
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
          color: white;
          box-shadow: 0 4px 20px rgba(139, 92, 246, 0.3);
          transform: translateY(-1px);
        }

        .chart-button:hover:not(.active) {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        /* Main Content */
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 2rem;
          display: grid;
          gap: 2rem;
        }

        /* Trading Card */
        .trading-card {
          background: var(--card-bg);
          border: 1px solid var(--glass-border);
          border-radius: 1.5rem;
          overflow: hidden;
          box-shadow: 0 8px 32px var(--shadow);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .card-header {
          padding: 2rem 2rem 1rem 2rem;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pair-info h2 {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0 0 0.25rem 0;
          color: var(--text-primary);
        }

        .pair-info p {
          color: var(--text-secondary);
          margin: 0;
          font-size: 0.875rem;
        }

        .price-display {
          text-align: right;
        }

        .current-price {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0;
          color: var(--accent-green);
        }

        .price-change {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--accent-green);
          font-weight: 600;
          font-size: 1rem;
        }

        /* Chart Section */
        .chart-section {
          padding: 0 2rem 2rem 2rem;
        }

        .chart-container {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 1rem;
          padding: 2rem;
          margin-bottom: 2rem;
          position: relative;
          min-height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chart-placeholder {
          text-align: center;
          color: var(--text-secondary);
        }

        .chart-placeholder h3 {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        /* Info Grid */
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .info-card {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 1rem;
          padding: 1.5rem;
          text-align: center;
          transition: all 0.3s ease;
        }

        .info-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 48px var(--shadow);
        }

        .info-card.timer {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05));
          border-color: rgba(34, 197, 94, 0.2);
        }

        .info-card.timer.locked {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
          border-color: rgba(239, 68, 68, 0.2);
        }

        .info-card.up-pool {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.05));
          border-color: rgba(34, 197, 94, 0.2);
        }

        .info-card.down-pool {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
          border-color: rgba(239, 68, 68, 0.2);
        }

        .timer-display {
          font-size: 3rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .timer-display.open {
          color: var(--accent-green);
        }

        .timer-display.locked {
          color: var(--accent-red);
        }

        .info-card h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0 0 0.25rem 0;
          color: var(--text-primary);
        }

        .info-card p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .pool-amount {
          font-size: 1.75rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .pool-amount.up {
          color: var(--accent-green);
        }

        .pool-amount.down {
          color: var(--accent-red);
        }

        .multiplier-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-weight: 700;
          font-size: 0.875rem;
        }

        .multiplier-badge.up {
          background: rgba(34, 197, 94, 0.2);
          color: var(--accent-green);
        }

        .multiplier-badge.down {
          background: rgba(239, 68, 68, 0.2);
          color: var(--accent-red);
        }

        /* Betting Buttons */
        .betting-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .bet-button {
          padding: 2rem;
          border: none;
          border-radius: 1rem;
          font-weight: 800;
          font-size: 1.25rem;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }

        .bet-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: var(--bg-tertiary) !important;
          color: var(--text-secondary) !important;
          box-shadow: none !important;
        }

        .bet-button.up {
          background: linear-gradient(135deg, var(--accent-green), #16a34a);
          color: white;
          box-shadow: 0 8px 32px rgba(34, 197, 94, 0.3);
        }

        .bet-button.down {
          background: linear-gradient(135deg, var(--accent-red), #dc2626);
          color: white;
          box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
        }

        .bet-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 48px rgba(34, 197, 94, 0.4);
        }

        .bet-button.down:hover:not(:disabled) {
          box-shadow: 0 12px 48px rgba(239, 68, 68, 0.4);
        }

        /* Active Bets Display */
        .active-bets-display {
          margin-top: 2rem;
          background: var(--card-bg);
          border: 1px solid var(--glass-border);
          border-radius: 1rem;
          padding: 1.5rem;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 4px 16px var(--shadow);
        }

        .active-bets-display h4 {
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          text-align: center;
        }

        .active-bets-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .active-bet-item {
          display: grid;
          grid-template-columns: auto 1fr auto auto;
          gap: 1rem;
          align-items: center;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 0.75rem;
          transition: all 0.3s ease;
        }

        .active-bet-item:hover {
          background: rgba(255, 255, 255, 0.05);
          transform: translateY(-1px);
        }

        .active-bet-item.up {
          border-left: 3px solid #22c55e;
        }

        .active-bet-item.down {
          border-left: 3px solid #ef4444;
        }

        .bet-direction {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          font-size: 0.9rem;
        }

        .bet-direction.up {
          color: #22c55e;
        }

        .bet-direction.down {
          color: #ef4444;
        }

        .bet-amount {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 1rem;
        }

        .bet-multiplier {
          background: linear-gradient(135deg, #fbbf24, #f59e0b);
          color: #1a1a1a;
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .potential-win {
          color: #10b981;
          font-weight: 600;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .active-bet-item {
            grid-template-columns: 1fr;
            gap: 0.5rem;
            text-align: center;
          }
        }

        /* Locked State */
        .locked-state {
          background: var(--card-bg);
          border: 1px solid var(--glass-border);
          border-radius: 1.5rem;
          padding: 3rem 2rem;
          text-align: center;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px var(--shadow);
        }

        .locked-icon {
          width: 5rem;
          height: 5rem;
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.1));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 2rem auto;
        }

        .locked-state h3 {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .locked-state p {
          font-size: 1.125rem;
          color: var(--text-secondary);
          margin-bottom: 2rem;
        }

        .locked-timer {
          color: var(--accent-red);
          font-weight: 800;
          font-size: 1.5rem;
        }

        .active-bets {
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 1rem;
          padding: 2rem;
          max-width: 500px;
          margin: 0 auto;
        }

        .active-bets h4 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: var(--text-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .bet-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          background: var(--hover-bg);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          margin-bottom: 1rem;
        }

        .bet-item:last-child {
          margin-bottom: 0;
        }

        .bet-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .bet-indicator {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
        }

        .bet-indicator.up {
          background: var(--accent-green);
        }

        .bet-indicator.down {
          background: var(--accent-red);
        }

        .bet-amount {
          font-weight: 600;
          color: var(--text-primary);
        }

        .bet-direction {
          font-weight: 800;
          font-size: 0.875rem;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
        }

        .bet-direction.up {
          background: rgba(34, 197, 94, 0.2);
          color: var(--accent-green);
        }

        .bet-direction.down {
          background: rgba(239, 68, 68, 0.2);
          color: var(--accent-red);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .header-content {
            padding: 1rem;
            flex-direction: column;
            align-items: stretch;
          }

          .header-left {
            text-align: center;
          }

          .chart-toggle {
            justify-content: center;
          }

          .main-content {
            padding: 1rem;
          }

          .card-header {
            padding: 1.5rem 1rem 1rem 1rem;
            flex-direction: column;
            align-items: stretch;
            text-align: center;
          }

          .price-display {
            text-align: center;
          }

          .current-price {
            font-size: 2rem;
          }

          .chart-section {
            padding: 0 1rem 1.5rem 1rem;
          }

          .chart-container {
            padding: 1.5rem;
            min-height: 300px;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .betting-buttons {
            grid-template-columns: 1fr;
          }

          .bet-button {
            padding: 1.5rem;
          }

          .locked-state {
            padding: 2rem 1rem;
          }
        }

        @media (max-width: 480px) {
          .header-left h1 {
            font-size: 1.5rem;
          }

          .timer-display {
            font-size: 2.5rem;
          }

          .pool-amount {
            font-size: 1.5rem;
          }

          .current-price {
            font-size: 1.75rem;
          }
        }
        `}
      </style>

      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="header-left">
            <h1>Live Predictions</h1>
            <p>Real-time crypto price predictions with professional trading interface</p>
          </div>
          
          <div style={{display:'flex', gap:'1rem', alignItems:'center', flexWrap:'wrap'}}>
            {/* Symbol Dropdown */}
            <div style={{display:'flex', flexDirection:'column', gap:'.35rem'}}>
              <label style={{fontSize:'.6rem', letterSpacing:'.07em', fontWeight:600, color:'var(--text-secondary)'}}>PAIR</label>
              <select value={chartSymbol} onChange={(e) => setChartSymbol(e.target.value)}
                style={{
                  background:'var(--card-bg)',
                  color:'var(--text-primary)',
                  border:'1px solid var(--glass-border)',
                  borderRadius:'.75rem',
                  padding:'.65rem .9rem',
                  fontWeight:600,
                  fontSize:'.75rem',
                  letterSpacing:'.05em',
                  cursor:'pointer',
                  boxShadow:'0 6px 24px var(--shadow)',
                  minWidth:'10rem'
                }}>
                {symbolOptions.map(sym => (
                  <option key={sym} value={sym}>{formatSymbol(sym)}</option>
                ))}
              </select>
            </div>
            <div className="chart-toggle">
            <button 
              className={`chart-button ${chartType === 'line' ? 'active' : ''}`}
              onClick={() => setChartType('line')}
            >
              
              Line Chart
            </button>
            <button 
              className={`chart-button ${chartType === 'candle' ? 'active' : ''}`}
              onClick={() => setChartType('candle')}
            >
              
              Candlestick
            </button>
            </div>
          </div>
        </div>
      </div>

        <div className="card-header">
        {/* Trading Card */}
        <div className="trading-card">
          <div className="card-header">
            <div className="pair-info">
              <h2>{formatSymbol(chartSymbol)}</h2>
              <p>{chartSymbol.startsWith('BTC')? 'Bitcoin':'Market'} • Live Market</p>
            </div>
            <div className="price-display">
              <div className="current-price" style={{color: priceColor}}>{lastPrice ? `$${lastPrice.toLocaleString(undefined,{maximumFractionDigits:2})}`:'—'}</div>
              <div className="price-change" style={{color: priceColor}}>
                {pctChange >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                <span>{pctChange >=0 ? '+' : ''}{pctChange.toFixed(2)}% {lastPrice && prevClose ? `(${(lastPrice - prevClose > 0?'+':'') + (lastPrice - prevClose).toFixed(2)})`:''}</span>
              </div>
              <div style={{display:'flex', gap:'.4rem', flexWrap:'wrap', marginTop:'.5rem'}}>
                <span style={{position:'relative'}}>
                  <span style={{fontSize:'.55rem', letterSpacing:'.05em', padding:'.3rem .5rem', borderRadius:'.4rem', background:'var(--bg-tertiary)', border:'1px solid var(--glass-border)', color:'var(--text-secondary)', cursor:'help'}}>
                    {marketSource === 'mock' ? 'SIMULATED' : 'LIVE'}
                  </span>
                  <span style={{position:'absolute', top:'115%', left:0, zIndex:20, whiteSpace:'nowrap', background:'var(--card-bg)', border:'1px solid var(--glass-border)', padding:'.45rem .65rem', fontSize:'.55rem', borderRadius:'.4rem', opacity:0, transform:'translateY(4px)', pointerEvents:'none', transition:'all .2s ease'}} className="badge-tip">{marketSource==='mock' ? 'Fallback synthetic data (network/API issue)':'Data from Binance REST/WS feed'}</span>
                </span>
                <span style={{position:'relative'}}>
                  <span style={{fontSize:'.55rem', letterSpacing:'.05em', padding:'.3rem .5rem', borderRadius:'.4rem', background: wsConnected ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', border:'1px solid var(--glass-border)', color: wsConnected ? 'var(--accent-green)':'var(--accent-red)', cursor:'help'}}>
                    {wsConnected ? 'WS CONNECTED':'WS OFFLINE'}
                  </span>
                  <span style={{position:'absolute', top:'115%', left:0, zIndex:20, whiteSpace:'nowrap', background:'var(--card-bg)', border:'1px solid var(--glass-border)', padding:'.45rem .65rem', fontSize:'.55rem', borderRadius:'.4rem', opacity:0, transform:'translateY(4px)', pointerEvents:'none', transition:'all .2s ease'}} className="badge-tip">{wsConnected? 'Realtime stream active':'Falling back to periodic polling'}</span>
                </span>
                <style>{`
                  .price-display span[position], .price-display span.badge-tip {}
                  .price-display span[position]:hover {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  .price-display span[position] {}
                  /* Hover effect for small tooltip badges */
                  .price-display span:hover + .badge-tip, .price-display span.badge-tip:hover { opacity:1 !important; transform:translateY(0) !important; }
                  /* Better selector for our positioned wrappers */
                  .price-display > span[position], .price-display > span { position:relative; }
                  .price-display > span:hover .badge-tip { opacity:1; transform:translateY(0); }
                `}</style>
              </div>
            </div>
          </div>

          <div className="chart-section">
            <div className="interval-toggle">
              {['1m','5m','15m','1h'].map(int => (
                <button key={int} className={`interval-button ${chartInterval === int ? 'active':''}`} onClick={() => setChartInterval(int)}>{int}</button>
              ))}
            </div>
            <div className="chart-container" style={{background: 'var(--card-bg)', minHeight:'420px', padding:'1.5rem', position:'relative'}}>
              {marketError && (
                <div style={{position:'absolute', top:8, left:8, fontSize:11, color:'var(--accent-gold)', background:'rgba(0,0,0,0.35)', padding:'.4rem .6rem', borderRadius:'.5rem', backdropFilter:'blur(6px)', border:'1px solid var(--glass-border)'}}>
                  Data error – using simulated feed
                </div>
              )}
              <div className="chart-fade-wrapper" style={{position:'relative', width:'100%', height:'100%'}}>
                <div key={chartType} className="chart-fade" style={{animation:'fadeIn .5s ease'}}>
                  {chartType === 'line' && (
                    <LineChart data={line} loading={marketLoading} source={marketSource} interval={chartInterval} />
                  )}
                  {chartType === 'candle' && (
                    <CandlestickChart candles={candles} loading={marketLoading} source={marketSource} interval={chartInterval} />
                  )}
                </div>
              </div>
              <button onClick={refresh} style={{position:'absolute', top:8, right:8, fontSize:'.6rem', padding:'.4rem .6rem', border:'1px solid var(--glass-border)', background:'var(--bg-tertiary)', color:'var(--text-secondary)', borderRadius:'.4rem', cursor:'pointer'}}>
                Refresh
              </button>
            </div>

            {/* Info Grid */}
            <div className="info-grid">
              <div className={`info-card timer ${activeCycle.cyclePhase === 'LOCKED' ? 'locked' : ''}`}>
                <div className={`timer-display ${activeCycle.cyclePhase === 'OPEN' ? 'open' : 'locked'}`}>
                  {formatTime(activeCycle.timeRemaining)}
                </div>
                <h3>{activeCycle.cyclePhase === 'OPEN' ? 'Betting Open' : 'Round Locked'}</h3>
                <p>Round #{activeCycle.id}</p>
              </div>

              <div className="info-card up-pool">
                <div className="pool-amount up">${activeCycle.upPool.toFixed(2)}</div>
                <h3>UP Pool</h3>
                <div className="multiplier-badge up">
                  {payoutMultipliers.up.toFixed(2)}x
                </div>
              </div>

              <div className="info-card down-pool">
                <div className="pool-amount down">${activeCycle.downPool.toFixed(2)}</div>
                <h3>DOWN Pool</h3>
                <div className="multiplier-badge down">
                  {payoutMultipliers.down.toFixed(2)}x
                </div>
              </div>
            </div>

            {/* Betting Buttons */}
            <div className="betting-buttons">
              <button
                className="bet-button up"
                onClick={() => handleBetClick('UP')}
                disabled={activeCycle.status !== 'OPEN'}
              >
                <TrendingUp className="w-8 h-8" />
                <span>BET UP</span>
              </button>

              <button
                className="bet-button down"
                onClick={() => handleBetClick('DOWN')}
                disabled={activeCycle.status !== 'OPEN'}
              >
                <TrendingDown className="w-8 h-8" />
                <span>BET DOWN</span>
              </button>
            </div>

            {/* Active Bets Display */}
            {activeCycle.status === 'OPEN' && getActiveBets().length > 0 && (
              <div className="active-bets-display">
                <h4>Your Active Bets</h4>
                <div className="active-bets-list">
                  {getActiveBets().map((bet, index) => (
                    <div key={index} className={`active-bet-item ${bet.direction.toLowerCase()}`}>
                      <div className="bet-direction">
                        {bet.direction === 'UP' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>{bet.direction}</span>
                      </div>
                      <div className="bet-amount">${bet.amount}</div>
                      <div className="bet-multiplier">
                        {bet.direction === 'UP' 
                          ? `${getPayoutMultipliers().up}x` 
                          : `${getPayoutMultipliers().down}x`
                        }
                      </div>
                      <div className="potential-win">
                        ${(bet.amount * (bet.direction === 'UP' 
                          ? getPayoutMultipliers().up 
                          : getPayoutMultipliers().down
                        )).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Locked State */}
        {activeCycle.status === 'LOCKED' && (
          <div className="locked-state">
            <div className="locked-icon">
              <Clock className="w-8 h-8 text-red-400" />
            </div>
            <h3>Round Locked</h3>
            <p>
              Betting is closed. Settlement in{' '}
              <span className="locked-timer">{formatTime(activeCycle.timeRemaining)}</span>
            </p>
            
            {currentBets.length > 0 && (
              <div className="active-bets">
                <h4>
                  <Activity className="w-5 h-5" />
                  Your Active Bets
                </h4>
                <div>
                  {currentBets.map((bet) => (
                    <div key={bet.id} className="bet-item">
                      <div className="bet-info">
                        <div className={`bet-indicator ${bet.direction.toLowerCase()}`}></div>
                        <span className="bet-amount">${bet.amount}</span>
                      </div>
                      <span className={`bet-direction ${bet.direction.toLowerCase()}`}>
                        {bet.direction}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        <BettingModal
          isOpen={showBettingModal}
          onClose={() => {
            setShowBettingModal(false);
            setSelectedDirection(null);
          }}
          onConfirm={handleConfirmBet}
          direction={selectedDirection}
          currentPrice={activeCycle.currentPrice}
          upPool={activeCycle.upPool}
          downPool={activeCycle.downPool}
          balance={balance}
        />

        <ResultModal
          isOpen={modalType === 'RESULT'}
          onClose={hideModal}
          result={modalData?.result}
          winnings={modalData?.winnings}
          betAmount={currentBets[0]?.amount}
          direction={currentBets[0]?.direction}
        />
      </div>
    </div>
  );
};

export default Betting;