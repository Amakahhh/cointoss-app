import React, { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Wallet, TrendingUp } from "lucide-react";
import useStore from "../store/useStore";
import DepositModal from "../components/DepositModal";
import WithdrawModal from "../components/WithdrawModal";

const WalletComponent = () => {
  const { isAuthenticated, user, balance, transactions, deposit, withdraw } = useStore();
  const [currency, setCurrency] = useState('USDT');
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  
  // Exchange rates (simulated for demonstration)
  const exchangeRates = {
    'USDT': 1,
    'USD': 1,
    'EUR': 0.92,
    'NGN': 1500,
  };

  // Apply light theme on mount (theme toggle hidden)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Update balance when currency changes
    const baseBalanceUSDT = balance;
    const newBalance = baseBalanceUSDT * exchangeRates[currency];
    setDisplayBalance(newBalance);
  }, [currency, balance]);

  // Convert store transactions to display format
  const displayTransactions = React.useMemo(() => {
    return transactions.map(t => ({
      type: t.type === 'BET' ? 'Bet' : t.type === 'WIN' ? 'Winning' : t.type,
      time: new Date(t.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      }),
      amount: t.amount,
      status: t.status || 'Completed'
    }));
  }, [transactions]);

  const handleDeposit = (amount) => {
    deposit(amount);
  };

  const handleWithdraw = (amount) => {
    try {
      withdraw(amount);
    } catch (error) {
      throw error; // Re-throw to be handled by the modal
    }
  };

  const getCurrencySymbol = (code) => {
    switch (code) {
      case 'USDT':
        return '₮';
      case 'EUR':
        return '€';
      case 'NGN':
        return '₦';
      default:
        return '$';
    }
  };

  return (
    <div className="wallet-container">
      <style>
        {`
        /* Default Dark Theme Variables */
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
        
        /* Light Theme Override */
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
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          transition: all 0.3s ease;
          background: var(--bg-primary);
          color: var(--text-primary);
        }

        .wallet-container {
          min-height: 100vh;
          background: var(--bg-primary);
          transition: background 0.3s ease-in-out;
        }

        .wallet-content {
          max-width: 960px;
          margin: 0 auto;
          padding: 3rem 1.5rem;
        }

        .wallet-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2.5rem;
        }

        .wallet-title {
          font-size: 1.875rem;
          line-height: 2.25rem;
          font-weight: bold;
          color: var(--text-primary);
          margin: 0;
        }

        .balance-card {
          border-radius: 1.5rem;
          padding: 2.5rem;
          box-shadow: 0 8px 32px var(--shadow);
          margin-bottom: 2rem;
          background: linear-gradient(135deg, var(--accent-blue), var(--accent-purple));
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .balance-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .balance-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
        }

        .balance-label span {
          font-weight: 500;
          font-size: 1.125rem;
          opacity: 0.8;
        }

        .currency-select {
          font-size: 0.875rem;
          background-color: transparent;
          border: none;
          color: white;
          cursor: pointer;
          outline: none;
          opacity: 0.8;
          border-radius: 0.5rem;
          padding: 0.25rem 0.5rem;
        }

        .currency-select option {
          color: var(--text-primary);
          background: var(--card-bg);
        }

        .balance-amount {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .balance-amount span {
          font-size: 3rem;
          font-weight: 800;
          color: white;
        }

        .balance-growth {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .balance-growth span {
          font-size: 0.875rem;
          color: #86EFAC;
          font-weight: 600;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem;
          background: var(--card-bg);
          border-radius: 0.75rem;
          border: 1px solid var(--glass-border);
          box-shadow: 0 8px 32px var(--shadow);
          transition: all 0.3s ease-in-out;
          cursor: pointer;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .action-button:hover {
          transform: scale(1.05);
          box-shadow: 0 12px 48px var(--shadow);
          background: var(--hover-bg);
        }

        .action-button span {
          font-weight: 600;
          font-size: 1rem;
          color: var(--text-primary);
        }

        .transactions-card {
          border-radius: 0.75rem;
          background: var(--card-bg);
          box-shadow: 0 8px 32px var(--shadow);
          border: 1px solid var(--glass-border);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        .transactions-header {
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid var(--border-color);
        }

        .transactions-title {
          font-weight: 600;
          font-size: 1.25rem;
          color: var(--text-primary);
          margin: 0;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .filter-button {
          font-size: 0.875rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          color: var(--text-secondary);
          font-weight: 400;
          border: none;
          outline: none;
          cursor: pointer;
          background-color: transparent;
          transition: all 0.2s ease;
        }

        .filter-button.active {
          font-weight: 600;
          border: 2px solid var(--border-color);
          color: var(--text-primary);
          background: var(--bg-tertiary);
        }

        .filter-button:hover {
          background: var(--hover-bg);
          color: var(--text-primary);
        }

        .transaction-item {
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
          transition: background-color 0.2s ease-in-out;
        }

        .transaction-item:last-child {
          border-bottom: none;
        }

        .transaction-item:hover {
          background: var(--hover-bg);
        }

        .transaction-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .transaction-icon {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .transaction-icon.withdrawal {
          background: rgba(239, 68, 68, 0.1);
          color: var(--accent-red);
        }

        .transaction-icon.deposit {
          background: rgba(34, 197, 94, 0.1);
          color: var(--accent-green);
        }

        .transaction-details h4 {
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .transaction-details p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        .transaction-right {
          text-align: right;
        }

        .transaction-amount {
          font-weight: 600;
          font-size: 1.25rem;
          margin: 0;
        }

        .transaction-amount.positive {
          color: var(--accent-green);
        }

        .transaction-amount.negative {
          color: var(--accent-red);
        }

        .transaction-status {
          font-size: 0.75rem;
          font-weight: 500;
          margin: 0;
        }

        .transaction-status.completed {
          color: var(--accent-green);
        }

        .transaction-status.pending {
          color: var(--accent-gold);
        }

        .transaction-status.canceled {
          color: var(--accent-red);
        }
        `}
      </style>

      <div className="wallet-content">
        {/* Header */}
        <div className="wallet-header">
          <h1 className="wallet-title">Wallet</h1>
        </div>

        {/* Balance Card with a modern gradient */}
        <div className="balance-card">
          <div className="balance-header">
            <div className="balance-label">
              <Wallet size={24} style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
              <span>Total Balance</span>
            </div>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="currency-select"
            >
              <option value="USDT">USDT</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="NGN">NGN</option>
            </select>
          </div>
          <div className="balance-amount">
            <span>
              {getCurrencySymbol(currency)}{displayBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="balance-growth">
            <TrendingUp size={18} style={{ color: '#86EFAC' }} />
            <span>Real-time balance</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="action-button" onClick={() => setShowDepositModal(true)}>
            <ArrowUp style={{ width: '1.5rem', height: '1.5rem', color: 'var(--accent-green)' }} />
            <span>Deposit</span>
          </button>
          <button className="action-button" onClick={() => setShowWithdrawModal(true)}>
            <ArrowDown style={{ width: '1.5rem', height: '1.5rem', color: 'var(--accent-red)' }} />
            <span>Withdrawal</span>
          </button>
        </div>

        {/* Transactions Section */}
        <div className="transactions-card">
          <div className="transactions-header">
            <h3 className="transactions-title">Recent Transactions</h3>
            <div className="filter-buttons">
              <button className="filter-button active">Today</button>
              <button className="filter-button">This Week</button>
              <button className="filter-button">This Month</button>
            </div>
          </div>
          <div>
            {displayTransactions.map((transaction, index) => (
              <div key={index} className="transaction-item">
                <div className="transaction-left">
                  <div className={`transaction-icon ${transaction.amount < 0 ? 'withdrawal' : 'deposit'}`}>
                    {transaction.amount < 0 ? <ArrowDown size={20} /> : <ArrowUp size={20} />}
                  </div>
                  <div className="transaction-details">
                    <h4>{transaction.type}</h4>
                    <p>{transaction.time}</p>
                  </div>
                </div>
                <div className="transaction-right">
                  <p className={`transaction-amount ${transaction.amount > 0 ? 'positive' : 'negative'}`}>
                    {transaction.amount > 0 ? '+' : ''}
                    {getCurrencySymbol(currency)}
                    {Math.abs(transaction.amount * exchangeRates[currency]).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className={`transaction-status ${transaction.status.toLowerCase()}`}>
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        onDeposit={handleDeposit}
      />
      
      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onWithdraw={handleWithdraw}
        currentBalance={balance}
      />
    </div>
  );
};

export default WalletComponent;