import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { testBackendConnection, getVercelUrl } from '../services/api';

const Home = () => {
  // Live predictions state
  const [livePredictions, setLivePredictions] = useState({
    btc: {
      amount: '0.005',
      change: '+3%',
      direction: 'up',
      timeAgo: '2 mins ago'
    },
    eth: {
      amount: '0.02',
      change: '-1.2%',
      direction: 'down',
      timeAgo: '4 mins ago'
    }
  });

  // FAQ state
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  // Simulate live data updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Generate random predictions
      const btcChange = (Math.random() - 0.5) * 10; // -5% to +5%
      const ethChange = (Math.random() - 0.5) * 10; // -5% to +5%
      
      setLivePredictions({
        btc: {
          amount: (Math.random() * 0.01).toFixed(3),
          change: `${btcChange > 0 ? '+' : ''}${btcChange.toFixed(1)}%`,
          direction: btcChange > 0 ? 'up' : 'down',
          timeAgo: '2 mins ago'
        },
        eth: {
          amount: (Math.random() * 0.05).toFixed(2),
          change: `${ethChange > 0 ? '+' : ''}${ethChange.toFixed(1)}%`,
          direction: ethChange > 0 ? 'up' : 'down',
          timeAgo: '4 mins ago'
        }
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Check for demo mode
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  useEffect(() => {
    const demoMode = localStorage.getItem('isDemoMode') === 'true';
    setIsDemoMode(demoMode);
  }, []);

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    const success = await testBackendConnection();
    if (success) {
      setIsDemoMode(false);
      window.location.reload(); // Refresh to use real data
    } else {
      alert('Backend connection failed. Please check your server configuration.');
    }
    setIsTestingConnection(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Demo Mode Banner */}
      {isDemoMode && (
        <div style={{
          background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
          color: 'white',
          padding: '0.75rem 1rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          fontWeight: '600',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          <span>🚀 Demo Mode: Using mock data due to backend connection issues. Backend needs CORS configuration for {getVercelUrl()}</span>
          <button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: isTestingConnection ? 'not-allowed' : 'pointer',
              opacity: isTestingConnection ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              if (!isTestingConnection) {
                e.target.style.background = 'rgba(255,255,255,0.3)';
              }
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'rgba(255,255,255,0.2)';
            }}
          >
            {isTestingConnection ? 'Testing...' : 'Test Backend Connection'}
          </button>
        </div>
      )}
      
      {/* Hero Section */}
      <section style={{ 
        padding: 'clamp(1.5rem, 4vw, 3rem) 0', 
        minHeight: 'clamp(50vh, 70vh, 80vh)', 
        display: 'flex', 
        alignItems: 'center',
        position: 'relative'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10
        }}>
          <h1 className="hero-title" style={{ 
            fontSize: 'clamp(1.25rem, 5vw, 4rem)', 
            fontWeight: '700', 
            marginBottom: 'clamp(0.75rem, 2vw, 1.5rem)', 
            lineHeight: '1.2',
            animation: 'floatUp 1s ease-out'
          }}>
            <span style={{ color: 'var(--text-primary)' }}>Predict Crypto Trends - </span>
            <span className="rise-word" style={{ color: '#10B981' }}>Rise</span>
            <span style={{ color: 'var(--text-primary)' }}> Or </span>
            <span className="fall-word" style={{ color: '#EF4444' }}>Fall</span>
          </h1>
          
          <p style={{ 
            fontSize: 'clamp(0.75rem, 1.8vw, 1.25rem)', 
            color: 'var(--text-secondary)', 
            marginBottom: 'clamp(1rem, 3vw, 2rem)', 
            maxWidth: 'clamp(18rem, 85vw, 40rem)', 
            margin: '0 auto clamp(1rem, 3vw, 2rem)',
            fontWeight: '500',
            lineHeight: '1.5'
          }}>
            Stake Crypto on market direction, Simple. Fast. Transparent.
          </p>
          
          <div className="hero-buttons" style={{ 
            display: 'flex', 
            flexDirection: 'row', 
            gap: 'clamp(0.75rem, 2vw, 1.5rem)', 
            justifyContent: 'center', 
            alignItems: 'center',
            flexWrap: 'wrap',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <Link 
              to="/betting" 
              className="btn btn-primary"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
                color: 'white',
                padding: 'clamp(0.625rem, 1.5vw, 0.875rem) clamp(1rem, 3vw, 1.5rem)',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: 'clamp(0.75rem, 1.8vw, 1rem)',
                minWidth: 'clamp(140px, 35vw, 200px)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                animation: 'slideInLeft 0.8s ease-out 0.5s both',
                flex: '1'
              }}
            >
                Place my Prediction
              </Link>
            <Link 
              to="/faq" 
              className="btn btn-secondary"
              style={{
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '2px solid var(--text-primary)',
                padding: 'clamp(0.625rem, 1.5vw, 0.875rem) clamp(1rem, 3vw, 1.5rem)',
                borderRadius: '9999px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: 'clamp(0.75rem, 1.8vw, 1rem)',
                minWidth: 'clamp(140px, 35vw, 200px)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                animation: 'slideInRight 0.8s ease-out 0.7s both',
                flex: '1'
              }}
            >
              Learn How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* Info Cards Section */}
      <section style={{ 
        padding: 'clamp(1rem, 3vw, 2rem) 0', 
        background: 'var(--bg-primary)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
          <div className="process-cards-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 'clamp(0.5rem, 1.5vw, 1rem)' 
          }}>
            <div className="process-card" style={{
              background: 'var(--card-bg)',
              borderRadius: '0.75rem',
              padding: 'clamp(1rem, 2.5vw, 1.5rem)',
              textAlign: 'center',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 4px var(--shadow)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: 'clamp(0.75rem, 2vw, 1rem)' 
              }}>
                <div style={{
                  width: 'clamp(36px, 8vw, 48px)',
                  height: 'clamp(36px, 8vw, 48px)',
                  border: '2px solid var(--accent-purple)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {/* Solid arrow shape */}
                  <div style={{
                    width: 'clamp(16px, 4vw, 20px)',
                    height: 'clamp(18px, 4.5vw, 24px)',
                    position: 'relative'
                  }}>
                    {/* Arrow head (triangle) */}
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '50%',
                      width: '0',
                      height: '0',
                      borderLeft: 'clamp(8px, 2vw, 10px) solid transparent',
                      borderRight: 'clamp(8px, 2vw, 10px) solid transparent',
                      borderBottom: 'clamp(10px, 2.5vw, 12px) solid var(--accent-purple)',
                      transform: 'translateX(-50%)'
                    }}></div>
                    {/* Arrow stem */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '50%',
                      width: 'clamp(4px, 1vw, 6px)',
                      height: 'clamp(8px, 2vw, 12px)',
                      background: 'var(--accent-purple)',
                      transform: 'translateX(-50%)'
                    }}></div>
                  </div>
                </div>
              </div>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                fontSize: 'clamp(0.875rem, 2vw, 1.125rem)', 
                fontWeight: '600',
                marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)'
              }}>
                Select BTC, ETH, or USDT
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                lineHeight: '1.4'
              }}>
                Choose your preferred cryptocurrency to start predicting
              </p>
            </div>
            
            <div className="process-card" style={{
              background: 'var(--card-bg)',
              borderRadius: '0.75rem',
              padding: 'clamp(1rem, 2.5vw, 1.5rem)',
              textAlign: 'center',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 4px var(--shadow)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: 'clamp(0.75rem, 2vw, 1rem)' 
              }}>
                <div style={{
                  width: 'clamp(36px, 8vw, 48px)',
                  height: 'clamp(36px, 8vw, 48px)',
                  border: '2px solid var(--accent-blue)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {/* Solid arrow shape */}
                  <div style={{
                    width: 'clamp(16px, 4vw, 20px)',
                    height: 'clamp(18px, 4.5vw, 24px)',
                    position: 'relative'
                  }}>
                    {/* Arrow head (triangle) */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '50%',
                      width: '0',
                      height: '0',
                      borderLeft: 'clamp(8px, 2vw, 10px) solid transparent',
                      borderRight: 'clamp(8px, 2vw, 10px) solid transparent',
                      borderTop: 'clamp(10px, 2.5vw, 12px) solid var(--accent-blue)',
                      transform: 'translateX(-50%)'
                    }}></div>
                    {/* Arrow stem */}
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '50%',
                      width: 'clamp(4px, 1vw, 6px)',
                      height: 'clamp(8px, 2vw, 12px)',
                      background: 'var(--accent-blue)',
                      transform: 'translateX(-50%)'
                    }}></div>
                  </div>
                </div>
              </div>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                fontSize: 'clamp(0.875rem, 2vw, 1.125rem)', 
                fontWeight: '600',
                marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)'
              }}>
                Up or Down with one click
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                lineHeight: '1.4'
              }}>
                Make your prediction with a single click
              </p>
            </div>
            
            <div className="process-card" style={{
              background: 'var(--card-bg)',
              borderRadius: '0.75rem',
              padding: 'clamp(1rem, 2.5vw, 1.5rem)',
              textAlign: 'center',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 4px var(--shadow)',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginBottom: 'clamp(0.75rem, 2vw, 1rem)' 
              }}>
                <div style={{
                  width: 'clamp(36px, 8vw, 48px)',
                  height: 'clamp(36px, 8vw, 48px)',
                  border: '2px solid var(--accent-purple)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                  {/* Solid arrow shape */}
                  <div style={{
                    width: 'clamp(16px, 4vw, 20px)',
                    height: 'clamp(18px, 4.5vw, 24px)',
                    position: 'relative'
                  }}>
                    {/* Arrow head (triangle) */}
                    <div style={{
                      position: 'absolute',
                      top: '0',
                      left: '50%',
                      width: '0',
                      height: '0',
                      borderLeft: 'clamp(8px, 2vw, 10px) solid transparent',
                      borderRight: 'clamp(8px, 2vw, 10px) solid transparent',
                      borderBottom: 'clamp(10px, 2.5vw, 12px) solid var(--accent-purple)',
                      transform: 'translateX(-50%)'
                    }}></div>
                    {/* Arrow stem */}
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      left: '50%',
                      width: 'clamp(4px, 1vw, 6px)',
                      height: 'clamp(8px, 2vw, 12px)',
                      background: 'var(--accent-purple)',
                      transform: 'translateX(-50%)'
                    }}></div>
                  </div>
                </div>
              </div>
              <h3 style={{ 
                color: 'var(--text-primary)', 
                fontSize: 'clamp(0.875rem, 2vw, 1.125rem)', 
                fontWeight: '600',
                marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)'
              }}>
                Enter Amount and confirm instantly
              </h3>
              <p style={{ 
                color: 'var(--text-secondary)', 
                fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                lineHeight: '1.4'
              }}>
                Set your bet amount and confirm your prediction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Predictions Section */}
      <section style={{ 
        padding: 'clamp(2rem, 6vw, 4rem) 0', 
        background: 'var(--bg-primary)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem' 
        }}>
          <h2 style={{ 
            color: 'var(--text-primary)', 
            fontSize: 'clamp(1.25rem, 3.5vw, 2rem)', 
            fontWeight: '700', 
            marginBottom: 'clamp(1rem, 3vw, 2rem)',
            textAlign: 'left'
          }}>
            Live Predictions
          </h2>
          
          {/* Prediction Cards */}
          <div className="live-predictions-grid" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 'clamp(0.75rem, 2vw, 1.25rem)',
            marginBottom: 'clamp(1.5rem, 4vw, 3rem)',
            width: '100%',
            padding: '0 clamp(0.5rem, 2vw, 1rem)'
          }}>
            {/* BTC Prediction Card */}
            <div className="prediction-card" style={{
              background: 'var(--card-bg)',
              borderRadius: '1rem',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 6px var(--shadow)',
              transition: 'all 0.3s ease',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem'
              }}>
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
                  fontWeight: '700',
                  margin: 0
                }}>
                  BTC
                </h3>
                <img 
                  src={livePredictions.btc.direction === 'up' ? '/up.svg' : '/down.svg'} 
                  alt={livePredictions.btc.direction === 'up' ? 'Up' : 'Down'}
                  style={{
                    width: '20px',
                    height: '20px'
                  }}
                />
                <span style={{ 
                  color: livePredictions.btc.direction === 'up' ? '#7A46EC' : '#21C3FD', 
                  fontSize: '1.125rem', 
                  fontWeight: '600' 
                }}>
                  {livePredictions.btc.amount}. BTC
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem'
              }}>
                <span style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: '1rem', 
                  fontWeight: '600' 
                }}>
                  {livePredictions.btc.change}
                </span>
                <span style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: '0.875rem' 
                }}>
                  {livePredictions.btc.timeAgo}
                </span>
              </div>
            </div>

            {/* ETH Prediction Card */}
            <div className="prediction-card" style={{
              background: 'var(--card-bg)',
              borderRadius: '1rem',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 4px 6px var(--shadow)',
              transition: 'all 0.3s ease',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem'
              }}>
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
                  fontWeight: '700',
                  margin: 0
                }}>
                  ETH
                </h3>
                <img 
                  src={livePredictions.eth.direction === 'up' ? '/up.svg' : '/down.svg'} 
                  alt={livePredictions.eth.direction === 'up' ? 'Up' : 'Down'}
                  style={{
                    width: '20px',
                    height: '20px'
                  }}
                />
                <span style={{ 
                  color: livePredictions.eth.direction === 'up' ? '#7A46EC' : '#21C3FD', 
                  fontSize: '1.125rem', 
                  fontWeight: '600' 
                }}>
                  {livePredictions.eth.amount}. ETH
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem'
              }}>
                <span style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: '1rem', 
                  fontWeight: '600' 
                }}>
                  {livePredictions.eth.change}
                </span>
                <span style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: '0.875rem' 
                }}>
                  {livePredictions.eth.timeAgo}
                </span>
              </div>
            </div>
          </div>

          {/* Feature Cards Grid */}
          <div className="feature-cards-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 220px))', 
            gap: 'clamp(1rem, 2.5vw, 1.5rem)',
            justifyContent: 'center'
          }}>
            {/* Fast Settlements */}
            <div className="feature-card" style={{
              background: 'var(--card-bg)',
              borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 4px var(--shadow)',
              transition: 'all 0.3s ease',
              textAlign: 'left',
              width: 'clamp(200px, 20vw, 220px)',
              height: 'clamp(200px, 20vw, 220px)',
              opacity: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h3 style={{ 
                color: '#7A46EC', 
                fontSize: 'clamp(0.875rem, 2vw, 1.125rem)', 
                fontWeight: '700',
                marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)',
                fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                Fast Settlements
              </h3>
              <p style={{ 
                color: 'var(--text-primary)', 
                fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                lineHeight: '1.4',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                Instant payout After results
              </p>
            </div>

            {/* Multi-Asset Support */}
            <div className="feature-card" style={{
              background: 'var(--card-bg)',
              borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 4px var(--shadow)',
              transition: 'all 0.3s ease',
              textAlign: 'left',
              width: 'clamp(200px, 20vw, 220px)',
              height: 'clamp(200px, 20vw, 220px)',
              opacity: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h3 style={{ 
                color: '#7A46EC', 
                fontSize: 'clamp(0.875rem, 2vw, 1.125rem)', 
                fontWeight: '700',
                marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)',
                fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                Multi- Asset Support
              </h3>
              <p style={{ 
                color: 'var(--text-primary)', 
                fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                lineHeight: '1.4',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                BTC, ETH, and Stablecoins
              </p>
            </div>

            {/* Transparent Payouts */}
            <div className="feature-card" style={{
              background: 'var(--card-bg)',
              borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 4px var(--shadow)',
              transition: 'all 0.3s ease',
              textAlign: 'left',
              width: 'clamp(200px, 20vw, 220px)',
              height: 'clamp(200px, 20vw, 220px)',
              opacity: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h3 style={{ 
                color: '#7A46EC', 
                fontSize: 'clamp(0.875rem, 2vw, 1.125rem)', 
                fontWeight: '700',
                marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)',
                fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                Transparent Payouts
              </h3>
              <p style={{ 
                color: 'var(--text-primary)', 
                fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                lineHeight: '1.4',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                No hidden fees or tricks
              </p>
            </div>
            
            {/* Low Volatility */}
            <div className="feature-card" style={{
              background: 'var(--card-bg)',
              borderRadius: 'clamp(0.5rem, 2vw, 0.75rem)',
              padding: 'clamp(1rem, 3vw, 1.5rem)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 2px 4px var(--shadow)',
              transition: 'all 0.3s ease',
              textAlign: 'left',
              width: 'clamp(200px, 20vw, 220px)',
              height: 'clamp(200px, 20vw, 220px)',
              opacity: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <h3 style={{ 
                color: '#7A46EC', 
                fontSize: 'clamp(0.875rem, 2vw, 1.125rem)', 
                fontWeight: '700',
                marginBottom: 'clamp(0.25rem, 1vw, 0.5rem)',
                fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                Low Volatility
              </h3>
              <p style={{ 
                color: 'var(--text-primary)', 
                fontSize: 'clamp(0.7rem, 1.8vw, 0.8rem)',
                lineHeight: '1.4',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                Predict with Stable
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section style={{ 
        padding: 'clamp(2rem, 6vw, 4rem) 0', 
        background: 'var(--bg-primary)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 1rem' 
        }}>
          <h2 style={{ 
            color: 'var(--text-primary)', 
            fontSize: 'clamp(1.25rem, 3.5vw, 2rem)', 
            fontWeight: '700', 
            marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)',
            textAlign: 'center'
          }}>
            Frequently Asked Questions
          </h2>
          
          {/* FAQ Items */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: 'clamp(1rem, 2.5vw, 1.5rem)',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            {/* FAQ Item 1 */}
            <div 
              style={{
                background: 'var(--faq-bg)',
                borderRadius: 'clamp(0.75rem, 2vw, 1rem)',
                padding: 'clamp(1.25rem, 3vw, 1.75rem)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 2px 4px var(--shadow)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => toggleFAQ(0)}
            >
              <h3 style={{ 
                color: '#21C3FD', 
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
                fontWeight: '700',
                marginBottom: openFAQ === 0 ? 'clamp(0.5rem, 1.5vw, 0.75rem)' : 0,
                fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                transition: 'margin-bottom 0.3s ease'
              }}>
                What currencies can i use?
              </h3>
              {openFAQ === 0 && (
                <p style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  lineHeight: '1.5',
                  margin: 0,
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  animation: 'fadeIn 0.3s ease-in'
                }}>
                  We Currently support BTC, ETH, and USDT
                </p>
              )}
            </div>
            
            {/* FAQ Item 2 */}
            <div 
              style={{
                background: 'var(--faq-bg)',
                borderRadius: 'clamp(0.75rem, 2vw, 1rem)',
                padding: 'clamp(1.25rem, 3vw, 1.75rem)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 2px 4px var(--shadow)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => toggleFAQ(1)}
            >
              <h3 style={{ 
                color: '#21C3FD', 
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
                fontWeight: '700',
                marginBottom: openFAQ === 1 ? 'clamp(0.5rem, 1.5vw, 0.75rem)' : 0,
                fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                transition: 'margin-bottom 0.3s ease'
              }}>
                How are Payouts Calculated?
              </h3>
              {openFAQ === 1 && (
                <p style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  lineHeight: '1.5',
                  margin: 0,
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  animation: 'fadeIn 0.3s ease-in'
                }}>
                  Payouts are based on stake multiplied by odds at the time of your prediction
                </p>
              )}
            </div>
            
            {/* FAQ Item 3 */}
            <div 
              style={{
                background: 'var(--faq-bg)',
                borderRadius: 'clamp(0.75rem, 2vw, 1rem)',
                padding: 'clamp(1.25rem, 3vw, 1.75rem)',
                border: '1px solid var(--border-color)',
                boxShadow: '0 2px 4px var(--shadow)',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onClick={() => toggleFAQ(2)}
            >
              <h3 style={{ 
                color: '#21C3FD', 
                fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', 
                fontWeight: '700',
                marginBottom: openFAQ === 2 ? 'clamp(0.5rem, 1.5vw, 0.75rem)' : 0,
                fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                transition: 'margin-bottom 0.3s ease'
              }}>
                Is this platform secure?
              </h3>
              {openFAQ === 2 && (
                <p style={{ 
                  color: 'var(--text-primary)', 
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  lineHeight: '1.5',
                  margin: 0,
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  animation: 'fadeIn 0.3s ease-in'
                }}>
                  Yes we use advanced encryption and follow best practices for wallet and transactions safely
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;