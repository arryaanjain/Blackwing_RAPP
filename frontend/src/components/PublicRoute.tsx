import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/routes';

interface PublicRouteProps {
  children: React.ReactNode;
  redirectIfAuthenticated?: boolean;
  redirectTo?: string;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ 
  children, 
  redirectIfAuthenticated = false, // Changed default to false
  redirectTo 
}) => {
  const { isAuthenticated, currentProfile, loading, needsProfileSetup } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated and we should redirect
  if (isAuthenticated && redirectIfAuthenticated) {
    // Use custom redirect path if provided
    if (redirectTo) {
      return <Navigate to={redirectTo} replace />;
    }

    // Special handling for login/signup pages - redirect authenticated users
    const isAuthPage = location.pathname.includes('/login') || location.pathname.includes('/signup');
    
    if (isAuthPage) {
      // If user needs to set up profiles or select one
      if (needsProfileSetup || !currentProfile) {
        return <Navigate to="/auth/callback" replace />;
      }

      // If current profile is incomplete, redirect to completion
      if (currentProfile && !currentProfile.is_complete) {
        if (currentProfile.type === 'company') {
          return <Navigate to={ROUTES.PROTECTED.COMPANY.COMPLETE_PROFILE} replace />;
        } else if (currentProfile.type === 'vendor') {
          return <Navigate to={ROUTES.PROTECTED.VENDOR.COMPLETE_PROFILE} replace />;
        }
      }

      // Redirect to appropriate dashboard based on current profile
      if (currentProfile?.type === 'company') {
        return <Navigate to={ROUTES.PROTECTED.COMPANY.DASHBOARD} replace />;
      } else if (currentProfile?.type === 'vendor') {
        return <Navigate to={ROUTES.PROTECTED.VENDOR.DASHBOARD} replace />;
      }
    }
  }

  return <>{children}</>;
};

export default PublicRoute;
