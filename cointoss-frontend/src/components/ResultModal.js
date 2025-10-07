import React, { useEffect, useState } from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, Trophy, AlertCircle } from 'lucide-react';

const ResultModal = ({ isOpen, onClose, result, winnings, betAmount, direction }) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Auto close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isWin = result === direction;
  const isLoss = !isWin && result !== null;

  return (
    <>
      <style>
        {`
          /* === Theme Variables === */
          :root {
            /* Light theme colors */
            --bg-primary: #f3f4f6;
            --bg-secondary: #ffffff;
            --bg-tertiary: #f9fafb;
            --text-primary: #1f2937;
            --text-secondary: #6b7280;
            --border-color: #e5e7eb;
            --accent-purple: #8b5cf6;
            --accent-green: #22c55e;
            --accent-red: #ef4444;
            --accent-blue: #3b82f6;
            --shadow: rgba(0, 0, 0, 0.05);
          }
          
          body[data-theme="dark"] {
            /* Dark theme colors */
            --bg-primary: #0f172a;
            --bg-secondary: #1e293b;
            --bg-tertiary: #334155;
            --text-primary: #f8fafc;
            --text-secondary: #94a3b8;
            --border-color: #334155;
            --shadow: rgba(0, 0, 0, 0.3);
          }

          /* === Modal Styles === */
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 50;
            padding: 1rem;
            opacity: 0;
            transform: scale(0.95);
            transition: opacity 0.3s ease, transform 0.3s ease;
          }

          .modal-overlay.show {
            opacity: 1;
            transform: scale(1);
          }

          .modal-card {
            background-color: var(--bg-secondary);
            border-radius: 1.5rem;
            border: 1px solid var(--border-color);
            box-shadow: 0 8px 32px var(--shadow);
            max-width: 28rem;
            width: 100%;
            position: relative;
            transform: translateY(-20px);
            transition: transform 0.3s ease, opacity 0.3s ease;
          }

          .modal-overlay.show .modal-card {
            transform: translateY(0);
          }
          
          .modal-close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            color: var(--text-secondary);
            transition: color 0.2s ease;
            padding: 0.25rem;
            cursor: pointer;
          }
          
          .modal-close-btn:hover {
            color: var(--text-primary);
          }
          
          .modal-header {
            padding: 1.5rem;
            border-bottom: 1px solid var(--border-color);
            text-align: center;
          }

          .icon-container {
            width: 4rem;
            height: 4rem;
            margin: 0 auto 1rem;
            border-radius: 9999px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .icon-container.win { background-color: rgba(34, 197, 94, 0.1); }
          .icon-container.loss { background-color: rgba(239, 68, 68, 0.1); }
          .icon-container.neutral { background-color: rgba(255, 193, 7, 0.1); }

          .icon-container.win svg { color: var(--accent-green); }
          .icon-container.loss svg { color: var(--accent-red); }
          .icon-container.neutral svg { color: #FFC107; }

          .modal-title {
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
          }
          
          .modal-title.win { color: var(--accent-green); }
          .modal-title.loss { color: var(--accent-red); }
          .modal-title.neutral { color: #FFC107; }

          .modal-subtitle {
            color: var(--text-secondary);
          }

          .modal-details {
            padding: 1.5rem;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }

          .details-card {
            background-color: rgba(107, 114, 128, 0.1);
            border-radius: 0.75rem;
            padding: 1rem;
          }

          .details-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 0.875rem;
          }

          .details-item:not(:last-child) {
            margin-bottom: 0.75rem;
          }
          
          .details-label {
            color: var(--text-secondary);
          }
          
          .details-value {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: bold;
          }

          .details-value svg {
            width: 1rem;
            height: 1rem;
          }

          .details-value.up svg { color: var(--accent-green); }
          .details-value.down svg { color: var(--accent-red); }
          .details-value.up span { color: var(--accent-green); }
          .details-value.down span { color: var(--accent-red); }
          
          .details-card .details-item.bordered {
            border-top: 1px solid var(--border-color);
            padding-top: 0.5rem;
            margin-top: 0.5rem;
          }
          
          .result-card {
            border-radius: 0.75rem;
            padding: 1rem;
            text-align: center;
            border: 1px solid;
          }

          .result-card.win { background-color: rgba(34, 197, 94, 0.1); border-color: rgba(34, 197, 94, 0.2); }
          .result-card.loss { background-color: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); }
          .result-card.neutral { background-color: rgba(255, 193, 7, 0.1); border-color: rgba(255, 193, 7, 0.2); }

          .result-label {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            margin-bottom: 0.5rem;
            color: var(--text-secondary);
            font-weight: 500;
          }

          .result-value {
            font-size: 1.875rem;
            font-weight: bold;
          }

          .result-value.win { color: var(--accent-green); }
          .result-value.loss { color: var(--accent-red); }
          .result-value.neutral { color: #FFC107; }

          .result-message {
            font-size: 0.875rem;
            margin-top: 0.5rem;
          }

          .result-message.win { color: var(--accent-green); }
          .result-message.loss { color: var(--accent-red); }
          .result-message.neutral { color: #FFC107; }

          .modal-actions {
            padding: 1.5rem;
            display: flex;
            gap: 0.75rem;
          }

          .modal-btn {
            flex: 1;
            padding: 0.75rem;
            border-radius: 0.5rem;
            font-weight: 500;
            transition: background-color 0.2s ease, transform 0.2s ease;
            cursor: pointer;
            text-align: center;
          }

          .btn-secondary {
            background-color: var(--bg-tertiary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
          }
          .btn-secondary:hover {
            background-color: var(--border-color);
            transform: translateY(-2px);
          }

          .btn-primary {
            background-color: var(--accent-blue);
            color: white;
            border: none;
          }
          .btn-primary:hover {
            background-color: #2563eb;
            transform: translateY(-2px);
          }

          .modal-footer {
            padding: 0 1.5rem 1rem;
            text-align: center;
            font-size: 0.75rem;
            color: var(--text-secondary);
          }
        `}
      </style>
      <div className={`modal-overlay ${isAnimating ? 'show' : ''}`}>
        <div className="modal-card">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="modal-close-btn"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Result Header */}
          <div className="modal-header">
            <div className={`icon-container ${
              isWin ? 'win' : isLoss ? 'loss' : 'neutral'
            }`}>
              {isWin ? (
                <Trophy className="w-8 h-8" />
              ) : isLoss ? (
                <AlertCircle className="w-8 h-8" />
              ) : (
                <DollarSign className="w-8 h-8" />
              )}
            </div>
            
            <h2 className={`modal-title ${
              isWin ? 'win' : isLoss ? 'loss' : 'neutral'
            }`}>
              {isWin ? '🎉 CONGRATULATIONS! 🎉' : isLoss ? '😔 Oh No!' : 'Round Complete!'}
            </h2>
            
            <p className="modal-subtitle">
              {isWin ? 'Amazing! You predicted correctly and won!' : isLoss ? 'Don\'t worry, every trader has losses. Try again!' : 'Round has ended.'}
            </p>
          </div>          {/* Result Details */}
          <div className="modal-details">
            <div className="details-card">
              <div className="space-y-3 text-sm">
                <div className="details-item">
                  <span className="details-label">Your Prediction:</span>
                  <div className={`details-value ${direction === 'UP' ? 'up' : 'down'}`}>
                    {direction === 'UP' ? (
                      <TrendingUp />
                    ) : (
                      <TrendingDown />
                    )}
                    <span>{direction}</span>
                  </div>
                </div>
                
                <div className="details-item">
                  <span className="details-label">Actual Result:</span>
                  <div className={`details-value ${result === 'UP' ? 'up' : 'down'}`}>
                    {result === 'UP' ? (
                      <TrendingUp />
                    ) : (
                      <TrendingDown />
                    )}
                    <span>{result}</span>
                  </div>
              </div>
              
              <div className="details-item bordered">
                <span className="details-label">Bet Amount:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>${betAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            </div>

            {/* Winnings/Loss */}
            <div className={`result-card ${
              isWin ? 'win' : isLoss ? 'loss' : 'neutral'
            }`}>
              <div className="result-label">
                <DollarSign style={{ width: '1.25rem', height: '1.25rem' }} />
                <span>Result:</span>
              </div>
              <div className={`result-value ${
                isWin ? 'win' : isLoss ? 'loss' : 'neutral'
              }`}>
                {isWin ? `+$${winnings?.toFixed(2) || '0.00'}` : 
                 isLoss ? `-$${betAmount?.toFixed(2) || '0.00'}` : 
                 'No Change'}
              </div>
              {isWin && (
                <p className="result-message win">
                                    💰 Money added to your wallet! Well done!
                </p>
              )}
              {isLoss && (
                <p className="result-message loss">
                                    💸 Better luck next time, trader!
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="modal-actions">
            <button
              onClick={onClose}
              className="modal-btn btn-secondary"
            >
              {isWin ? '🎉 Celebrate!' : isLoss ? '😊 Close' : 'Close'}
            </button>
            <button
              onClick={() => {
                onClose();
                // Navigate to betting page
                window.location.href = '/betting';
              }}
              className="modal-btn btn-primary"
            >
              {isWin ? '🚀 Bet Again!' : isLoss ? '💪 Try Again!' : 'Try Again'}
            </button>
          </div>          {/* Auto-close indicator */}
          <div className="modal-footer">
            <div>
              This modal will auto-close in 5 seconds
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultModal;
