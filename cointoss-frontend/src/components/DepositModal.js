import React, { useState } from 'react';
import { X, DollarSign, CreditCard, Wallet } from 'lucide-react';

const DepositModal = ({ isOpen, onClose, onDeposit }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const depositAmount = parseFloat(amount);
    
    if (!depositAmount || depositAmount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (depositAmount < 10) {
      alert('Minimum deposit is $10 USDT');
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onDeposit(depositAmount);
      setAmount('');
      onClose();
      
      // Show success message
      alert(`Successfully deposited $${depositAmount} USDT to your wallet!`);
    } catch (error) {
      alert('Deposit failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content deposit-modal">
        <div className="modal-header">
          <h2>
            <CreditCard className="modal-icon" />
            Deposit Funds
          </h2>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="deposit-form">
          <div className="form-group">
            <label>Payment Method</label>
            <div className="payment-methods">
              <button
                type="button"
                className={`payment-method ${paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard size={20} />
                Credit/Debit Card
              </button>
              <button
                type="button"
                className={`payment-method ${paymentMethod === 'crypto' ? 'active' : ''}`}
                onClick={() => setPaymentMethod('crypto')}
              >
                <Wallet size={20} />
                Crypto Transfer
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
                min="10"
                step="0.01"
                required
              />
            </div>
            <small>Minimum deposit: $10 USDT</small>
          </div>

          <div className="quick-amounts">
            <span>Quick amounts:</span>
            <div className="amount-buttons">
              {[50, 100, 500, 1000].map(val => (
                <button
                  key={val}
                  type="button"
                  className="quick-amount"
                  onClick={() => setAmount(val.toString())}
                >
                  ${val}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="deposit-btn"
            disabled={isLoading || !amount}
          >
            {isLoading ? (
              <div className="loading-spinner">Processing...</div>
            ) : (
              <>
                <CreditCard size={20} />
                Deposit ${amount || '0'} USDT
              </>
            )}
          </button>
        </form>

        <div className="security-note">
          <span>🔒 Secure payment processing with 256-bit SSL encryption</span>
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
          margin-bottom: 2rem;
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
          color: var(--accent-green);
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

        .deposit-form {
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
          border-color: var(--accent-green);
          color: var(--text-primary);
        }

        .payment-method.active {
          border-color: var(--accent-green);
          background: rgba(34, 197, 94, 0.1);
          color: var(--accent-green);
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
          border-color: var(--accent-green);
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
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
          border-color: var(--accent-green);
          color: var(--accent-green);
          background: rgba(34, 197, 94, 0.05);
        }

        .deposit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, var(--accent-green), #16a34a);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 0.5rem;
        }

        .deposit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(34, 197, 94, 0.3);
        }

        .deposit-btn:disabled {
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

export default DepositModal;