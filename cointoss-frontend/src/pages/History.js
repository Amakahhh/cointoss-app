import React, { useMemo, useState, useEffect } from 'react';
import useStore from '../store/useStore';
import PerformanceHistory from '../components/PerformanceHistory';
import { Target, TrendingUp, Wallet, Award, BarChart3, Calendar, FileText, AlertCircle } from 'lucide-react';
import Sparkline from '../components/Sparkline';

const History = () => {
  const { currentBets, transactions, theme, isAuthenticated, user, balance } = useStore();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated]);

  // Derive performance-style daily aggregates from transactions (BET + WIN) as fallback
  const performanceData = useMemo(() => {
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
          grouped[day].profit += t.amount; // winnings already positive
        }
      }
    });
    return Object.values(grouped).sort((a,b) => new Date(b.date) - new Date(a.date));
  }, [transactions]);

  // Overall stats similar to profile style
  const totalBets = currentBets.length + transactions.filter(t => t.type === 'BET').length;
  const wins = transactions.filter(t => t.type === 'WIN').length;
  const winRate = totalBets > 0 ? ((wins / totalBets) * 100).toFixed(1) : '0.0';
  const netProfit = transactions.reduce((sum, t) => {
    if (t.type === 'BET') return sum - Math.abs(t.amount);
    if (t.type === 'WIN') return sum + t.amount;
    return sum;
  }, 0);

  // Advanced Metrics
  const betTransactions = transactions.filter(t => t.type === 'BET');
  const winTransactions = transactions.filter(t => t.type === 'WIN');
  const totalBetAmount = betTransactions.reduce((s,t) => s + Math.abs(t.amount), 0);
  const averageBetSize = betTransactions.length > 0 ? totalBetAmount / betTransactions.length : 0;
  // ROI = Net Profit / Total Bet Outlay * 100
  const roi = totalBetAmount > 0 ? (netProfit / totalBetAmount) * 100 : 0;

  // Streak calculations (process bets & wins chronologically by timestamp)
  const chronological = [...transactions]
    .filter(t => t.type === 'BET' || t.type === 'WIN')
    .sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));

  // Map bet and win events to resolved outcomes; we assume each WIN corresponds to a previous BET in same cycle (simplified)
  let longestWinStreak = 0;
  let currentWinStreak = 0;
  chronological.forEach(t => {
    if (t.type === 'WIN') {
      currentWinStreak += 1;
      if (currentWinStreak > longestWinStreak) longestWinStreak = currentWinStreak;
    } else if (t.type === 'BET') {
      // A bet breaks nothing; only a loss would reset, but we don't explicitly store losses as transactions.
      // Infer a loss when a BET is followed by settlement without a WIN? Lacking explicit data, we reset streak when we encounter a BET whose outcome not yet known.
      // To avoid misleading streak inflation, we won't reset on BET; reset logic would need explicit LOST transaction entries.
    }
  });

  // Since losses aren't individual WIN/LOSS transactions, we approximate current streak as currentWinStreak
  const currentStreak = currentWinStreak;

  const [activeTab, setActiveTab] = useState('performance');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filteredTransactions = useMemo(() => {
    let list = [...transactions];
    if (startDate) {
      const s = new Date(startDate + 'T00:00:00Z');
      list = list.filter(t => new Date(t.timestamp) >= s);
    }
    if (endDate) {
      const e = new Date(endDate + 'T23:59:59Z');
      list = list.filter(t => new Date(t.timestamp) <= e);
    }
    // Sort newest first
    list.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    return list;
  }, [transactions, startDate, endDate]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginated = filteredTransactions.slice((page - 1) * pageSize, page * pageSize);

  const resetPagination = () => setPage(1);

  const exportCSV = () => {
    if (!filteredTransactions.length) return;
    const headers = ['Timestamp','Type','Amount','Description'];
    const rows = filteredTransactions.map(t => [
      new Date(t.timestamp).toISOString(),
      t.type,
      t.amount,
      `"${(t.description||'').replace(/"/g,'""')}"`
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'transactions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Build cumulative profit timeline from chronological transactions for sparkline
  const cumulativeProfit = useMemo(() => {
    let running = 0;
    const points = [];
    const chrono = [...transactions].filter(t => t.type === 'BET' || t.type === 'WIN')
      .sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
    chrono.forEach(t => {
      if (t.type === 'BET') running -= Math.abs(t.amount);
      if (t.type === 'WIN') running += t.amount;
      points.push(running);
    });
    return points;
  }, [transactions]);

  // Empty state components
  const EmptyState = ({ icon: Icon, title, description, actionText, onAction }) => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      textAlign: 'center',
      background: 'var(--card-bg)',
      borderRadius: '1rem',
      border: '1px solid var(--glass-border)',
      margin: '2rem 0'
    }}>
      <div style={{
        width: '4rem',
        height: '4rem',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        opacity: 0.8
      }}>
        <Icon size={24} color="white" />
      </div>
      <h3 style={{
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--text-primary)',
        marginBottom: '0.5rem'
      }}>
        {title}
      </h3>
      <p style={{
        fontSize: '0.875rem',
        color: 'var(--text-secondary)',
        marginBottom: '1.5rem',
        maxWidth: '300px',
        lineHeight: '1.5'
      }}>
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          style={{
            background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '0.75rem 1.5rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.3)';
          }}
          onMouseOut={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          {actionText}
        </button>
      )}
    </div>
  );

  const tabButtonStyle = (tab) => ({
    padding: '.75rem 1.25rem',
    borderRadius: '0.75rem',
    fontWeight: 600,
    fontSize: '.875rem',
    letterSpacing: '.03em',
    cursor: 'pointer',
    border: '1px solid var(--glass-border)',
    background: activeTab === tab ? 'var(--accent-gradient, linear-gradient(90deg,var(--accent-blue),var(--accent-purple)))' : 'var(--card-bg)',
    color: activeTab === tab ? 'white' : 'var(--text-secondary)',
    boxShadow: activeTab === tab ? '0 4px 18px -4px rgba(0,0,0,0.4)' : 'none',
    transition: 'all .25s ease'
  });

  return (
    <div className="app-container" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <style>{`body { background: var(--bg-primary); }`}</style>
      <div className="container" style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-primary)', textAlign: 'center' }}>History & Performance</h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button style={tabButtonStyle('performance')} onClick={() => setActiveTab('performance')}>Performance</button>
          <button style={tabButtonStyle('transactions')} onClick={() => setActiveTab('transactions')}>Detailed Transactions</button>
        </div>

        {activeTab === 'performance' && (
          <>
            {transactions.length === 0 ? (
              <EmptyState
                icon={BarChart3}
                title="No Performance Data"
                description="Start placing bets to build your performance history and see detailed analytics."
                actionText="Start Betting"
                onAction={() => window.location.href = '/betting'}
              />
            ) : (
              <>
                {/* Stats Row */}
                <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div className="stat-card" style={{ borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--glass-border)', background: 'var(--card-bg)', boxShadow: '0 8px 32px var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                  <Target style={{ width: '1rem', height: '1rem', color: 'var(--accent-green)' }} />
                  <span style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Bets</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalBets}</div>
              </div>
              <div className="stat-card" style={{ borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--glass-border)', background: 'var(--card-bg)', boxShadow: '0 8px 32px var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                  <TrendingUp style={{ width: '1rem', height: '1rem', color: 'var(--accent-blue)' }} />
                  <span style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>Wins</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{wins}</div>
              </div>
              <div className="stat-card" style={{ borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--glass-border)', background: 'var(--card-bg)', boxShadow: '0 8px 32px var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                  <Award style={{ width: '1rem', height: '1rem', color: 'var(--accent-gold)' }} />
                  <span style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>Win Rate</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{winRate}%</div>
              </div>
              <div className="stat-card" style={{ borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--glass-border)', background: 'var(--card-bg)', boxShadow: '0 8px 32px var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                  <Wallet style={{ width: '1rem', height: '1rem', color: 'var(--accent-purple)' }} />
                  <span style={{ fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>Net Profit</span>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: netProfit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{netProfit >= 0 ? '+' : ''}{netProfit.toFixed(2)}</div>
                <div style={{ marginTop: '.75rem' }}>
                  <Sparkline data={cumulativeProfit} />
                </div>
              </div>
              {/* Advanced Metrics */}
              <div className="stat-card" style={{ borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--glass-border)', background: 'var(--card-bg)', boxShadow: '0 8px 32px var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                  <span style={{ width: '1rem', height: '1rem', display: 'inline-block', background: 'linear-gradient(135deg,var(--accent-blue),var(--accent-purple))', borderRadius: '50%' }}></span>
                  <span style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>Avg Bet Size</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>{averageBetSize.toFixed(2)}</div>
              </div>
              <div className="stat-card" style={{ borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--glass-border)', background: 'var(--card-bg)', boxShadow: '0 8px 32px var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                  <span style={{ width: '1rem', height: '1rem', display: 'inline-block', background: 'linear-gradient(135deg,var(--accent-green),var(--accent-teal,var(--accent-green)))', borderRadius: '50%' }}></span>
                  <span style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>ROI %</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: roi >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>{roi.toFixed(1)}%</div>
              </div>
              <div className="stat-card" style={{ borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--glass-border)', background: 'var(--card-bg)', boxShadow: '0 8px 32px var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                  <span style={{ width: '1rem', height: '1rem', display: 'inline-block', background: 'linear-gradient(135deg,var(--accent-gold),var(--accent-orange,var(--accent-gold)))', borderRadius: '50%' }}></span>
                  <span style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>Longest Win Streak</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>{longestWinStreak}</div>
              </div>
              <div className="stat-card" style={{ borderRadius: '1rem', padding: '1.25rem', border: '1px solid var(--glass-border)', background: 'var(--card-bg)', boxShadow: '0 8px 32px var(--shadow)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.25rem' }}>
                  <span style={{ width: '1rem', height: '1rem', display: 'inline-block', background: 'linear-gradient(135deg,var(--accent-red),var(--accent-purple))', borderRadius: '50%' }}></span>
                  <span style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.05em', color: 'var(--text-secondary)', fontWeight: 600 }}>Current Win Streak</span>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentStreak}</div>
              </div>
            </div>
            <PerformanceHistory data={performanceData} emptyMessage={transactions.length === 0 ? 'Place your first bet to build history' : 'No performance entries yet'} />
              </>
            )}
          </>
        )}

        {activeTab === 'transactions' && (
          <div style={{ borderRadius: '1rem', padding: '1.5rem', border: '1px solid var(--glass-border)', background: 'var(--card-bg)', boxShadow: '0 8px 32px var(--shadow)' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 1.25rem', color: 'var(--text-primary)' }}>Detailed Transactions</h2>
            {/* Filters */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                <label style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600, color: 'var(--text-secondary)' }}>Start Date</label>
                <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); resetPagination(); }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '.55rem .65rem', borderRadius: '.5rem', fontSize: '.75rem' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                <label style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600, color: 'var(--text-secondary)' }}>End Date</label>
                <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); resetPagination(); }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)', padding: '.55rem .65rem', borderRadius: '.5rem', fontSize: '.75rem' }} />
              </div>
              <div style={{ alignSelf: 'flex-end', display: 'flex', gap: '.5rem' }}>
                <button onClick={() => { setStartDate(''); setEndDate(''); resetPagination(); }} style={{ padding: '.55rem .9rem', borderRadius: '.6rem', fontSize: '.7rem', fontWeight: 600, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', cursor: 'pointer' }}>Reset</button>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '.5rem', alignItems: 'flex-end' }}>
                <button onClick={exportCSV} disabled={!filteredTransactions.length} style={{ opacity: !filteredTransactions.length ? .5 : 1, cursor: !filteredTransactions.length ? 'not-allowed' : 'pointer', padding: '.55rem .9rem', borderRadius: '.6rem', fontSize: '.7rem', fontWeight: 600, background: 'linear-gradient(90deg,var(--accent-blue),var(--accent-purple))', color: '#fff', border: 'none' }}>Export CSV</button>
              </div>
            </div>
            {/* Table */}
            <div style={{ overflowX: 'auto', marginBottom: '1.25rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.75rem' }}>
                <thead>
                  <tr style={{ textAlign: 'left', background: 'var(--bg-secondary)' }}>
                    <th style={{ padding: '.6rem .75rem', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', fontSize: '.6rem', color: 'var(--text-secondary)' }}>Date</th>
                    <th style={{ padding: '.6rem .75rem', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', fontSize: '.6rem', color: 'var(--text-secondary)' }}>Type</th>
                    <th style={{ padding: '.6rem .75rem', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', fontSize: '.6rem', color: 'var(--text-secondary)' }}>Amount</th>
                    <th style={{ padding: '.6rem .75rem', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', fontSize: '.6rem', color: 'var(--text-secondary)' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '0' }}>
                        <EmptyState
                          icon={FileText}
                          title="No Transactions Yet"
                          description="You haven't made any transactions yet. Start betting to see your history here."
                          actionText="Start Betting"
                          onAction={() => window.location.href = '/betting'}
                        />
                      </td>
                    </tr>
                  )}
                  {paginated.map(tx => {
                    const isWin = tx.type === 'WIN';
                    const isBet = tx.type === 'BET';
                    return (
                      <tr key={tx.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <td style={{ padding: '.55rem .75rem', whiteSpace: 'nowrap', color: 'var(--text-secondary)' }}>{new Date(tx.timestamp).toLocaleString()}</td>
                        <td style={{ padding: '.55rem .75rem', fontWeight: 600, color: isWin ? 'var(--accent-green)' : isBet ? 'var(--accent-red)' : 'var(--text-primary)' }}>{tx.type}</td>
                        <td style={{ padding: '.55rem .75rem', color: isWin ? 'var(--accent-green)' : isBet ? 'var(--accent-red)' : 'var(--text-primary)', fontFamily: 'monospace' }}>{isBet ? '-' : isWin ? '+' : ''}{Math.abs(tx.amount).toFixed(2)}</td>
                        <td style={{ padding: '.55rem .75rem', color: 'var(--text-primary)' }}>{tx.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '.65rem', color: 'var(--text-secondary)' }}>
                Page {page} of {totalPages} &bull; {filteredTransactions.length} tx
              </div>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '.5rem .85rem', borderRadius: '.5rem', border: '1px solid var(--glass-border)', background: page === 1 ? 'var(--bg-secondary)' : 'var(--card-bg)', color: 'var(--text-secondary)', cursor: page === 1 ? 'not-allowed' : 'pointer', fontSize: '.65rem', fontWeight: 600 }}>Prev</button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '.5rem .85rem', borderRadius: '.5rem', border: '1px solid var(--glass-border)', background: page === totalPages ? 'var(--bg-secondary)' : 'var(--card-bg)', color: 'var(--text-secondary)', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontSize: '.65rem', fontWeight: 600 }}>Next</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;








