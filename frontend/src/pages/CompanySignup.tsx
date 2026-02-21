import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

const CompanySignup: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signupWithGoogle, isAuthenticated, currentProfile } = useAuth();
  const navigate = useNavigate();

  // If user is already authenticated with a company profile, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated && currentProfile?.type === 'company') {
      navigate('/company/dashboard');
    }
  }, [isAuthenticated, currentProfile, navigate]);

  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await signupWithGoogle();
      // Redirect to auth callback for profile setup
    } catch (err: any) {
      console.error('Google signup error:', err);
      setError(err.message || 'Failed to sign up with Google. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-blue-900/40 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-blue-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Company Signup</h1>
          <p className="text-blue-300 mt-2">Sign up with Google to create your company profile</p>
        </div>
        
        <div className="space-y-4">
          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-red-300 mb-4">
              {error}
            </div>
          )}
          
          <button
            onClick={handleGoogleSignup}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center px-4 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            ) : (
              <>
                <FcGoogle className="h-5 w-5 mr-3" />
                Sign up with Google
              </>
            )}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-blue-300 text-sm">
            Already have an account?{' '}
            <Link to="/company/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign in here
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <p className="text-blue-300 text-sm">
            Looking to join as a vendor?{' '}
            <Link to="/vendor/signup" className="text-green-400 hover:text-green-300 font-medium">
              Vendor Signup
            </Link>
          </p>
        </div>

        <div className="mt-6 border-t border-blue-700 pt-6">
          <div className="bg-blue-800/30 rounded-lg p-4">
            <h3 className="text-blue-200 font-medium mb-2">🏢 Company Benefits</h3>
            <ul className="text-blue-300 text-sm space-y-1">
              <li>• Post RFQ/tenders for your business needs</li>
              <li>• Connect with verified vendor network</li>
              <li>• Secure blockchain-powered transactions</li>
              <li>• Professional vendor management tools</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySignup;
