import React, { useState } from 'react';
import { X, DollarSign, ArrowUpRight, Wallet, AlertTriangle } from 'lucide-react';

const WithdrawModal = ({ isOpen, onClose, onWithdraw, currentBalance }) => {
  const [amount, setAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const withdrawAmount = parseFloat(amount);
    
    if (!withdrawAmount || withdrawAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (withdrawAmount < 20) {
      alert('Minimum withdrawal is $20 USDT');
      return;
    }

    if (withdrawAmount > currentBalance) {
      alert('Insufficient funds');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onWithdraw(withdrawAmount);
      setAmount('');
      onClose();
      
      // Show success message
      alert(`Successfully withdrew $${withdrawAmount} USDT. Funds will arrive in 1-3 business days.`);
    } catch (error) {
      alert(error.message || 'Withdrawal failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const maxWithdraw = Math.floor(currentBalance * 100) / 100; // Round down to 2 decimals

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content withdraw-modal">
        <div className="modal-header">
          <h2>
            <ArrowUpRight className="modal-icon" />
            Withdraw Funds
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="balance-info">
          <span>Available Balance</span>
          <span className="balance-amount">${currentBalance.toFixed(2)} USDT</span>
        </div>

        <form onSubmit={handleSubmit} className="withdraw-form">
          <div className="form-group">
            <label>Withdrawal Method</label>
            <div className="payment-methods">
              <button
                type="button"
                className={`payment-method ${withdrawMethod === 'bank' ? 'active' : ''}`}
                onClick={() => setWithdrawMethod('bank')}
              >
                <Wallet size={20} />
                Bank Transfer
              </button>
              <button
                type="button"
                className={`payment-method ${withdrawMethod === 'crypto' ? 'active' : ''}`}
                onClick={() => setWithdrawMethod('crypto')}
              >
                <DollarSign size={20} />
                Crypto Wallet
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Amount (USDT)</label>
            <div className="amount-input">
              <DollarSign size={20} className="input-icon" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="20"
                max={maxWithdraw}
                step="0.01"
                required
              />
            </div>
            <small>Minimum withdrawal: $20 USDT • Maximum: ${maxWithdraw} USDT</small>
          </div>

          <div className="quick-amounts">
            <span>Quick amounts:</span>
            <div className="amount-buttons">
              {[50, 100, 250, maxWithdraw].filter(val => val <= maxWithdraw && val >= 20).map(val => (
                <button
                  key={val}
                  type="button"
                  className="quick-amount"
                  onClick={() => setAmount(val === maxWithdraw ? maxWithdraw.toString() : val.toString())}
                >
                  {val === maxWithdraw ? 'Max' : `$${val}`}
                </button>
              ))}
            </div>
          </div>

          <div className="warning-box">
            <AlertTriangle size={20} />
            <div>
              <strong>Processing Time:</strong>
              <p>Bank transfers: 1-3 business days<br />
              Crypto transfers: 10-30 minutes</p>
            </div>
          </div>

          <button
            type="submit"
            className="withdraw-btn"
            disabled={isLoading || !amount || parseFloat(amount) > currentBalance}
          >
            {isLoading ? (
              <div className="loading-spinner">Processing...</div>
            ) : (
              <>
                <ArrowUpRight size={20} />
                Withdraw ${amount || '0'} USDT
              </>
            )}
          </button>
        </form>

        <div className="security-note">
          <span>🔒 All withdrawals are verified with multi-factor authentication</span>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(10px);
        }

        .modal-content {
          background: var(--card-bg);
          border-radius: 20px;
          padding: 2rem;
          width: 90%;
          max-width: 500px;
          border: 1px solid var(--glass-border);
          box-shadow: 0 20px 40px var(--shadow);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .modal-header h2 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          color: var(--text-primary);
          font-size: 1.5rem;
        }

        .modal-icon {
          color: var(--accent-blue);
        }

        .close-btn {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          color: var(--text-primary);
          background: var(--hover-bg);
        }

        .balance-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: var(--bg-tertiary);
          border-radius: 12px;
          margin-bottom: 1.5rem;
          border: 1px solid var(--border-color);
        }

        .balance-info span:first-child {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .balance-amount {
          color: var(--accent-green);
          font-size: 1.2rem;
          font-weight: 700;
        }

        .withdraw-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: var(--text-primary);
          font-weight: 600;
          font-size: 0.9rem;
        }

        .payment-methods {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .payment-method {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          border: 2px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .payment-method:hover {
          border-color: var(--accent-blue);
          color: var(--text-primary);
        }

        .payment-method.active {
          border-color: var(--accent-blue);
          background: rgba(59, 130, 246, 0.1);
          color: var(--accent-blue);
        }

        .amount-input {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-secondary);
          z-index: 1;
        }

        .amount-input input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid var(--border-color);
          border-radius: 12px;
          background: var(--bg-tertiary);
          color: var(--text-primary);
          font-size: 1.1rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .amount-input input:focus {
          outline: none;
          border-color: var(--accent-blue);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group small {
          color: var(--text-secondary);
          font-size: 0.8rem;
        }

        .quick-amounts {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .quick-amounts > span {
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .amount-buttons {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
        }

        .quick-amount {
          padding: 0.75rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-tertiary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .quick-amount:hover {
          border-color: var(--accent-blue);
          color: var(--accent-blue);
          background: rgba(59, 130, 246, 0.05);
        }

        .warning-box {
          display: flex;
          gap: 0.75rem;
          padding: 1rem;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 8px;
          color: var(--accent-gold);
        }

        .warning-box strong {
          color: var(--text-primary);
        }

        .warning-box p {
          margin: 0.25rem 0 0 0;
          font-size: 0.85rem;
          color: var(--text-secondary);
          line-height: 1.4;
        }

        .withdraw-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, var(--accent-blue), #2563eb);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 0.5rem;
        }

        .withdraw-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }

        .withdraw-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .security-note {
          text-align: center;
          margin-top: 1.5rem;
          color: var(--text-secondary);
          font-size: 0.8rem;
          padding: 1rem;
          background: var(--bg-tertiary);
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }
      `}</style>
    </div>
  );
};

export default WithdrawModal;