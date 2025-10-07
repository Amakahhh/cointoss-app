import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
// import { Sun, Moon } from 'lucide-react'; // Removed as theme toggle is hidden

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useStore();
  // isDarkMode state removed as theme toggle is hidden
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState({
    btc: 110699.58,
    eth: 4285.21,
    usdt: 1.00
  });

  const isActive = (path) => location.pathname === path;

  // toggleTheme function removed as theme toggle is hidden

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Fetch real crypto prices with rate limiting and caching
  useEffect(() => {
    let lastFetchTime = 0;
    const FETCH_INTERVAL = 60000; // 1 minute minimum between requests
    const CACHE_DURATION = 300000; // 5 minutes cache
    const CACHE_KEY = 'crypto_prices_cache';
    
    const fetchCryptoPrices = async () => {
      const now = Date.now();
      
      // Check if we should skip this fetch due to rate limiting
      if (now - lastFetchTime < FETCH_INTERVAL) {
        console.log('Rate limited: Skipping CoinGecko fetch');
        return;
      }
      
      // Check cache first
      try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (now - timestamp < CACHE_DURATION) {
            console.log('Using cached crypto prices');
            setCryptoPrices(data);
            return;
          }
        }
      } catch (error) {
        console.log('Cache read error:', error);
      }
      
      try {
        lastFetchTime = now;
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether&vs_currencies=usd', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const newPrices = {
          btc: data.bitcoin?.usd || 110699.58,
          eth: data.ethereum?.usd || 4285.21,
          usdt: data.tether?.usd || 1.00
        };
        
        setCryptoPrices(newPrices);
        
        // Cache the successful response
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: newPrices,
            timestamp: now
          }));
        } catch (cacheError) {
          console.log('Cache write error:', cacheError);
        }
        
        console.log('Crypto prices updated successfully');
      } catch (error) {
        console.log('CoinGecko API error:', error.message);
        console.log('Using fallback prices');
        // Keep the default prices if API fails
      }
    };

    // Initial fetch
    fetchCryptoPrices();
    
    // Update prices every 2 minutes (reduced frequency)
    const interval = setInterval(fetchCryptoPrices, 120000);
    return () => clearInterval(interval);
  }, []);

  // Apply theme on mount - default to light mode
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  return (
    <>
      {/* Top Price Ticker */}
        <div className="price-ticker" style={{ 
          background: 'var(--bg-secondary)', 
          color: 'var(--text-primary)', 
          padding: '0.5rem 0', 
          fontSize: 'clamp(0.5rem, 1.2vw, 1rem)', 
          fontWeight: '700', 
          textAlign: 'center',
          fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
          minHeight: '40px',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem', width: '100%' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              gap: 'clamp(0.75rem, 3vw, 1.5rem)', 
              flexWrap: 'nowrap',
              width: '100%',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: 'clamp(0.5rem, 1.2vw, 0.875rem)' }}>BTC:</span>
              <span style={{ color: 'var(--accent-purple)', fontWeight: '700', fontSize: 'clamp(0.5rem, 1.2vw, 0.875rem)' }}>
                ${cryptoPrices.btc.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: 'clamp(0.5rem, 1.2vw, 0.875rem)' }}>ETH:</span>
              <span style={{ color: 'var(--accent-blue)', fontWeight: '700', fontSize: 'clamp(0.5rem, 1.2vw, 0.875rem)' }}>
                ${cryptoPrices.eth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: 'clamp(0.5rem, 1.2vw, 0.875rem)' }}>USDT:</span>
              <span style={{ color: 'var(--accent-green)', fontWeight: '700', fontSize: 'clamp(0.5rem, 1.2vw, 0.875rem)' }}>
                ${cryptoPrices.usdt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav style={{ 
        background: 'var(--bg-primary)', 
        padding: 'clamp(0.5rem, 1.5vw, 1rem) 0',
        position: 'relative'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto', 
          padding: '0 clamp(0.5rem, 2vw, 1rem)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'nowrap',
          gap: 'clamp(0.5rem, 2vw, 1rem)',
          width: '100%'
        }}>
          {/* Logo */}
          <Link to="/" style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'clamp(0.25rem, 1vw, 0.5rem)', 
            textDecoration: 'none',
            flexShrink: 0
          }}>
            <img src="/logo.svg" alt="Cointoss" style={{ width: 'clamp(1.5rem, 3vw, 2rem)', height: 'clamp(1.5rem, 3vw, 2rem)' }} />
            <span style={{ 
              fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
              fontWeight: '700',
              fontStyle: 'normal',
              fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
              lineHeight: '100%',
              letterSpacing: '0.25%',
              color: 'var(--text-accent)',
              whiteSpace: 'nowrap'
            }}>
              Cointoss
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="desktop-nav" style={{ 
            display: 'none', 
            alignItems: 'center', 
            gap: 'clamp(0.5rem, 1.5vw, 1.5rem)',
            flexWrap: 'nowrap',
            flex: '1',
            justifyContent: 'center'
          }}>
            <Link 
              to="/betting" 
              style={{ 
                color: isActive('/betting') ? 'var(--accent-purple)' : 'var(--text-primary)', 
                textDecoration: 'none', 
                padding: 'clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)', 
                borderRadius: '0.75rem', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                background: isActive('/betting') ? 'var(--accent-purple)' : 'transparent',
                color: isActive('/betting') ? 'white' : 'var(--text-primary)',
                boxShadow: isActive('/betting') ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                transform: isActive('/betting') ? 'translateY(-1px)' : 'translateY(0)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/betting')) {
                  e.target.style.background = 'var(--bg-tertiary)';
                  e.target.style.color = 'var(--accent-purple)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px var(--shadow)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/betting')) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'var(--text-primary)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(0) scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = isActive('/betting') ? 'translateY(-1px) scale(1)' : 'translateY(-2px) scale(1)';
              }}
            >
              Live Predictions
            </Link>
            <Link 
              to="/wallet" 
              style={{ 
                color: isActive('/wallet') ? 'var(--accent-purple)' : 'var(--text-primary)', 
                textDecoration: 'none', 
                padding: 'clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)', 
                borderRadius: '0.75rem', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                background: isActive('/wallet') ? 'var(--accent-purple)' : 'transparent',
                color: isActive('/wallet') ? 'white' : 'var(--text-primary)',
                boxShadow: isActive('/wallet') ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                transform: isActive('/wallet') ? 'translateY(-1px)' : 'translateY(0)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/wallet')) {
                  e.target.style.background = 'var(--bg-tertiary)';
                  e.target.style.color = 'var(--accent-purple)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px var(--shadow)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/wallet')) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'var(--text-primary)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(0) scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = isActive('/wallet') ? 'translateY(-1px) scale(1)' : 'translateY(-2px) scale(1)';
              }}
            >
              Wallet
            </Link>
            <Link 
              to="/history" 
              style={{ 
                color: isActive('/history') ? 'var(--accent-purple)' : 'var(--text-primary)', 
                textDecoration: 'none', 
                padding: 'clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)', 
                borderRadius: '0.75rem', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                background: isActive('/history') ? 'var(--accent-purple)' : 'transparent',
                color: isActive('/history') ? 'white' : 'var(--text-primary)',
                boxShadow: isActive('/history') ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                transform: isActive('/history') ? 'translateY(-1px)' : 'translateY(0)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/history')) {
                  e.target.style.background = 'var(--bg-tertiary)';
                  e.target.style.color = 'var(--accent-purple)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px var(--shadow)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/history')) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'var(--text-primary)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(0) scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = isActive('/history') ? 'translateY(-1px) scale(1)' : 'translateY(-2px) scale(1)';
              }}
            >
              History
            </Link>
            <Link 
              to="/faq" 
              style={{ 
                color: isActive('/faq') ? 'var(--accent-purple)' : 'var(--text-primary)', 
                textDecoration: 'none', 
                padding: 'clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)', 
                borderRadius: '0.75rem', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                background: isActive('/faq') ? 'var(--accent-purple)' : 'transparent',
                color: isActive('/faq') ? 'white' : 'var(--text-primary)',
                boxShadow: isActive('/faq') ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                transform: isActive('/faq') ? 'translateY(-1px)' : 'translateY(0)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/faq')) {
                  e.target.style.background = 'var(--bg-tertiary)';
                  e.target.style.color = 'var(--accent-purple)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px var(--shadow)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/faq')) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'var(--text-primary)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(0) scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = isActive('/faq') ? 'translateY(-1px) scale(1)' : 'translateY(-2px) scale(1)';
              }}
            >
              FAQ
            </Link>
            <Link 
              to="/profile" 
              style={{ 
                color: isActive('/profile') ? 'var(--accent-purple)' : 'var(--text-primary)', 
                textDecoration: 'none', 
                padding: 'clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)', 
                borderRadius: '0.75rem', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                background: isActive('/profile') ? 'var(--accent-purple)' : 'transparent',
                color: isActive('/profile') ? 'white' : 'var(--text-primary)',
                boxShadow: isActive('/profile') ? '0 4px 12px rgba(139, 92, 246, 0.3)' : 'none',
                transform: isActive('/profile') ? 'translateY(-1px)' : 'translateY(0)',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/profile')) {
                  e.target.style.background = 'var(--bg-tertiary)';
                  e.target.style.color = 'var(--accent-purple)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px var(--shadow)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive('/profile')) {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'var(--text-primary)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(0) scale(0.98)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = isActive('/profile') ? 'translateY(-1px) scale(1)' : 'translateY(-2px) scale(1)';
              }}
            >
              Profile
            </Link>
          </div>

          {/* Right Side Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                style={{
                  background: '#EF4444',
                  color: 'white',
                  padding: 'clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#DC2626';
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 30px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#EF4444';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }}
              >
                Logout
              </button>
            ) : (
              <Link 
                to="/login" 
                style={{
                  color: 'var(--text-primary)',
                  padding: 'clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                  fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: '600',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  background: 'transparent',
                  border: '2px solid var(--border-color)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--accent-purple)';
                  e.target.style.background = 'var(--bg-tertiary)';
                  e.target.style.borderColor = 'var(--accent-purple)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px var(--shadow)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--text-primary)';
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(0) scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1)';
                }}
              >
                Login
              </Link>
            )}
            {!isAuthenticated && (
              <Link 
                to="/signup" 
                style={{
                  background: 'var(--text-accent)',
                  color: 'white',
                  padding: 'clamp(0.5rem, 1.2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)',
                  borderRadius: '0.75rem',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#9333EA';
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 30px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--text-accent)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(-1px) scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1)';
                }}
              >
                Sign Up
              </Link>
            )}
            {/* Theme toggle button hidden as requested */}
            {/* <button 
              onClick={() => {}}
              style={{
                background: 'var(--bg-secondary)',
                border: '2px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                padding: '0.75rem',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px var(--shadow)',
                transform: 'translateY(0)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--bg-tertiary)';
                e.target.style.borderColor = 'var(--accent-purple)';
                e.target.style.color = 'var(--accent-purple)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px var(--shadow)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--bg-secondary)';
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.color = 'var(--text-primary)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px var(--shadow)';
              }}
              onMouseDown={(e) => {
                e.target.style.transform = 'translateY(0) scale(0.95)';
              }}
              onMouseUp={(e) => {
                e.target.style.transform = 'translateY(-2px) scale(1)';
              }}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button> */}
            
            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              className="mobile-menu-btn"
              style={{
                display: 'none',
                background: 'none',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.5rem'
              }}
              aria-label="Toggle mobile menu"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div style={{ 
            background: 'var(--bg-secondary)', 
            padding: '1rem 0',
            borderTop: `1px solid var(--border-color)`
          }}>
            <div style={{ 
              maxWidth: '1200px', 
              margin: '0 auto', 
              padding: '0 1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              alignItems: 'center'
            }}>
              <Link 
                to="/betting" 
                className="mobile-menu-link"
                style={{ 
                  color: isActive('/betting') ? 'white' : 'var(--text-primary)', 
                  textDecoration: 'none', 
                  padding: '1rem 1.5rem', 
                  borderRadius: '0.75rem', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '1rem',
                  fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: '600',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '300px',
                  background: isActive('/betting') ? 'var(--accent-purple)' : 'var(--bg-secondary)',
                  border: isActive('/betting') ? 'none' : '2px solid var(--border-color)',
                  boxShadow: isActive('/betting') ? '0 4px 12px rgba(139, 92, 246, 0.3)' : '0 2px 8px var(--shadow)',
                  transform: isActive('/betting') ? 'translateY(-1px)' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/betting')) {
                    e.target.style.background = 'var(--bg-tertiary)';
                    e.target.style.borderColor = 'var(--accent-purple)';
                    e.target.style.color = 'var(--accent-purple)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px var(--shadow)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/betting')) {
                    e.target.style.background = 'var(--bg-secondary)';
                    e.target.style.borderColor = 'var(--border-color)';
                    e.target.style.color = 'var(--text-primary)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px var(--shadow)';
                  }
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(0) scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = isActive('/betting') ? 'translateY(-1px) scale(1)' : 'translateY(-2px) scale(1)';
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Live Predictions
              </Link>
              <Link 
                to="/wallet" 
                className="mobile-menu-link"
                style={{ 
                  color: isActive('/wallet') ? 'white' : 'var(--text-primary)', 
                  textDecoration: 'none', 
                  padding: '1rem 1.5rem', 
                  borderRadius: '0.75rem', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '1rem',
                  fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: '600',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '300px',
                  background: isActive('/wallet') ? 'var(--accent-purple)' : 'var(--bg-secondary)',
                  border: isActive('/wallet') ? 'none' : '2px solid var(--border-color)',
                  boxShadow: isActive('/wallet') ? '0 4px 12px rgba(139, 92, 246, 0.3)' : '0 2px 8px var(--shadow)',
                  transform: isActive('/wallet') ? 'translateY(-1px)' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/wallet')) {
                    e.target.style.background = 'var(--bg-tertiary)';
                    e.target.style.borderColor = 'var(--accent-purple)';
                    e.target.style.color = 'var(--accent-purple)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px var(--shadow)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/wallet')) {
                    e.target.style.background = 'var(--bg-secondary)';
                    e.target.style.borderColor = 'var(--border-color)';
                    e.target.style.color = 'var(--text-primary)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px var(--shadow)';
                  }
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(0) scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = isActive('/wallet') ? 'translateY(-1px) scale(1)' : 'translateY(-2px) scale(1)';
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Wallet
              </Link>
              <Link 
                to="/history" 
                className="mobile-menu-link"
                style={{ 
                  color: isActive('/history') ? 'white' : 'var(--text-primary)', 
                  textDecoration: 'none', 
                  padding: '1rem 1.5rem', 
                  borderRadius: '0.75rem', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '1rem',
                  fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: '600',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '300px',
                  background: isActive('/history') ? 'var(--accent-purple)' : 'var(--bg-secondary)',
                  border: isActive('/history') ? 'none' : '2px solid var(--border-color)',
                  boxShadow: isActive('/history') ? '0 4px 12px rgba(139, 92, 246, 0.3)' : '0 2px 8px var(--shadow)',
                  transform: isActive('/history') ? 'translateY(-1px)' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/history')) {
                    e.target.style.background = 'var(--bg-tertiary)';
                    e.target.style.borderColor = 'var(--accent-purple)';
                    e.target.style.color = 'var(--accent-purple)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px var(--shadow)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/history')) {
                    e.target.style.background = 'var(--bg-secondary)';
                    e.target.style.borderColor = 'var(--border-color)';
                    e.target.style.color = 'var(--text-primary)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px var(--shadow)';
                  }
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(0) scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = isActive('/history') ? 'translateY(-1px) scale(1)' : 'translateY(-2px) scale(1)';
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                History
              </Link>
              <Link 
                to="/faq" 
                className="mobile-menu-link"
                style={{ 
                  color: isActive('/faq') ? 'white' : 'var(--text-primary)', 
                  textDecoration: 'none', 
                  padding: '1rem 1.5rem', 
                  borderRadius: '0.75rem', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '1rem',
                  fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: '600',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '300px',
                  background: isActive('/faq') ? 'var(--accent-purple)' : 'var(--bg-secondary)',
                  border: isActive('/faq') ? 'none' : '2px solid var(--border-color)',
                  boxShadow: isActive('/faq') ? '0 4px 12px rgba(139, 92, 246, 0.3)' : '0 2px 8px var(--shadow)',
                  transform: isActive('/faq') ? 'translateY(-1px)' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/faq')) {
                    e.target.style.background = 'var(--bg-tertiary)';
                    e.target.style.borderColor = 'var(--accent-purple)';
                    e.target.style.color = 'var(--accent-purple)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px var(--shadow)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/faq')) {
                    e.target.style.background = 'var(--bg-secondary)';
                    e.target.style.borderColor = 'var(--border-color)';
                    e.target.style.color = 'var(--text-primary)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px var(--shadow)';
                  }
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(0) scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = isActive('/faq') ? 'translateY(-1px) scale(1)' : 'translateY(-2px) scale(1)';
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link 
                to="/profile" 
                className="mobile-menu-link"
                style={{ 
                  color: isActive('/profile') ? 'white' : 'var(--text-primary)', 
                  textDecoration: 'none', 
                  padding: '1rem 1.5rem', 
                  borderRadius: '0.75rem', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '1rem',
                  fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: '600',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '300px',
                  background: isActive('/profile') ? 'var(--accent-purple)' : 'var(--bg-secondary)',
                  border: isActive('/profile') ? 'none' : '2px solid var(--border-color)',
                  boxShadow: isActive('/profile') ? '0 4px 12px rgba(139, 92, 246, 0.3)' : '0 2px 8px var(--shadow)',
                  transform: isActive('/profile') ? 'translateY(-1px)' : 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive('/profile')) {
                    e.target.style.background = 'var(--bg-tertiary)';
                    e.target.style.borderColor = 'var(--accent-purple)';
                    e.target.style.color = 'var(--accent-purple)';
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px var(--shadow)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive('/profile')) {
                    e.target.style.background = 'var(--bg-secondary)';
                    e.target.style.borderColor = 'var(--border-color)';
                    e.target.style.color = 'var(--text-primary)';
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px var(--shadow)';
                  }
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(0) scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = isActive('/profile') ? 'translateY(-1px) scale(1)' : 'translateY(-2px) scale(1)';
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Profile
              </Link>
              <Link 
                to="/login" 
                className="mobile-menu-link"
                style={{ 
                  color: 'var(--text-primary)', 
                  textDecoration: 'none', 
                  padding: '1rem 1.5rem', 
                  borderRadius: '0.75rem', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '1rem',
                  fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: '600',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '300px',
                  background: 'var(--bg-secondary)',
                  border: '2px solid var(--border-color)',
                  boxShadow: '0 2px 8px var(--shadow)',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'var(--bg-tertiary)';
                  e.target.style.borderColor = 'var(--accent-purple)';
                  e.target.style.color = 'var(--accent-purple)';
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 25px var(--shadow)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--bg-secondary)';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.color = 'var(--text-primary)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px var(--shadow)';
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(0) scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = 'translateY(-2px) scale(1)';
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="mobile-menu-link"
                style={{ 
                  background: 'var(--text-accent)',
                  color: 'white', 
                  textDecoration: 'none', 
                  padding: '1rem 1.5rem', 
                  borderRadius: '0.75rem', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  fontSize: '1rem',
                  fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: '700',
                  textAlign: 'center',
                  width: '100%',
                  maxWidth: '300px',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
                  transform: 'translateY(0)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#9333EA';
                  e.target.style.transform = 'translateY(-3px)';
                  e.target.style.boxShadow = '0 12px 30px rgba(139, 92, 246, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--text-accent)';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
                }}
                onMouseDown={(e) => {
                  e.target.style.transform = 'translateY(-1px) scale(0.98)';
                }}
                onMouseUp={(e) => {
                  e.target.style.transform = 'translateY(-3px) scale(1)';
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;