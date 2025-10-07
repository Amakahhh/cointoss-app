import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, Calculator } from 'lucide-react';

// The main component with the refactored CSS
const BettingModal = ({ isOpen, onClose, onConfirm, direction, currentPrice, upPool, downPool, balance }) => {
  const [betAmount, setBetAmount] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen) return null;

  const quickAmounts = [5, 10, 25, 50, 100];
  const totalPool = upPool + downPool;
  const userPool = direction === 'UP' ? upPool : downPool;
  const newUserPool = userPool + parseFloat(betAmount || 0);
  const userPercentage = newUserPool > 0 ? ((parseFloat(betAmount || 0) / newUserPool) * 100) : 0;
  const potentialWin = totalPool > 0 ? (totalPool * userPercentage / 100) : 0;

  const handleConfirm = async () => {
    if (!betAmount || parseFloat(betAmount) <= 0) {
      // Replaced alert with a simple console log for a better UX
      console.error('Please enter a valid bet amount');
      return;
    }

    if (parseFloat(betAmount) > balance) {
      console.error('Insufficient balance');
      return;
    }

    setIsConfirming(true);
    try {
      await onConfirm(parseFloat(betAmount));
      setBetAmount('');
      onClose();
    } catch (error) {
      console.error('Error placing bet. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <>
      <style>
        {`
          /* === Theme Variables === */
          :root {
            --bg-secondary: #f0f4f8;
            --bg-tertiary: #ffffff;
            --border-color: #e2e8f0;
            --text-primary: #1a202c;
            --text-secondary: #4a5568;
            --accent-purple: #7f5af0;
          }
          [data-theme='dark'] {
            --bg-secondary: #110320; /* Updated dark mode background color */
            --bg-tertiary: #1e0636;
            --border-color: #2d134b;
            --text-primary: #f0f4f8;
            --text-secondary: #a0aec0;
            --accent-purple: #9c89e8;
          }

          /* === Core Modal Styles === */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            backdrop-filter: blur(12px);
            display: flex;
            align-items: center; /* Center the card horizontally */
            justify-content: center;
            z-index: 50;
            padding: 1rem;
            overflow-y: auto; /* Allows the entire overlay to scroll if content is too tall */
          }
          
          .modal-card {
            border-radius: 1rem;
            border: 1px solid;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
            max-width: 32rem; /* Matches max-w-lg */
            width: 100%;
            position: relative;
            overflow: hidden;
            margin: 2rem 0; /* Add vertical margin to give space on small screens */
          }

          /* Header Styles */
          .header {
            padding: 1.5rem;
            border-bottom: 1px solid;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .header-up-bg {
            background-image: linear-gradient(to right, rgba(22, 163, 74, 0.1), rgba(5, 150, 105, 0.05));
          }
          
          .header-down-bg {
            background-image: linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05));
          }

          .header-content {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }
          
          .icon-container {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 9999px; /* rounded-full */
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .icon-up-bg {
            background-color: rgba(22, 163, 74, 0.2);
          }
          
          .icon-down-bg {
            background-color: rgba(239, 68, 68, 0.2);
          }

          .header-title {
            font-size: 1.125rem;
            font-weight: 700;
          }
          
          .header-price {
            font-size: 0.875rem;
          }

          .close-button {
            color: #9ca3af; /* gray-400 */
            transition-property: color, background-color;
            transition-duration: 150ms;
            padding: 0.5rem;
            border-radius: 0.5rem;
            cursor: pointer;
          }
          .close-button:hover {
            color: white;
            background-color: rgba(255, 255, 255, 0.1);
          }

          /* Main Content Styles */
          .modal-content {
            padding: 1.5rem;
          }
          
          .grid-2-cols {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1rem;
          }
          
          .pool-card {
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
            border: 1px solid;
          }

          .up-pool-bg {
            background-color: rgba(22, 163, 74, 0.1);
            border-color: rgba(22, 163, 74, 0.2);
          }

          .down-pool-bg {
            background-color: rgba(239, 68, 68, 0.1);
            border-color: rgba(239, 68, 68, 0.2);
          }

          .gray-pool-bg {
            background-color: rgba(107, 114, 128, 0.1);
            border-color: rgba(107, 114, 128, 0.2);
          }

          .up-text {
            color: #4ade80; /* green-400 */
            font-weight: bold;
          }

          .down-text {
            color: #f87171; /* red-400 */
            font-weight: bold;
          }

          /* Input and Button Styles */
          .input-group {
            margin-bottom: 1.5rem;
          }
          
          .label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: 0.5rem;
          }

          .input-container {
            position: relative;
          }
          
          .input-icon {
            position: absolute;
            left: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            width: 1.25rem;
            height: 1.25rem;
          }

          .bet-input {
            width: 100%;
            padding: 0.75rem 1rem 0.75rem 2.5rem;
            border-radius: 0.75rem;
            border: 1px solid;
            outline: none;
            transition: all 150ms;
          }
          
          .bet-input:focus {
            ring-color: transparent;
            box-shadow: 0 0 0 2px var(--accent-purple);
          }
          
          .input-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 0.5rem;
          }

          .max-button {
            font-size: 0.875rem;
            font-weight: 500;
            transition: opacity 150ms;
          }
          
          .max-button:hover {
            opacity: 0.8;
          }
          
          .quick-select-container {
            margin-bottom: 1.5rem;
          }

          .quick-select-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(5rem, 1fr));
            gap: 0.5rem;
          }

          .quick-select-button {
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            transition: all 150ms;
            border: 1px solid;
            cursor: pointer;
          }

          .quick-select-button:hover {
            opacity: 0.8;
          }

          .up-active {
            background-color: rgba(22, 163, 74, 0.2);
            color: #4ade80;
            border-color: rgba(22, 163, 74, 0.3);
          }

          .down-active {
            background-color: rgba(239, 68, 68, 0.2);
            color: #f87171;
            border-color: rgba(239, 68, 68, 0.3);
          }
          
          /* Payout Calculator */
          .payout-card {
            border-radius: 0.75rem;
            padding: 1rem;
            margin-bottom: 1.5rem;
            border: 1px solid;
          }
          
          .payout-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.75rem;
          }

          .payout-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1rem;
            font-size: 0.875rem;
          }

          /* Action Buttons */
          .action-buttons {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 0.75rem;
          }

          .cancel-button {
            padding: 0.75rem 1rem;
            border-radius: 0.75rem;
            font-weight: 500;
            border: 1px solid;
            background-color: transparent;
            transition: opacity 150ms;
            cursor: pointer;
          }

          .confirm-button {
            padding: 0.75rem 1rem;
            border-radius: 0.75rem;
            font-weight: 700;
            color: white;
            transition: opacity 150ms;
            cursor: pointer;
            border: none;
          }

          .confirm-up-bg {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.25), 0 4px 6px -2px rgba(16, 185, 129, 0.25);
          }

          .confirm-down-bg {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.25), 0 4px 6px -2px rgba(239, 68, 68, 0.25);
          }

          .confirm-button:hover {
            opacity: 0.9;
          }

          .confirm-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        `}
      </style>
      <div className="modal-overlay">
        <div 
          className="modal-card"
          style={{ 
            background: 'var(--bg-secondary)', 
            borderColor: 'var(--border-color)' 
          }}
        >
          {/* Professional Header */}
          <div 
            className={`header ${direction === 'UP' ? 'header-up-bg' : 'header-down-bg'}`}
            style={{ borderColor: 'var(--border-color)' }}
          >
            <div className="header-content">
              <div 
                className={`icon-container ${direction === 'UP' ? 'icon-up-bg' : 'icon-down-bg'}`}
              >
                {direction === 'UP' ? (
                  <TrendingUp className="w-5 h-5 text-green-400" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-400" />
                )}
              </div>
              <div>
                <h2 className="header-title" style={{ color: 'var(--text-primary)' }}>
                  Place {direction} Bet
                </h2>
                <p className="header-price" style={{ color: 'var(--text-secondary)' }}>
                  Current Price: ${currentPrice?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="close-button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content */}
          <div className="modal-content">
            {/* Pool Statistics */}
            <div className="grid-2-cols mb-6">
              <div 
                className={`pool-card text-center ${direction === 'UP' ? 'up-pool-bg' : 'gray-pool-bg'}`}
              >
                <div className={`text-lg font-bold ${direction === 'UP' ? 'up-text' : 'text-gray-400'}`}>
                  ${upPool.toFixed(2)}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>UP Pool</div>
              </div>
              <div 
                className={`pool-card text-center ${direction === 'DOWN' ? 'down-pool-bg' : 'gray-pool-bg'}`}
              >
                <div className={`text-lg font-bold ${direction === 'DOWN' ? 'down-text' : 'text-gray-400'}`}>
                  ${downPool.toFixed(2)}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>DOWN Pool</div>
              </div>
            </div>

            {/* Bet Amount Input */}
            <div className="input-group">
              <label className="label" style={{ color: 'var(--text-primary)' }}>
                Bet Amount
              </label>
              <div className="input-container">
                <DollarSign className="input-icon" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="bet-input"
                  style={{
                    background: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                  placeholder="Enter amount..."
                />
              </div>
              <div className="input-footer">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Available: ${balance.toFixed(2)}
                </p>
                <button
                  onClick={() => setBetAmount(balance.toString())}
                  className="max-button"
                  style={{ color: 'var(--accent-purple)' }}
                >
                  Max
                </button>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="quick-select-container">
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                Quick Select
              </p>
              <div className="quick-select-grid">
                {quickAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount.toString())}
                    className={`quick-select-button ${
                      betAmount === amount.toString() 
                        ? (direction === 'UP' ? 'up-active' : 'down-active')
                        : ''
                    }`}
                    style={{
                      background: betAmount === amount.toString() ? undefined : 'var(--bg-tertiary)',
                      borderColor: betAmount === amount.toString() ? undefined : 'var(--border-color)',
                      color: betAmount === amount.toString() ? undefined : 'var(--text-secondary)'
                    }}
                  >
                    ${amount}
                  </button>
                ))}
              </div>
            </div>

            {/* Potential Win Calculator */}
            {betAmount && parseFloat(betAmount) > 0 && (
              <div 
                className="payout-card"
                style={{ 
                  background: 'var(--bg-tertiary)', 
                  borderColor: 'var(--border-color)' 
                }}
              >
                <div className="payout-header">
                  <Calculator className="w-5 h-5" style={{ color: 'var(--accent-purple)' }} />
                  <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Potential Payout
                  </h3>
                </div>
                <div className="payout-grid">
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>Your Share</p>
                    <p className="font-bold" style={{ color: 'var(--text-primary)' }}>
                      {userPercentage.toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p style={{ color: 'var(--text-secondary)' }}>Potential Win</p>
                    <p className={`font-bold ${direction === 'UP' ? 'up-text' : 'down-text'}`}>
                      ${potentialWin.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                onClick={onClose}
                className="cancel-button"
                style={{
                  color: 'var(--text-secondary)',
                  borderColor: 'var(--border-color)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isConfirming || !betAmount || parseFloat(betAmount) <= 0}
                className={`confirm-button ${direction === 'UP' ? 'confirm-up-bg' : 'confirm-down-bg'}`}
              >
                {isConfirming ? 'Confirming...' : `Confirm ${direction} Bet`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BettingModal;
