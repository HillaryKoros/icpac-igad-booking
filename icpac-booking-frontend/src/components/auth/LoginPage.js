import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';
import './Auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  
  // Mode: 'login', 'signup', 'forgot'
  const [mode, setMode] = useState('login');
  
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Signup state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Signup
  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      await apiService.post('/auth/register/', {
        username: signupData.email.split('@')[0],
        email: signupData.email,
        password: signupData.password,
        first_name: signupData.name.split(' ')[0] || '',
        last_name: signupData.name.split(' ').slice(1).join(' ') || ''
      });

      setSuccess('Account created successfully! Please sign in.');
      setTimeout(() => {
        setMode('login');
        setEmail(signupData.email);
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.email?.[0] || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiService.post('/auth/password-reset/', {
        email: forgotEmail
      });

      setSuccess('Password reset instructions have been sent to your email address.');
      setTimeout(() => {
        setMode('login');
        setSuccess('');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupChange = (e) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
  };

  return (
    <div className="auth-page-container">
      {/* Animated Background Slideshow */}
      <div className="auth-background-slideshow">
        <div className="auth-background-slide"></div>
        <div className="auth-background-slide"></div>
        <div className="auth-background-slide"></div>
        <div className="auth-background-slide"></div>
        <div className="auth-background-slide"></div>
      </div>

      <div className="auth-page-wrapper">
        {/* Split Layout */}
        <div className={`auth-split-layout ${mode === 'signup' ? 'reverse-layout' : ''}`}>
          {/* Branding Side */}
          <div className="auth-branding-side">
            <div className="branding-content">
              <img
                src="/ICPAC_Website_Header_Logo.svg"
                alt="ICPAC Logo"
                className="branding-logo-img"
              />
              <h1 className="branding-main-title">ICPAC INTERNAL BOOKING SYSTEM</h1>
              <p className="branding-description">Manage conference rooms and meeting spaces efficiently</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="auth-form-section">
            {/* LOGIN MODE */}
            {mode === 'login' && (
              <>
                <div className="auth-form-header">
                  <h3 className="auth-form-title">Sign In</h3>
                  <p className="auth-form-subtitle">Enter your credentials to continue</p>
                </div>

                {error && <div className="auth-error-message">{error}</div>}
                {success && <div className="auth-success-message">{success}</div>}

                <form onSubmit={handleLogin} className="auth-form">
                  <div className="floating-label-group">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`floating-input ${email ? 'has-value' : ''}`}
                      required
                      id="login-email"
                      autoComplete="email"
                    />
                    <label htmlFor="login-email" className="floating-label">
                      Email Address
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`floating-input ${password ? 'has-value' : ''}`}
                      required
                      id="login-password"
                      autoComplete="current-password"
                    />
                    <label htmlFor="login-password" className="floating-label">
                      Password
                    </label>
                  </div>

                  <div className="forgot-password-link">
                    <span 
                      className="auth-switch-link" 
                      onClick={() => switchMode('forgot')}
                    >
                      Forgot Password?
                    </span>
                  </div>

                  <div className="auth-form-actions">
                    <button 
                      type="submit" 
                      className="auth-primary-btn"
                      disabled={loading}
                    >
                      {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                  </div>
                </form>

                <div className="auth-form-footer">
                  <p className="auth-switch-text">
                    Don't have an account? {' '}
                    <span 
                      className="auth-switch-link" 
                      onClick={() => switchMode('signup')}
                    >
                      Sign up here
                    </span>
                  </p>
                </div>
              </>
            )}

            {/* SIGNUP MODE */}
            {mode === 'signup' && (
              <>
                <div className="auth-form-header">
                  <h3 className="auth-form-title">Create Account</h3>
                  <p className="auth-form-subtitle">Fill in your details to get started</p>
                </div>

                {error && <div className="auth-error-message">{error}</div>}
                {success && <div className="auth-success-message">{success}</div>}

                <form onSubmit={handleSignup} className="auth-form">
                  <div className="floating-label-group">
                    <input
                      type="text"
                      name="name"
                      value={signupData.name}
                      onChange={handleSignupChange}
                      className={`floating-input ${signupData.name ? 'has-value' : ''}`}
                      required
                      id="signup-name"
                      autoComplete="name"
                    />
                    <label htmlFor="signup-name" className="floating-label">
                      Full Name
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      type="email"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      className={`floating-input ${signupData.email ? 'has-value' : ''}`}
                      required
                      id="signup-email"
                      autoComplete="email"
                    />
                    <label htmlFor="signup-email" className="floating-label">
                      Email Address
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      type="password"
                      name="password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      className={`floating-input ${signupData.password ? 'has-value' : ''}`}
                      required
                      id="signup-password"
                      autoComplete="new-password"
                      minLength="6"
                    />
                    <label htmlFor="signup-password" className="floating-label">
                      Password
                    </label>
                  </div>

                  <div className="floating-label-group">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      className={`floating-input ${signupData.confirmPassword ? 'has-value' : ''}`}
                      required
                      id="signup-confirm-password"
                      autoComplete="new-password"
                    />
                    <label htmlFor="signup-confirm-password" className="floating-label">
                      Confirm Password
                    </label>
                  </div>

                  <div className="auth-form-actions">
                    <button 
                      type="submit" 
                      className="auth-primary-btn"
                      disabled={loading}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>
                </form>

                <div className="auth-form-footer">
                  <p className="auth-switch-text">
                    Already have an account? {' '}
                    <span 
                      className="auth-switch-link" 
                      onClick={() => switchMode('login')}
                    >
                      Sign in here
                    </span>
                  </p>
                </div>
              </>
            )}

            {/* FORGOT PASSWORD MODE */}
            {mode === 'forgot' && (
              <>
                <div className="auth-form-header">
                  <h3 className="auth-form-title">Forgot Password</h3>
                  <p className="auth-form-subtitle">Enter your email to receive reset instructions</p>
                </div>

                {error && <div className="auth-error-message">{error}</div>}
                {success && <div className="auth-success-message">{success}</div>}

                <form onSubmit={handleForgotPassword} className="auth-form">
                  <div className="floating-label-group">
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className={`floating-input ${forgotEmail ? 'has-value' : ''}`}
                      required
                      id="forgot-email"
                      autoComplete="email"
                    />
                    <label htmlFor="forgot-email" className="floating-label">
                      Email Address
                    </label>
                  </div>

                  <div className="auth-form-actions">
                    <button 
                      type="button"
                      className="auth-secondary-btn"
                      onClick={() => switchMode('login')}
                    >
                      Back to Login
                    </button>
                    <button 
                      type="submit" 
                      className="auth-primary-btn"
                      disabled={loading}
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>

                <div className="auth-form-footer">
                  <p className="auth-switch-text">
                    Remember your password? {' '}
                    <span 
                      className="auth-switch-link" 
                      onClick={() => switchMode('login')}
                    >
                      Sign in here
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
