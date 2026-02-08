import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import LoginSignupModal from './LoginSignupModal';
import OTPVerificationModal from './OTPVerificationModal';

const AuthFlow = ({ children }) => {
  const { user } = useApp();
  const [authStep, setAuthStep] = useState('check'); // 'check', 'login', 'otp', 'authenticated'
  const [tempUser, setTempUser] = useState(null);

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem('access_token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser && user) {
      setAuthStep('authenticated');
    } else {
      setAuthStep('login');
    }
  }, [user]);

  const handleLoginSuccess = (userData) => {
    setTempUser(userData);
    setAuthStep('otp');
  };

  const handleOTPSuccess = (verifiedUser) => {
    setTempUser(null);
    setAuthStep('authenticated');
  };

  const handleBackToLogin = () => {
    setTempUser(null);
    setAuthStep('login');
  };

  if (authStep === 'check') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center">
        <div className="text-white text-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          Loading...
        </div>
      </div>
    );
  }

  if (authStep === 'login') {
    return <LoginSignupModal onLoginSuccess={handleLoginSuccess} />;
  }

  if (authStep === 'otp') {
    return (
      <OTPVerificationModal
        user={tempUser}
        onSuccess={handleOTPSuccess}
        onBack={handleBackToLogin}
      />
    );
  }

  if (authStep === 'authenticated') {
    return children;
  }

  return null;
};

export default AuthFlow;