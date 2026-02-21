import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/routes';
import authService from '../services/authService';

/**
 * AuthCallback Component
 *
 * Handles the OAuth callback flow after Google authentication:
 * 1. Receives encoded tokens from backend via URL parameter (?tokens=...)
 * 2. Decodes and stores tokens in localStorage via AuthContext
 * 3. Shows profile selection screen for users to choose Company or Vendor profile
 * 4. Handles both new profile creation and existing profile continuation
 *
 * Flow:
 * - User clicks "Sign in with Google" → /auth/google (backend)
 * - Backend redirects to Google OAuth
 * - Google redirects back to /auth/google/callback (backend)
 * - Backend processes OAuth and redirects to /auth/callback?tokens=... (frontend)
 * - This component decodes tokens and shows profile selection
 */

interface AuthCallbackProps {}

const AuthCallback: React.FC<AuthCallbackProps> = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    handleOAuthCallback, 
    user, 
    isAuthenticated,
    loading: authLoading,
    checkCompanyProfile,
    checkVendorProfile,
    fetchFreshUserData
  } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProfileSelection, setShowProfileSelection] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [hasCompanyProfile, setHasCompanyProfile] = useState(false);
  const [hasVendorProfile, setHasVendorProfile] = useState(false);

  // Extract encoded tokens from URL
  const extractTokensFromURL = (): string | null => {
    const searchParams = new URLSearchParams(location.search);
    const encodedTokens = searchParams.get('tokens');
    const error = searchParams.get('error');
    
    if (error) {
      throw new Error(decodeURIComponent(error));
    }
    
    return encodedTokens;
  };

  // Handle creating a new profile
  const handleCreateProfile = (type: 'company' | 'vendor') => {
    console.log('Creating profile type:', type);
    
    // Set the intended profile type in localStorage
    localStorage.setItem('intended_profile_type', type);
    console.log('Set intended_profile_type in localStorage:', type);
    
    if (type === 'company') {
      console.log('Navigating to:', ROUTES.PROTECTED.COMPANY.COMPLETE_PROFILE);
      navigate(ROUTES.PROTECTED.COMPANY.COMPLETE_PROFILE);
    } else {
      console.log('Navigating to:', ROUTES.PROTECTED.VENDOR.COMPLETE_PROFILE);
      navigate(ROUTES.PROTECTED.VENDOR.COMPLETE_PROFILE);
    }
  };

    // Handle continuing with existing profile
  const handleContinueAsProfile = async (type: 'company' | 'vendor') => {
    console.log('Continuing as profile type:', type);
    
    try {
      // First verify the profile exists
      if (type === 'company') {
        const result = await checkCompanyProfile();
        if (!result.has_company_profile) {
          setError('Company profile not found. Please create one first.');
          return;
        }
      } else {
        const result = await checkVendorProfile();
        if (!result.has_vendor_profile) {
          setError('Vendor profile not found. Please create one first.');
          return;
        }
      }
      
      // Use the new API to update the database
      console.log('Calling authService.switchProfile to update database...');
      await authService.switchProfile(type);
      console.log('Successfully updated current_profile_type in database');
      
      // Store the intended profile type for consistency
      localStorage.setItem('intended_profile_type', type);
      console.log('Set intended_profile_type in localStorage:', type);
      
      // Trigger AuthContext to reload user data and pick up the new current_profile
      console.log('Calling fetchFreshUserData to update user data...');
      await fetchFreshUserData();
      console.log('fetchFreshUserData completed');
      
      // Wait for the user state to actually update with the new profile type
      const waitForProfileUpdate = async () => {
        let attempts = 0;
        const maxAttempts = 10;
        
        while (attempts < maxAttempts) {
          console.log(`Checking if profile updated... attempt ${attempts + 1}`);
          
          // Give a small delay for state to propagate
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Check if the user's current_profile_type has been updated
          if (user && user.current_profile_type === type) {
            console.log('Profile type successfully updated in user state:', user.current_profile_type);
            return true;
          }
          
          attempts++;
        }
        
        console.warn('Profile type not updated in user state after max attempts');
        return false;
      };
      
      await waitForProfileUpdate();
      
      // Navigate to dashboard after confirming state is updated
      if (type === 'company') {
        console.log('Navigating to company dashboard...');
        navigate(ROUTES.PROTECTED.COMPANY.DASHBOARD);
      } else {
        console.log('Navigating to vendor dashboard...');
        navigate(ROUTES.PROTECTED.VENDOR.DASHBOARD);
      }
      
    } catch (error) {
      console.error('Error in handleContinueAsProfile:', error);
      setError('Failed to continue. Please try again.');
    }
  };

  // Check for existing profiles when showing profile selection (only once)
  useEffect(() => {
    if (showProfileSelection && user && isAuthenticated && !authLoading && !hasCompanyProfile && !hasVendorProfile) {
      const checkExistingProfiles = async () => {
        try {
          console.log('Checking existing profiles...');
          
          // Check both profiles to show appropriate buttons
          const [companyResult, vendorResult] = await Promise.all([
            checkCompanyProfile(),
            checkVendorProfile()
          ]);
          
          setHasCompanyProfile(companyResult.has_company_profile);
          setHasVendorProfile(vendorResult.has_vendor_profile);
          
          console.log('Profile check results:', { 
            company: companyResult.has_company_profile, 
            vendor: vendorResult.has_vendor_profile 
          });
        } catch (error) {
          console.error('Error checking existing profiles:', error);
        }
      };
      
      checkExistingProfiles();
    }
  }, [showProfileSelection, user, isAuthenticated, authLoading, hasCompanyProfile, hasVendorProfile]);

  // Process OAuth callback or show profile selection
  useEffect(() => {
    // Prevent re-processing if already processed
    if (hasProcessed || authLoading) {
      return;
    }

    const processCallback = async () => {
      try {
        setLoading(true);
        setError(null);
        setHasProcessed(true);

        // Check if this is an OAuth callback with tokens
        const encodedTokens = extractTokensFromURL();

        if (encodedTokens) {
          console.log('🔐 Processing OAuth callback with tokens...');

          // This is an OAuth callback - process the tokens
          await handleOAuthCallback(encodedTokens);

          console.log('✅ OAuth callback processed successfully');

          // Wait a bit for AuthContext to update
          await new Promise(resolve => setTimeout(resolve, 500));

          // Check if user is authenticated now
          const accessToken = localStorage.getItem('access_token');
          const storedUser = localStorage.getItem('user');

          if (accessToken && storedUser) {
            console.log('✅ User authenticated, showing profile selection');
            setShowProfileSelection(true);
            setLoading(false);
          } else {
            console.error('❌ Authentication failed - no tokens found');
            setError('Authentication failed. Please try again.');
            setLoading(false);
          }
        } else {
          console.log('📍 Direct navigation to callback page');

          // This is direct navigation - check auth state
          if (!isAuthenticated) {
            console.log('❌ Not authenticated, redirecting to login');
            navigate(ROUTES.PUBLIC.LOGIN);
            return;
          }

          // Show profile selection for authenticated users
          console.log('✅ Already authenticated, showing profile selection');
          setShowProfileSelection(true);
          setLoading(false);
        }

      } catch (error) {
        console.error('❌ Callback processing error:', error);
        setError(error instanceof Error ? error.message : 'Authentication failed');
        setLoading(false);
      }
    };

    processCallback();
  }, [location.search, hasProcessed, authLoading, isAuthenticated, user]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 max-w-md mx-auto">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">Completing Authentication</h2>
          <p className="text-blue-200">Please wait while we set up your account...</p>
          {/* Debug info in development */}
          {import.meta.env.DEV && (
            <div className="mt-4 text-xs text-blue-300 font-mono">
              <p>Auth Loading: {authLoading ? 'Yes' : 'No'}</p>
              <p>Has Processed: {hasProcessed ? 'Yes' : 'No'}</p>
              <p>Show Profile Selection: {showProfileSelection ? 'Yes' : 'No'}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
        <div className="text-center max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="bg-red-500/20 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Failed</h2>
          <p className="text-blue-200 mb-4">{error}</p>
          <button
            onClick={() => navigate(ROUTES.PUBLIC.LOGIN)}
            className="bg-white hover:bg-gray-50 text-gray-900 px-6 py-2 rounded-lg transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Profile selection UI
  if (showProfileSelection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-4">
        <div className="text-center max-w-4xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Profile</h2>
            <p className="text-xl text-blue-200">Select how you'd like to continue with RAPP</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Company Profile Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Company</h3>
                <p className="text-blue-200 mb-6">
                  {hasCompanyProfile 
                    ? "Continue with your existing company profile and manage procurement needs."
                    : "Create your company profile to start managing procurement needs and connect with vendors."
                  }
                </p>
                {hasCompanyProfile ? (
                  <button
                    onClick={() => handleContinueAsProfile('company')}
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 px-4 rounded-lg shadow-md flex items-center justify-center space-x-3 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="font-medium">Continue as Company</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleCreateProfile('company')}
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 px-4 rounded-lg shadow-md flex items-center justify-center space-x-3 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-medium">Create Company Profile</span>
                  </button>
                )}
              </div>
            </div>

            {/* Vendor Profile Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Vendor</h3>
                <p className="text-blue-200 mb-6">
                  {hasVendorProfile 
                    ? "Continue with your existing vendor profile and access exclusive auctions."
                    : "Create your vendor profile to access exclusive auctions and connect with companies."
                  }
                </p>
                {hasVendorProfile ? (
                  <button
                    onClick={() => handleContinueAsProfile('vendor')}
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 px-4 rounded-lg shadow-md flex items-center justify-center space-x-3 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="font-medium">Continue as Vendor</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleCreateProfile('vendor')}
                    className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 px-4 rounded-lg shadow-md flex items-center justify-center space-x-3 transition-all duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="font-medium">Create Vendor Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Additional features section similar to JoinPlatformSection */}
          <div className="mt-16 text-center">
            <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Secure</h4>
                <p className="text-blue-300 text-sm">Your data is protected with enterprise-grade security</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Fast Setup</h4>
                <p className="text-blue-300 text-sm">Get your profile ready in just a few minutes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Connected</h4>
                <p className="text-blue-300 text-sm">Join our growing network of trusted partners</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default AuthCallback;