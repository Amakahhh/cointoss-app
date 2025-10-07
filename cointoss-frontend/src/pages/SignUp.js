import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const SignUp = () => {
  const { register } = useStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
    minLength: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual client ID
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true
        });
      }
    };

    // Wait for Google script to load
    const checkGoogle = setInterval(() => {
      if (window.google) {
        clearInterval(checkGoogle);
        initializeGoogleSignIn();
      }
    }, 100);

    return () => clearInterval(checkGoogle);
  }, []);

  const handleGoogleSignIn = (response) => {
    try {
      // Decode the JWT token (in a real app, you'd verify this on your backend)
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      console.log('Google Sign-Up successful:', payload);
      
      // Split full name into first and last name
      const nameParts = payload.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Store user info (in a real app, you'd send this to your backend)
      localStorage.setItem('user', JSON.stringify({
        firstName: firstName,
        lastName: lastName,
        fullName: payload.name,
        email: payload.email,
        picture: payload.picture,
        provider: 'google'
      }));
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Google Sign-Up error:', error);
      alert('Google Sign-Up failed. Please try again.');
    }
  };

  const handleGoogleSignInClick = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      alert('Google Sign-In is not available. Please refresh the page and try again.');
    }
  };

  const checkPasswordStrength = (password) => {
    setPasswordStrength({
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      minLength: password.length >= 8
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      checkPasswordStrength(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Basic validation
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setError('Please enter both first and last name!');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match!');
        return;
      }

      // Check password strength
      const isStrongPassword = Object.values(passwordStrength).every(Boolean);
      if (!isStrongPassword) {
        setError('Password must meet all requirements!');
        return;
      }
      
      // Register with backend
      const userData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password
      };
      
      await register(userData);
      
      // Registration successful, redirect to home
      navigate('/');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    const strengthCount = Object.values(passwordStrength).filter(Boolean).length;
    if (strengthCount <= 2) return '#EF4444'; // Red
    if (strengthCount <= 3) return '#F59E0B'; // Orange
    if (strengthCount <= 4) return '#10B981'; // Green
    return '#059669'; // Dark Green
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(1rem, 3vw, 2rem)'
    }}>
      {/* Sign Up Card */}
      <div style={{
        background: 'var(--auth-container-bg)',
        borderRadius: 'clamp(1rem, 3vw, 1.5rem)',
        padding: 'clamp(2rem, 4vw, 3rem)',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 10px 25px var(--shadow)',
        border: '1px solid var(--border-color)'
      }}>
        {/* Sign Up Title */}
        <h1 style={{
          color: 'var(--text-primary)',
          fontSize: 'clamp(1.25rem, 3.5vw, 1.75rem)',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: 'clamp(1rem, 3vw, 1.5rem)',
          fontFamily: 'Rubik, -apple-system, BlinkMacSystemFont, sans-serif'
        }}>
          Create an Account
        </h1>
        
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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(0.75rem, 2.5vw, 1rem)' }}>
          {/* Name Fields */}
          <div style={{ display: 'flex', gap: 'clamp(0.5rem, 1.5vw, 0.75rem)' }}>
            {/* First Name Field */}
            <div style={{ flex: 1 }}>
              <label style={{
                color: 'var(--accent-purple)',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                fontWeight: '600',
                marginBottom: '0.375rem',
                display: 'block',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'clamp(0.375rem, 1.5vw, 0.5rem)',
                  padding: 'clamp(0.625rem, 2vw, 0.75rem)',
                  color: 'var(--text-primary)',
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                placeholder="First name"
                required
              />
            </div>

            {/* Last Name Field */}
            <div style={{ flex: 1 }}>
              <label style={{
                color: 'var(--accent-purple)',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                fontWeight: '600',
                marginBottom: '0.375rem',
                display: 'block',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'clamp(0.375rem, 1.5vw, 0.5rem)',
                  padding: 'clamp(0.625rem, 2vw, 0.75rem)',
                  color: 'var(--text-primary)',
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                placeholder="Last name"
                required
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label style={{
              color: 'var(--accent-purple)',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              fontWeight: '600',
              marginBottom: '0.375rem',
              display: 'block',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            }}>
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'clamp(0.375rem, 1.5vw, 0.5rem)',
                padding: 'clamp(0.625rem, 2vw, 0.75rem)',
                color: 'var(--text-primary)',
                fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                outline: 'none',
                transition: 'all 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              placeholder="Enter your email"
              required
            />
          </div>

          {/* Password Field */}
          <div>
            <label style={{
              color: 'var(--accent-purple)',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              fontWeight: '600',
              marginBottom: '0.375rem',
              display: 'block',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'clamp(0.375rem, 1.5vw, 0.5rem)',
                  padding: 'clamp(0.625rem, 2vw, 0.75rem)',
                  paddingRight: 'clamp(2rem, 4vw, 2.5rem)',
                  color: 'var(--text-primary)',
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  transition: 'color 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    height: '4px',
                    background: getPasswordStrengthColor(),
                    borderRadius: '2px',
                    transition: 'all 0.3s ease',
                    flex: '1'
                  }}></div>
                  <span style={{
                    color: getPasswordStrengthColor(),
                    fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                    fontWeight: '600',
                    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                  }}>
                    {Object.values(passwordStrength).filter(Boolean).length}/5
                  </span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.25rem',
                  fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ color: passwordStrength.minLength ? '#10B981' : '#6B7280' }}>
                      {passwordStrength.minLength ? '✓' : '○'}
                    </span>
                    <span style={{ color: passwordStrength.minLength ? '#10B981' : '#6B7280' }}>
                      8+ characters
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ color: passwordStrength.hasUpper ? '#10B981' : '#6B7280' }}>
                      {passwordStrength.hasUpper ? '✓' : '○'}
                    </span>
                    <span style={{ color: passwordStrength.hasUpper ? '#10B981' : '#6B7280' }}>
                      Uppercase
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ color: passwordStrength.hasLower ? '#10B981' : '#6B7280' }}>
                      {passwordStrength.hasLower ? '✓' : '○'}
                    </span>
                    <span style={{ color: passwordStrength.hasLower ? '#10B981' : '#6B7280' }}>
                      Lowercase
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ color: passwordStrength.hasNumber ? '#10B981' : '#6B7280' }}>
                      {passwordStrength.hasNumber ? '✓' : '○'}
                    </span>
                    <span style={{ color: passwordStrength.hasNumber ? '#10B981' : '#6B7280' }}>
                      Number
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', gridColumn: '1 / -1' }}>
                    <span style={{ color: passwordStrength.hasSpecial ? '#10B981' : '#6B7280' }}>
                      {passwordStrength.hasSpecial ? '✓' : '○'}
                    </span>
                    <span style={{ color: passwordStrength.hasSpecial ? '#10B981' : '#6B7280' }}>
                      Special character
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label style={{
              color: 'var(--accent-purple)',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              fontWeight: '600',
              marginBottom: '0.375rem',
              display: 'block',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
            }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'clamp(0.375rem, 1.5vw, 0.5rem)',
                  padding: 'clamp(0.625rem, 2vw, 0.75rem)',
                  paddingRight: 'clamp(2rem, 4vw, 2.5rem)',
                  color: 'var(--text-primary)',
                  fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent-purple)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                placeholder="Confirm your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: 'clamp(0.5rem, 1.5vw, 0.75rem)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                  transition: 'color 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                {showConfirmPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Sign Up Button */}
          <button 
            type="submit" 
            disabled={isLoading}
            style={{
              background: isLoading ? '#9CA3AF' : 'var(--accent-purple)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 'clamp(0.75rem, 2.5vw, 1rem)',
              padding: 'clamp(0.625rem, 2vw, 0.75rem)',
              fontSize: 'clamp(0.75rem, 2vw, 0.875rem)',
              fontWeight: '600',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              width: '100%',
              marginTop: 'clamp(0.25rem, 1vw, 0.5rem)',
              opacity: isLoading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.background = '#9333EA';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 8px 20px rgba(122, 70, 236, 0.3)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.background = 'var(--accent-purple)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Google Sign In */}
        <div style={{ marginTop: 'clamp(1rem, 3vw, 1.25rem)' }}>
          <div style={{ 
            position: 'relative',
            marginBottom: 'clamp(0.75rem, 2vw, 1rem)'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                width: '100%',
                height: '1px',
                background: 'var(--border-color)'
              }}></div>
            </div>
            <div style={{
              position: 'relative',
              display: 'flex',
              justifyContent: 'center'
            }}>
              <span style={{
                padding: '0 clamp(0.375rem, 1.5vw, 0.75rem)',
                background: 'var(--auth-container-bg)',
                color: 'var(--text-secondary)',
                fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
              }}>
                Or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignInClick}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 'clamp(0.625rem, 2vw, 0.75rem)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'clamp(0.75rem, 2.5vw, 1rem)',
                fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
                fontWeight: '500',
                fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                gap: 'clamp(0.375rem, 1vw, 0.5rem)'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--bg-tertiary)';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 5px 15px var(--shadow)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'var(--bg-secondary)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24"
              style={{ flexShrink: 0 }}
            >
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        {/* Login Link */}
        <p style={{
          marginTop: 'clamp(1rem, 3vw, 1.25rem)',
          textAlign: 'center',
          color: 'var(--text-primary)',
          fontSize: 'clamp(0.625rem, 1.5vw, 0.75rem)',
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
        }}>
          Already have an account?{' '}
          <Link 
            to="/login" 
            style={{
              color: 'var(--accent-blue)',
              textDecoration: 'none',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#60A5FA'}
            onMouseLeave={(e) => e.target.style.color = 'var(--accent-blue)'}
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;