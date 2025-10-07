import React from 'react';
import { Facebook, Instagram, Linkedin, Wallet } from 'lucide-react';

const Footer = () => {
  return (
    <footer style={{
      background: 'var(--footer-bg)',
      padding: 'clamp(2rem, 5vw, 3rem) 0',
      marginTop: 'clamp(2rem, 5vw, 4rem)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Top Curved Glowing Border */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '8px',
        background: 'linear-gradient(90deg, transparent 0%, var(--accent-purple) 20%, var(--accent-blue) 50%, var(--accent-purple) 80%, transparent 100%)',
        boxShadow: '0 0 20px var(--accent-purple), 0 0 40px rgba(139, 92, 246, 0.3), 0 0 60px rgba(139, 92, 246, 0.2)',
        borderRadius: '0 0 100% 100%',
        transform: 'translateY(-4px)',
        clipPath: 'ellipse(100% 100% at 50% 0%)'
      }} />
      
      {/* Additional Curved Shadow */}
      <div style={{
        position: 'absolute',
        top: '2px',
        left: 0,
        right: 0,
        height: '6px',
        background: 'linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.3) 20%, rgba(37, 99, 235, 0.3) 50%, rgba(139, 92, 246, 0.3) 80%, transparent 100%)',
        borderRadius: '0 0 100% 100%',
        transform: 'translateY(-2px)',
        clipPath: 'ellipse(100% 100% at 50% 0%)'
      }} />
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 clamp(1rem, 3vw, 2rem)'
      }}>
        {/* Main Footer Content */}
        <div className="footer-main-content" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 'clamp(1rem, 3vw, 2rem)',
          marginBottom: '2rem'
        }}>
          {/* Logo Section */}
          <div className="footer-logo-section" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {/* Logo Icon */}
            <div style={{
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <img 
                src="/logo.svg" 
                alt="CoinToss Logo" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  // Fallback if logo.svg doesn't exist
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback Logo */}
              <div style={{
                width: '100%',
                height: '100%',
                background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)',
                borderRadius: '12px',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  background: 'white',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  color: 'var(--accent-purple)'
                }}>
                  C
                </div>
              </div>
            </div>
            
            {/* Brand Name */}
            <h2 style={{
              color: 'var(--text-primary)',
              fontSize: 'clamp(1.25rem, 3vw, 1.5rem)',
              fontWeight: '700',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              margin: 0
            }}>
              CoinToss
            </h2>
          </div>

          {/* Navigation Links */}
          <div className="footer-nav-links" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(1rem, 2vw, 2rem)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <a href="/betting" style={{
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              fontWeight: '500',
              transition: 'color 0.3s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--accent-purple)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
            >
              Live Predictions
            </a>
            <a href="/wallet" style={{
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              fontWeight: '500',
              transition: 'color 0.3s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--accent-purple)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
            >
              Wallet
            </a>
            <a href="/history" style={{
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontSize: 'clamp(0.875rem, 2vw, 1rem)',
              fontWeight: '500',
              transition: 'color 0.3s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--accent-purple)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-primary)'}
            >
              History
            </a>
          </div>

          {/* Social Media Section */}
          <div className="footer-social-section" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(1rem, 2vw, 1.5rem)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <span style={{
              color: 'var(--text-secondary)',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              fontWeight: '500',
              whiteSpace: 'nowrap'
            }}>
              Follow us
            </span>
            
            {/* Social Media Icons */}
            <div className="footer-social-icons" style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(0.5rem, 1.5vw, 0.75rem)'
            }}>
              <a href="#" style={{
                width: 'clamp(36px, 8vw, 40px)',
                height: 'clamp(36px, 8vw, 40px)',
                background: 'var(--bg-tertiary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: '1px solid var(--border-color)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--accent-purple)';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--bg-tertiary)';
                e.target.style.color = 'var(--text-primary)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              >
                <Facebook size={18} />
              </a>
              
              <a href="#" style={{
                width: 'clamp(36px, 8vw, 40px)',
                height: 'clamp(36px, 8vw, 40px)',
                background: 'var(--bg-tertiary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: '1px solid var(--border-color)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--accent-purple)';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--bg-tertiary)';
                e.target.style.color = 'var(--text-primary)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              >
                <Instagram size={18} />
              </a>
              
              <a href="#" style={{
                width: 'clamp(36px, 8vw, 40px)',
                height: 'clamp(36px, 8vw, 40px)',
                background: 'var(--bg-tertiary)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                border: '1px solid var(--border-color)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--accent-purple)';
                e.target.style.color = 'white';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--bg-tertiary)';
                e.target.style.color = 'var(--text-primary)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Connect Wallet Button */}
          <button className="footer-wallet-button" style={{
            background: 'linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: 'clamp(0.625rem, 2vw, 0.75rem) clamp(1rem, 3vw, 1.5rem)',
            fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
          }}
          >
            <Wallet size={16} />
            Connect Wallet
          </button>
        </div>

        {/* Copyright Section */}
        <div style={{
          textAlign: 'center',
          paddingTop: '2rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <p style={{
            color: 'var(--footer-text)',
            fontSize: '0.875rem',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            margin: 0,
            fontWeight: '400'
          }}>
            © 2025 CoinToss. All Rights Reserved.
          </p>
        </div>
      </div>
      
      {/* Responsive CSS */}
      <style jsx>{`
        @media (max-width: 768px) {
          .footer-main-content {
            flex-direction: column !important;
            text-align: center !important;
            gap: 1.5rem !important;
          }
          
          .footer-logo-section {
            order: 1 !important;
          }
          
          .footer-nav-links {
            order: 2 !important;
            justify-content: center !important;
          }
          
          .footer-social-section {
            order: 3 !important;
            justify-content: center !important;
          }
          
          .footer-wallet-button {
            order: 4 !important;
            align-self: center !important;
          }
        }
        
        @media (max-width: 480px) {
          .footer-social-icons {
            gap: 0.5rem !important;
          }
          
          .footer-nav-links {
            gap: 1rem !important;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;