import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';

const JoinPlatformSection: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { loginWithGoogle } = useAuth();

  const handleLogin = async (userType: 'company' | 'vendor') => {
    setIsLoggingIn(userType);
    setError(null);

    try {
      if (userType === 'vendor') {
        localStorage.setItem('intended_profile_type', 'vendor');
      }
      await loginWithGoogle();
      // The auth callback will handle profile selection
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login with Google. Please try again.');
    } finally {
      setIsLoggingIn(null);
    }
  };

  return (
    <section id="join-platform" className="py-20 bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Join the RAPP Platform
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Transform your business with our revolutionary platform. Choose your path to success.
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-300 mb-8 max-w-md mx-auto">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Company Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Company
              </h3>
              <p className="text-blue-200 mb-6">
                Get started with our platform to manage your company's procurement needs and connect with trusted vendors.
              </p>
              <button
                onClick={() => handleLogin('company')}
                disabled={isLoggingIn !== null}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 px-4 rounded-lg shadow-md flex items-center justify-center space-x-3 transition-all duration-200 disabled:opacity-70"
              >
                {isLoggingIn === 'company' ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting Started...
                  </span>
                ) : (
                  <>
                    <FcGoogle className="w-5 h-5" />
                    <span className="font-medium">Get Started</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Vendor Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Vendor
              </h3>
              <p className="text-blue-200 mb-6">
                Get started as a vendor to access exclusive auctions and connect with companies looking for your services.
              </p>
              <button
                onClick={() => handleLogin('vendor')}
                disabled={isLoggingIn !== null}
                className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 px-4 rounded-lg shadow-md flex items-center justify-center space-x-3 transition-all duration-200 disabled:opacity-70"
              >
                {isLoggingIn === 'vendor' ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Getting Started...
                  </span>
                ) : (
                  <>
                    <FcGoogle className="w-5 h-5" />
                    <span className="font-medium">Get Started</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Features */}
        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Lightning Fast</h4>
              <p className="text-blue-300 text-sm">Get started in minutes, not hours</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Secure & Reliable</h4>
              <p className="text-blue-300 text-sm">Enterprise-grade security you can trust</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">24/7 Support</h4>
              <p className="text-blue-300 text-sm">We're here whenever you need us</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinPlatformSection;
