import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import apiService from '../../services/api';
import './Auth.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  
  // Mode: 'login', 'signup', 'forgot', 'verify'
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

  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');

  // OTP verification state
  const [otpCode, setOtpCode] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');

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

    if (passwordStrength.strength === 'weak') {
      setError('Password is too weak. Please use a stronger password with at least 8 characters, including uppercase, lowercase, numbers, and special characters.');
      return;
    }

    setLoading(true);

    try {
      await apiService.register({
        username: signupData.email.split('@')[0],
        email: signupData.email,
        password: signupData.password,
        password_confirm: signupData.confirmPassword,
        first_name: signupData.name.split(' ')[0] || '',
        last_name: signupData.name.split(' ').slice(1).join(' ') || ''
      });

      setSuccess('Account created successfully! Please check your email for the verification code.');
      setVerifyEmail(signupData.email);
      setTimeout(() => {
        setMode('verify');
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
      // Note: Password reset endpoint needs to be implemented in backend
      const response = await apiService.request('/auth/password-reset/', {
        method: 'POST',
        body: JSON.stringify({ email: forgotEmail })
      });

      if (response.ok) {
        setSuccess('Password reset instructions have been sent to your email address.');
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 3000);
      } else {
        throw new Error('Failed to send reset email');
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP Verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await apiService.verifyEmail(verifyEmail, otpCode);

      // Check if the response includes authentication tokens (auto-login)
      if (response.access && response.refresh) {
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
        }
        apiService.token = response.access;

        setSuccess('Email verified successfully! Logging you in...');
        setTimeout(() => {
          login(verifyEmail, null, response);
          navigate('/');
        }, 1500);
      } else {
        // No auto-login, redirect to login page
        setSuccess('Email verified successfully! You can now sign in.');
        setTimeout(() => {
          setMode('login');
          setEmail(verifyEmail);
          setSuccess('');
          setOtpCode('');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiService.resendOTP(verifyEmail);
      setSuccess('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again.');
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

  // Password strength checker
  const getPasswordStrength = (password) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    Object.values(checks).forEach(check => {
      if (check) score++;
    });

    if (score <= 2) return { strength: 'weak', color: '#ef4444', message: 'Weak password' };
    if (score <= 3) return { strength: 'fair', color: '#f59e0b', message: 'Fair password' };
    if (score <= 4) return { strength: 'good', color: '#10b981', message: 'Good password' };
    return { strength: 'strong', color: '#059669', message: 'Strong password' };
  };

  // Check if passwords match
  const passwordsMatch = signupData.password && signupData.confirmPassword && 
                        signupData.password === signupData.confirmPassword;

  const passwordStrength = getPasswordStrength(signupData.password);

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

                  <div className="floating-label-group password-field">
                    <input
                      type={showPassword ? "text" : "password"}
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
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      {showPassword ? (
                        <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                    {signupData.password && (
                      <div className="password-strength-indicator">
                        <div className="strength-bar">
                          <div 
                            className="strength-fill" 
                            style={{ 
                              width: `${(passwordStrength.strength === 'weak' ? 25 : passwordStrength.strength === 'fair' ? 50 : passwordStrength.strength === 'good' ? 75 : 100)}%`,
                              backgroundColor: passwordStrength.color
                            }}
                          ></div>
                        </div>
                        <span 
                          className="strength-text" 
                          style={{ color: passwordStrength.color }}
                        >
                          {passwordStrength.message}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="floating-label-group password-field">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
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
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex="-1"
                    >
                      {showConfirmPassword ? (
                        <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                          <line x1="1" y1="1" x2="23" y2="23"/>
                        </svg>
                      ) : (
                        <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      )}
                    </button>
                    {signupData.confirmPassword && (
                      <div className="password-match-indicator">
                        {passwordsMatch ? (
                          <div className="match-success">
                            <svg className="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <polyline points="20,6 9,17 4,12"/>
                            </svg>
                            <span>Passwords match</span>
                          </div>
                        ) : (
                          <div className="match-error">
                            <svg className="x-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                            <span>Passwords don't match</span>
                          </div>
                        )}
                      </div>
                    )}
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

            {/* VERIFY OTP MODE */}
            {mode === 'verify' && (
              <>
                <div className="auth-form-header">
                  <h3 className="auth-form-title">Verify Email</h3>
                  <p className="auth-form-subtitle">Enter the verification code sent to {verifyEmail}</p>
                </div>

                {error && <div className="auth-error-message">{error}</div>}
                {success && <div className="auth-success-message">{success}</div>}

                <form onSubmit={handleVerifyOTP} className="auth-form">
                  <div className="floating-label-group">
                    <input
                      type="text"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className={`floating-input ${otpCode ? 'has-value' : ''}`}
                      required
                      id="otp-code"
                      autoComplete="off"
                      maxLength="6"
                      placeholder=" "
                    />
                    <label htmlFor="otp-code" className="floating-label">
                      Verification Code
                    </label>
                  </div>

                  <div className="auth-form-actions">
                    <button
                      type="submit"
                      className="auth-primary-btn"
                      disabled={loading}
                    >
                      {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                  </div>
                </form>

                <div className="auth-form-footer">
                  <p className="auth-switch-text">
                    Didn't receive the code? {' '}
                    <span
                      className="auth-switch-link"
                      onClick={handleResendOTP}
                    >
                      Resend Code
                    </span>
                  </p>
                  <p className="auth-switch-text">
                    <span
                      className="auth-switch-link"
                      onClick={() => switchMode('login')}
                    >
                      Back to Login
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
