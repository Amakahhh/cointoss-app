import React, { useEffect, useState } from 'react';
import { User, Mail, Wallet, Calendar, TrendingUp, TrendingDown, BarChart3, Settings, Edit3, Shield, Award, Target, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { userAPI } from '../services/api';

const Profile = () => {
  const { user, isAuthenticated, logout, currentBets, transactions, balance, getActiveBets, getPayoutMultipliers } = useStore();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('recent'); // 'recent' or 'active'
  const [editData, setEditData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Apply light theme on mount (theme toggle hidden)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  // Initialize edit data when user data is available
  useEffect(() => {
    if (user) {
      setEditData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      // Update username if changed
      if (editData.firstName !== user.firstName || editData.lastName !== user.lastName) {
        await userAPI.updateUsername(user.id, editData.firstName, editData.lastName);
      }
      
      // Update email if changed
      if (editData.email !== user.email) {
        await userAPI.updateEmail(user.id, editData.email);
      }
      
      // Update local user data
      const updatedUser = {
        ...user,
        firstName: editData.firstName,
        lastName: editData.lastName,
        email: editData.email
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      window.location.reload(); // Refresh to update the UI
      
    } catch (error) {
      console.error('Update error:', error);
      setError(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || ''
    });
    setIsEditing(false);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!user) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh',
        color: 'var(--text-primary)'
      }}>
        Loading...
      </div>
    );
  }

  // Calculate performance data from real transactions
  const performanceData = React.useMemo(() => {
    const grouped = {};
    transactions.forEach(t => {
      if (t.type === 'BET' || t.type === 'WIN') {
        const day = new Date(t.timestamp).toISOString().slice(0,10);
        if (!grouped[day]) grouped[day] = { date: day, bets: 0, wins: 0, amount: 0, profit: 0 };
        if (t.type === 'BET') {
          grouped[day].bets += 1;
          grouped[day].amount += Math.abs(t.amount);
          grouped[day].profit -= Math.abs(t.amount);
        }
        if (t.type === 'WIN') {
          grouped[day].wins += 1;
          grouped[day].profit += t.amount;
        }
      }
    });
    return Object.values(grouped).sort((a,b) => new Date(b.date) - new Date(a.date));
  }, [transactions]);

  const store = useStore();

  // Get recent bets from currentBets
  const recentBets = React.useMemo(() => {
    return currentBets.slice(0, 4).map(bet => ({
      id: bet.id,
      direction: bet.direction,
      amount: bet.amount,
      result: bet.result || 'pending',
      profit: bet.profit || 0,
      time: bet.timestamp ? new Date(bet.timestamp).toLocaleString() : 'Recently'
    }));
  }, [currentBets]);

  // Get pending bets 
  const pendingBets = React.useMemo(() => {
    return getActiveBets().map(bet => ({
      id: bet.id,
      direction: bet.direction,
      amount: bet.amount,
      multiplier: bet.direction === 'UP' ? getPayoutMultipliers().up : getPayoutMultipliers().down,
      potentialWin: bet.amount * (bet.direction === 'UP' ? getPayoutMultipliers().up : getPayoutMultipliers().down),
      time: bet.timestamp ? new Date(bet.timestamp).toLocaleString() : 'Recently'
    }));
  }, [currentBets, getActiveBets, getPayoutMultipliers]);

  // Calculate real stats from user data
  const userStats = React.useMemo(() => {
    const totalBets = currentBets.length;
    const wonBets = currentBets.filter(bet => bet.result === 'win').length;
    const winRate = totalBets > 0 ? Math.round((wonBets / totalBets) * 100) : 0;
    const totalWinnings = currentBets.reduce((sum, bet) => sum + (bet.profit || 0), 0);
    
    return {
      totalBets,
      winRate,
      totalWinnings
    };
  }, [currentBets]);

  const quickActions = [
    { icon: Wallet, label: 'Wallet', action: 'wallet' },
    { icon: BarChart3, label: 'History', action: 'history' },
    { icon: Settings, label: 'Settings', action: 'settings' },
    { icon: Coins, label: 'Bet', action: 'bet' },
  ];

  const handleQuickAction = (action) => {
    switch (action) {
      case 'wallet':
        navigate('/wallet');
        break;
      case 'history':
        navigate('/history');
        break;
      case 'settings':
        // For now, just show a message since we don't have a settings page
        alert('Settings page coming soon!');
        break;
      case 'bet':
        navigate('/betting');
        break;
      default:
        console.log(`Quick action: ${action}`);
    }
  };

  return (
    <div className="app-container">
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
        }

        body {
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          transition: all 0.3s ease;
          background: var(--bg-primary);
          color: var(--text-primary);
          min-height: 100vh;
        }

        .app-container {
          min-height: 100vh;
          background: var(--bg-primary);
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }
        
        .header {
          padding: 2rem 1rem;
          background: var(--glass-bg);
          border-bottom: 1px solid var(--border-color);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          max-width: 1280px;
          margin: 0 auto;
        }

        .edit-button, .theme-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border-color);
          background: var(--card-bg);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .theme-toggle {
          padding: 0.75rem;
          border-radius: 50%;
        }

        .edit-button:hover, .theme-toggle:hover {
          transform: scale(1.05);
          border-color: var(--accent-purple);
          color: var(--accent-purple);
          background: var(--bg-tertiary);
          box-shadow: 0 4px 20px var(--shadow);
        }
        
        .grid-container {
          display: grid;
          gap: 2rem;
        }

        @media (min-width: 1024px) {
          .grid-container {
            grid-template-columns: 1fr 2fr;
          }
        }

        .card {
          border-radius: 1.5rem;
          padding: 2rem;
          border: 1px solid var(--glass-border);
          background: var(--card-bg);
          box-shadow: 0 8px 32px var(--shadow);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: all 0.3s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 48px var(--shadow);
        }
        
        .stat-card {
          border-radius: 1.5rem;
          padding: 1.5rem;
          border: 1px solid var(--glass-border);
          background: var(--card-bg);
          box-shadow: 0 8px 32px var(--shadow);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 48px var(--shadow);
        }

        .stat-grid {
          display: grid;
          gap: 1rem;
        }
        
        @media (min-width: 768px) {
          .stat-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        
        .list-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-radius: 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          transition: all 0.2s ease-in-out;
        }

        .list-item:hover {
          background: var(--glass-bg);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px var(--shadow);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .avatar-gradient {
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue));
        }

        .icon-circle-up {
          background: rgba(34, 197, 94, 0.1);
          color: var(--accent-green);
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-circle-down {
          background: rgba(239, 68, 68, 0.1);
          color: var(--accent-red);
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }

        .quick-action-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border-color);
          background: var(--bg-tertiary);
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        
        .quick-action-button:hover {
          transform: translateY(-2px);
          border-color: var(--accent-purple);
          color: var(--accent-purple);
          box-shadow: 0 4px 15px var(--shadow);
          background: var(--card-bg);
        }

        .quick-action-button:hover span {
          color: var(--accent-purple);
        }

        .profit-positive {
          color: var(--accent-green);
        }

        .profit-negative {
          color: var(--accent-red);
        }

        /* Tab Styles */
        .tab-container {
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 1.5rem;
        }

        .tab-buttons {
          display: flex;
          gap: 0;
        }

        .tab-button {
          background: none;
          border: none;
          padding: 1rem 1.5rem;
          color: var(--text-secondary);
          font-weight: 500;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.3s ease;
          position: relative;
        }

        .tab-button:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.02);
        }

        .tab-button.active {
          color: var(--accent-purple);
          border-bottom-color: var(--accent-purple);
        }

        .pending-bet-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-radius: 0.75rem;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          transition: all 0.2s ease-in-out;
          margin-bottom: 0.75rem;
        }

        .pending-bet-item:hover {
          background: var(--glass-bg);
          transform: translateY(-2px);
          box-shadow: 0 4px 15px var(--shadow);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        .pending-bet-item.up {
          border-left: 3px solid var(--accent-green);
        }

        .pending-bet-item.down {
          border-left: 3px solid var(--accent-red);
        }

        .pending-bet-multiplier {
          background: linear-gradient(135deg, var(--accent-gold), #f59e0b);
          color: #1a1a1a;
          padding: 0.25rem 0.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .pending-bet-win {
          color: var(--accent-green);
          font-weight: 600;
        }
        `}
      </style>

      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
              User Profile
            </h1>
            <p style={{ fontSize: '1.125rem', color: 'var(--text-secondary)' }}>
              Manage your account and view performance
            </p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {isEditing ? (
              <>
                <button 
                  className="edit-button" 
                  onClick={handleSave}
                  disabled={isLoading}
                  style={{ 
                    background: 'var(--accent-green)',
                    color: 'white',
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
                <button 
                  className="edit-button" 
                  onClick={handleCancel}
                  disabled={isLoading}
                  style={{ 
                    background: 'var(--accent-red)',
                    color: 'white',
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button className="edit-button" onClick={handleEdit}>
                <Edit3 style={{ width: '1rem', height: '1rem' }} />
                Edit Profile
              </button>
            )}
            {/* Theme toggle button hidden as requested */}
          </div>
        </div>
      </div>

      <div className="container">
        {/* Error Message */}
        {error && (
          <div style={{
            background: '#FEF2F2',
            border: '1px solid #FECACA',
            color: '#DC2626',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            marginBottom: '1rem',
            fontSize: '0.875rem',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
          }}>
            {error}
          </div>
        )}

        <div className="grid-container">
          {/* Left Column - Profile Info & Quick Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Profile Card */}
            <div className="card">
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div className="avatar-gradient" style={{ 
                  width: '6rem', 
                  height: '6rem', 
                  margin: '0 auto 1rem auto', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <User style={{ width: '3rem', height: '3rem', color: 'white' }} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.25rem', color: 'var(--text-primary)' }}>
                  {isEditing ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        name="firstName"
                        value={editData.firstName}
                        onChange={handleChange}
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '0.375rem',
                          padding: '0.5rem',
                          color: 'var(--text-primary)',
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          width: '120px'
                        }}
                        placeholder="First Name"
                      />
                      <input
                        type="text"
                        name="lastName"
                        value={editData.lastName}
                        onChange={handleChange}
                        style={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: '0.375rem',
                          padding: '0.5rem',
                          color: 'var(--text-primary)',
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          width: '120px'
                        }}
                        placeholder="Last Name"
                      />
                    </div>
                  ) : (
                    `${user.firstName} ${user.lastName}`
                  )}
                </h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  {user.level || 'Beginner'}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                  <Award style={{ width: '1rem', height: '1rem', color: 'var(--accent-gold)' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Level 5 Trader
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Mail style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent-purple)' }} />
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={editData.email}
                      onChange={handleChange}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '0.375rem',
                        padding: '0.5rem',
                        color: 'var(--text-primary)',
                        fontSize: '0.875rem',
                        flex: 1
                      }}
                      placeholder="Email"
                    />
                  ) : (
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {user.email}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Calendar style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent-purple)' }} />
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Joined {user.signUpDate ? new Date(user.signUpDate).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Wallet style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent-purple)' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                    ${(user.balance || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Quick Actions
              </h3>
              <div className="quick-actions-grid">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action.action)}
                    className="quick-action-button"
                  >
                    <action.icon style={{ width: '1.5rem', height: '1.5rem', marginBottom: '0.25rem' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <div className="card">
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
                onMouseOver={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <Shield style={{ width: '1rem', height: '1rem' }} />
                Logout
              </button>
            </div>
          </div>

          {/* Right Column - Performance & History */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Stats Cards */}
            <div className="stat-grid">
              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Target style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent-green)' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                    Total Bets
                  </span>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {userStats.totalBets}
                </p>
              </div>
              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <TrendingUp style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent-blue)' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                    Win Rate
                  </span>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  {userStats.winRate}%
                </p>
              </div>
              <div className="stat-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <Wallet style={{ width: '1.25rem', height: '1.25rem', color: 'var(--accent-purple)' }} />
                  <span style={{ fontSize: '0.875rem', fontWeight: '500', color: 'var(--text-secondary)' }}>
                    Total Winnings
                  </span>
                </div>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                  ${userStats.totalWinnings.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Performance History */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <BarChart3 style={{ width: '1.5rem', height: '1.5rem', color: 'var(--accent-purple)' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Performance History
                </h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {performanceData.map((day, index) => (
                  <div key={index} className="list-item">
                    <div>
                      <p style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                        {new Date(day.date).toLocaleDateString()}
                      </p>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {day.bets} bets • {day.wins} wins
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        ${day.amount.toFixed(2)}
                      </p>
                      <p className={day.profit >= 0 ? 'profit-positive' : 'profit-negative'} style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                        {day.profit >= 0 ? '+' : ''}${day.profit.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Betting History - Tabbed Interface */}
            <div className="card">
              <div className="tab-container">
                <div className="tab-buttons">
                  <button
                    className={`tab-button ${activeTab === 'recent' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recent')}
                  >
                    Recent Bets
                  </button>
                  <button
                    className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                  >
                    Active Bets ({pendingBets.length})
                  </button>
                </div>
              </div>

              {/* Recent Bets Tab Content */}
              {activeTab === 'recent' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {recentBets.length > 0 ? (
                    recentBets.map((bet) => (
                      <div key={bet.id} className="list-item">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className={bet.direction === 'UP' ? 'icon-circle-up' : 'icon-circle-down'}>
                            {bet.direction === 'UP' ? (
                              <TrendingUp style={{ width: '1rem', height: '1rem' }} />
                            ) : (
                              <TrendingDown style={{ width: '1rem', height: '1rem' }} />
                            )}
                          </div>
                          <div>
                            <p style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                              {bet.direction} Bet
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                              {bet.time}
                            </p>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                            ${bet.amount.toFixed(2)}
                          </p>
                          <p className={bet.profit >= 0 ? 'profit-positive' : 'profit-negative'} style={{ fontSize: '0.875rem', fontWeight: '500' }}>
                            {bet.profit >= 0 ? '+' : ''}${bet.profit.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      No recent bets found
                    </div>
                  )}
                </div>
              )}

              {/* Active Bets Tab Content */}
              {activeTab === 'active' && (
                <div>
                  {pendingBets.length > 0 ? (
                    pendingBets.map((bet) => (
                      <div key={bet.id} className={`pending-bet-item ${bet.direction.toLowerCase()}`}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div className={bet.direction === 'UP' ? 'icon-circle-up' : 'icon-circle-down'}>
                            {bet.direction === 'UP' ? (
                              <TrendingUp style={{ width: '1rem', height: '1rem' }} />
                            ) : (
                              <TrendingDown style={{ width: '1rem', height: '1rem' }} />
                            )}
                          </div>
                          <div>
                            <p style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                              {bet.direction} Bet
                            </p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                              {bet.time}
                            </p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                              Amount
                            </p>
                            <p style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                              ${bet.amount.toFixed(2)}
                            </p>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                              Multiplier
                            </p>
                            <span className="pending-bet-multiplier">
                              {bet.multiplier.toFixed(2)}x
                            </span>
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                              Potential Win
                            </p>
                            <p className="pending-bet-win">
                              ${bet.potentialWin.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                      No active bets. <br />
                      <span style={{ fontSize: '0.875rem' }}>Place a bet to see it here!</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

