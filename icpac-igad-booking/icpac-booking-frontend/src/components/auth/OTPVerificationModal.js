import React, { useState, useEffect, useRef } from 'react';
import apiService from '../../services/api';

const OTPVerificationModal = ({ user, onSuccess, onBack }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleInputChange = (index, value) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      // Focus previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      setError('');
      // Auto-verify pasted OTP
      handleVerifyOTP(pastedData);
    }
  };

  const handleVerifyOTP = async (otpCode) => {
    setLoading(true);
    setError('');

    try {
      // Call the real API to verify OTP
      const response = await apiService.verifyEmail(user.email, otpCode);

      if (response.access) {
        // OTP verification successful
        const authenticatedUser = {
          ...user,
          ...response.user,
          token: response.access,
          isVerified: true
        };

        // Store tokens and user data
        localStorage.setItem('access_token', response.access);
        localStorage.setItem('refresh_token', response.refresh);
        localStorage.setItem('user', JSON.stringify(response.user));

        onSuccess(authenticatedUser);
      } else {
        throw new Error('Invalid OTP code');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      setError(error.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = () => {
    const otpCode = otp.join('');
    if (otpCode.length === 6) {
      handleVerifyOTP(otpCode);
    } else {
      setError('Please enter all 6 digits');
    }
  };

  const handleResendOTP = async () => {
    setCanResend(false);
    setResendCountdown(30);
    setError('');

    try {
      // Call the real API to resend OTP
      await apiService.resendOTP(user.email);

      // Restart countdown
      const timer = setInterval(() => {
        setResendCountdown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Clear error to show success
      setError('');
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(error.message || 'Failed to resend OTP. Please try again.');
      setCanResend(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center shadow-lg">
            <span className="text-green-600 text-2xl">📧</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-green-100">
            We've sent a 6-digit code to
          </p>
          <p className="text-white font-medium">{user?.email}</p>
        </div>

        {/* OTP Form */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Enter Verification Code
            </h2>
            <p className="text-gray-600">
              Enter the 6-digit code sent to your email
            </p>
          </div>

          {/* OTP Input */}
          <div className="flex justify-center space-x-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className={`w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors ${
                  error ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-red-600 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Demo OTP Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-blue-800 text-sm font-medium mb-1">Demo Mode:</p>
            <p className="text-blue-700 text-sm">Use OTP: 123456 or any 6-digit code</p>
          </div>

          {/* Verify Button */}
          <button
            onClick={handleManualSubmit}
            disabled={loading || otp.some(digit => digit === '')}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Verifying...
              </span>
            ) : (
              'Verify Code'
            )}
          </button>

          {/* Resend Section */}
          <div className="text-center">
            <p className="text-gray-600 text-sm mb-2">
              Didn't receive the code?
            </p>
            {canResend ? (
              <button
                onClick={handleResendOTP}
                className="text-green-600 hover:text-green-700 font-medium text-sm"
              >
                Resend Code
              </button>
            ) : (
              <p className="text-gray-500 text-sm">
                Resend in {resendCountdown}s
              </p>
            )}
          </div>

          {/* Back Button */}
          <div className="mt-6 text-center">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 text-sm"
            >
              ← Back to login
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-green-100 text-sm">
            © 2025 ICPAC. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerificationModal;