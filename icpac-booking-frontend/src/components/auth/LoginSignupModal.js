import React, { useState } from 'react';
import apiService from '../../services/api';

const LoginSignupModal = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    } else if (!formData.email.endsWith('@icpac.net') && !formData.email.endsWith('@igad.int')) {
      newErrors.email = 'Email must be from @icpac.net or @igad.int domain';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        // Login flow
        const response = await apiService.login(formData.email, formData.password);

        if (response.requires_verification) {
          // User exists but needs email verification
          const userData = {
            email: formData.email,
            firstName: response.user?.first_name || 'User',
            lastName: response.user?.last_name || '',
            needsOTP: true
          };
          onLoginSuccess(userData);
        } else {
          // User is fully authenticated
          const userData = {
            email: formData.email,
            firstName: response.user?.first_name || 'User',
            lastName: response.user?.last_name || '',
            token: response.access,
            isVerified: true
          };

          // Store tokens
          localStorage.setItem('access_token', response.access);
          localStorage.setItem('refresh_token', response.refresh);
          localStorage.setItem('user', JSON.stringify(response.user));

          onLoginSuccess(userData);
        }
      } else {
        // Registration flow
        const registrationData = {
          email: formData.email,
          password: formData.password,
          password_confirm: formData.confirmPassword,
          first_name: formData.firstName,
          last_name: formData.lastName,
        };

        const response = await apiService.register(registrationData);

        // Registration successful, now needs OTP verification
        const userData = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          needsOTP: true
        };

        onLoginSuccess(userData);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setErrors({ submit: error.message || 'Authentication failed. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      confirmPassword: ''
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center p-4 auth-container">
      <div className="max-w-md w-full">
        {/* ICPAC Header */}
        <div className="text-center mb-8 auth-header">
          <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg auth-logo">
            <span className="text-green-600 text-2xl font-bold">🌍</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 auth-title">ICPAC BOOKING SYSTEM</h1>
          <p className="text-green-100 auth-subtitle">Reserve your meeting space with ease</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-lg shadow-xl p-8 auth-card">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-gray-600 mt-2">
              {isLogin
                ? 'Sign in to access your booking dashboard'
                : 'Join us to start booking meeting rooms'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1 form-label">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent form-input ${
                      errors.firstName ? 'border-red-500 error' : 'border-gray-300'
                    }`}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-red-500 text-sm mt-1 error-message">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="your.email@icpac.net"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            )}

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed btn-primary"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {isLogin ? 'Signing In...' : 'Creating Account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={toggleMode}
                className="text-green-600 hover:text-green-700 font-medium"
              >
                {isLogin ? 'Sign up here' : 'Sign in here'}
              </button>
            </p>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 demo-info">
            <p className="text-blue-800 text-sm font-medium mb-1 demo-title">Demo Credentials:</p>
            <p className="text-blue-700 text-sm demo-text">Email: admin@icpac.net</p>
            <p className="text-blue-700 text-sm demo-text">Password: admin123</p>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-green-100 text-sm">
            © 2025 ICPAC. All rights reserved. v1.0
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupModal;