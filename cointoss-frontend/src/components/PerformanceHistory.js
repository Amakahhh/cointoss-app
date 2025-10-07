import React from 'react';
import { BarChart3 } from 'lucide-react';

/**
 * PerformanceHistory Component
 * Props:
 *  - data: array of { date, bets, wins, amount, profit }
 *  - emptyMessage: optional message when no data
 */
const PerformanceHistory = ({ data = [], emptyMessage = 'No performance history yet' }) => {
  return (
    <div className="card" style={{ borderRadius: '1.5rem', padding: '2rem', border: '1px solid var(--glass-border)', background: 'var(--card-bg)', boxShadow: '0 8px 32px var(--shadow)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <BarChart3 style={{ width: '1.5rem', height: '1.5rem', color: 'var(--accent-purple)' }} />
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>
          Performance History
        </h3>
      </div>
      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {emptyMessage}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.map((day, index) => (
            <div key={index} className="list-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', borderRadius: '0.75rem', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', transition: 'all 0.2s ease-in-out' }}>
              <div>
                <p style={{ fontWeight: '500', color: 'var(--text-primary)', margin: 0 }}>
                  {new Date(day.date).toLocaleDateString()}
                </p>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                  {day.bets} bets • {day.wins} wins
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                  ${day.amount.toFixed(2)}
                </p>
                <p style={{ fontSize: '0.875rem', fontWeight: '500', margin: 0, color: day.profit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                  {day.profit >= 0 ? '+' : ''}${day.profit.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PerformanceHistory;
