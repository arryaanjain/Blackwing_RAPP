import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

const VendorLogin: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loginWithGoogle, isAuthenticated, currentProfile } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated with a vendor profile, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated && currentProfile?.type === 'vendor') {
      navigate('/vendor/dashboard');
    }
  }, [isAuthenticated, currentProfile, navigate]);

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setError(null);

    try {
      // Store the intended profile type before OAuth
      localStorage.setItem('intended_profile_type', 'vendor');
      await loginWithGoogle();
      // The auth callback will handle profile selection
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login with Google. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-blue-900/40 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-blue-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Vendor Login</h1>
          <p className="text-blue-300 mt-2">Sign in with Google to access vendor auctions</p>
        </div>
        
        <div className="space-y-4">
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-red-300 mb-4">
              {error}
            </div>
          )}
          
          <button
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 px-4 rounded-lg shadow-md flex items-center justify-center space-x-3 transition-all duration-200 disabled:opacity-70"
          >
            {isLoggingIn ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              <>
                <FcGoogle className="w-5 h-5" />
                <span className="font-medium">Continue with Google</span>
              </>
            )}
          </button>
          
          <div className="text-center text-sm text-blue-300">
            <p>
              New vendor?{' '}
              <Link to="/signup/vendor" className="text-blue-400 hover:text-blue-300 font-medium">
                Create a vendor account
              </Link>
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <Link to="/" className="text-blue-400 hover:text-blue-300 flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </div>
      
      <div className="mt-6 text-center max-w-md">
        <p className="text-blue-300 text-sm">
          Secure authentication powered by Google OAuth.
          Your data is protected and encrypted.
        </p>
      </div>
    </div>
  );
};

export default VendorLogin;
