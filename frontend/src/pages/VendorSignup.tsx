import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

const VendorSignup: React.FC = () => {
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signupWithGoogle, isAuthenticated, currentProfile } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated with a vendor profile, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated && currentProfile?.type === 'vendor') {
      navigate('/vendor/dashboard');
    }
  }, [isAuthenticated, currentProfile, navigate]);

  const handleGoogleSignup = async () => {
    setIsSigningUp(true);
    setError(null);

    try {
      await signupWithGoogle();
      // The auth callback will handle profile creation
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to sign up with Google. Please try again.');
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-green-900/40 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-green-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Vendor Sign Up</h1>
          <p className="text-green-300 mt-2">Join RAPP as a vendor to offer your services to companies</p>
        </div>
        
        <div className="space-y-4">
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-red-300 mb-4">
              {error}
            </div>
          )}
          
          <button
            onClick={handleGoogleSignup}
            disabled={isSigningUp}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <FcGoogle size={20} />
            {isSigningUp ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                Signing up with Google...
              </div>
            ) : (
              'Sign up with Google'
            )}
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-green-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-green-900/40 text-green-300">or</span>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-green-300 text-sm">
              Email & password registration coming soon
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-green-300 text-sm">
            Already have an account?{' '}
            <Link to="/vendor/login" className="text-white hover:text-green-200 font-medium underline">
              Sign in here
            </Link>
          </p>
        </div>
        
        <div className="mt-4 text-center">
          <p className="text-green-400 text-sm">
            Looking to hire vendors?{' '}
            <Link to="/company/signup" className="text-white hover:text-green-200 font-medium underline">
              Sign up as a company
            </Link>
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-center max-w-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Why Join RAPP as a Vendor?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-green-200">
          <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
            <h3 className="font-semibold mb-2">Access to Companies</h3>
            <p className="text-sm">Connect with companies looking for your services</p>
          </div>
          <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
            <h3 className="font-semibold mb-2">Secure Bidding</h3>
            <p className="text-sm">Transparent and secure bidding process</p>
          </div>
          <div className="bg-green-900/30 p-4 rounded-lg border border-green-700">
            <h3 className="font-semibold mb-2">Grow Your Business</h3>
            <p className="text-sm">Expand your client base and increase revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorSignup;
