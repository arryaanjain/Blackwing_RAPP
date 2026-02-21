import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/routes';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  profileType?: 'company' | 'vendor'; // Changed from requireProfile for consistency with App.tsx
  requireCompleteProfile?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  profileType,
  requireCompleteProfile = false
}) => {
  const { isAuthenticated, currentProfile, loading, needsProfileSetup } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Initializing...</p>
        </div>
      </div>
    );
  }

  // If route requires authentication but user is not authenticated
  // Redirect to ONBOARDING instead of LOGIN
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={ROUTES.PUBLIC.ONBOARDING} state={{ from: location }} replace />;
  }

  // If user needs to set up profiles, but allow access to complete-profile routes
  if (requireAuth && needsProfileSetup && !location.pathname.includes('complete-profile')) {
    return <Navigate to="/auth/callback" replace />;
  }

  // If route requires specific profile type (but allow complete-profile routes)
  if (profileType && (!currentProfile || currentProfile.type !== profileType) && !location.pathname.includes('complete-profile')) {
    // Redirect to profile selection/creation
    return <Navigate to="/auth/callback" replace />;
  }

  // If route requires complete profile but current profile is incomplete
  if (requireCompleteProfile && currentProfile && !currentProfile.is_complete) {
    if (currentProfile.type === 'company') {
      return <Navigate to={ROUTES.PROTECTED.COMPANY.COMPLETE_PROFILE} replace />;
    } else if (currentProfile.type === 'vendor') {
      return <Navigate to={ROUTES.PROTECTED.VENDOR.COMPLETE_PROFILE} replace />;
    }
  }

  // If current profile is incomplete and we're not on a completion route
  if (currentProfile && !currentProfile.is_complete && !location.pathname.includes('complete-profile')) {
    if (currentProfile.type === 'company') {
      return <Navigate to={ROUTES.PROTECTED.COMPANY.COMPLETE_PROFILE} replace />;
    } else if (currentProfile.type === 'vendor') {
      return <Navigate to={ROUTES.PROTECTED.VENDOR.COMPLETE_PROFILE} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
