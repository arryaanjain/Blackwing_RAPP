import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import AuthCallback from './components/AuthCallback';
import CompanyProfileSetup from './components/profile/CompanyProfileSetup';
import VendorProfileSetup from './components/profile/VendorProfileSetup';
import { ROUTES } from './config/routes';
import './App.css';

// Import existing page components
import LandingPage from './pages/LandingPage';
import CompanyLogin from './pages/CompanyLogin';
import VendorLogin from './pages/VendorLogin';
import CompanySignup from './pages/CompanySignup';
import VendorSignup from './pages/VendorSignup';

// Dashboard components
import CompanyDashboard from './pages/company/CompanyDashboard';
import VendorDashboard from './pages/vendor/VendorDashboard';

// Management components
import ManageVendors from './pages/company/ManageVendors';
import ManageCompanies from './pages/vendor/ManageCompanies';

// Profile components
import CompanyProfile from './pages/company/CompanyProfile';
import VendorProfile from './pages/vendor/VendorProfile';

// Company Listings and Quotes components
import CompanyListingsManager from './pages/company/CompanyListingsManager';
import CompanyListingDetail from './pages/company/CompanyListingDetail';
import CompanyCreateListing from './pages/company/CompanyCreateListing';
import CompanyEditListing from './pages/company/CompanyEditListing';

// Vendor Listings and Quotes components
import VendorListingsBrowser from './pages/vendor/VendorListingsBrowser';
import VendorListingDetail from './pages/vendor/VendorListingDetail';
import VendorQuotesManager from './pages/vendor/VendorQuotesManager';
import VendorQuoteDetail from './pages/vendor/VendorQuoteDetail';
import VendorCreateQuote from './pages/vendor/VendorCreateQuote';
import VendorEditQuote from './pages/vendor/VendorEditQuote';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path={ROUTES.PUBLIC.HOME} element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          } />

          <Route path={ROUTES.PUBLIC.COMPANY_LOGIN} element={
            <PublicRoute redirectIfAuthenticated={true}>
              <CompanyLogin />
            </PublicRoute>
          } />

          <Route path={ROUTES.PUBLIC.VENDOR_LOGIN} element={
            <PublicRoute redirectIfAuthenticated={true}>
              <VendorLogin />
            </PublicRoute>
          } />

          <Route path={ROUTES.PUBLIC.COMPANY_SIGNUP} element={
            <PublicRoute redirectIfAuthenticated={true}>
              <CompanySignup />
            </PublicRoute>
          } />

          <Route path={ROUTES.PUBLIC.VENDOR_SIGNUP} element={
            <PublicRoute redirectIfAuthenticated={true}>
              <VendorSignup />
            </PublicRoute>
          } />

          {/* Legacy login route redirect */}
          <Route path={ROUTES.PUBLIC.LOGIN} element={
            <PublicRoute>
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Choose Login Type</h1>
                  <div className="space-x-4">
                    <a href={ROUTES.PUBLIC.COMPANY_LOGIN} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                      Company Login
                    </a>
                    <a href={ROUTES.PUBLIC.VENDOR_LOGIN} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                      Vendor Login
                    </a>
                  </div>
                </div>
              </div>
            </PublicRoute>
          } />

          {/* Authentication Callback */}
          <Route path={ROUTES.AUTH.CALLBACK} element={<AuthCallback />} />

          {/* Company Protected Routes */}
          <Route path={ROUTES.PROTECTED.COMPANY.DASHBOARD} element={
            <ProtectedRoute requireAuth={true} requireProfile="company" requireCompleteProfile={true}>
              <CompanyDashboard />
            </ProtectedRoute>
          } />

          <Route path={ROUTES.PROTECTED.COMPANY.VENDORS} element={
            <ProtectedRoute requireAuth={true} requireProfile="company" requireCompleteProfile={true}>
              <ManageVendors />
            </ProtectedRoute>
          } />

          <Route path={ROUTES.PROTECTED.COMPANY.COMPLETE_PROFILE} element={
            <ProtectedRoute requireAuth={true}>
              <CompanyProfileSetup />
            </ProtectedRoute>
          } />

          <Route path={ROUTES.PROTECTED.COMPANY.PROFILE} element={
            <ProtectedRoute requireAuth={true} requireProfile="company" requireCompleteProfile={true}>
              <CompanyProfile />
            </ProtectedRoute>
          } />

          {/* Company Listings Management Routes */}
          <Route path={ROUTES.PROTECTED.COMPANY.LISTINGS} element={
            <ProtectedRoute requireAuth={true} requireProfile="company" requireCompleteProfile={true}>
              <CompanyListingsManager />
            </ProtectedRoute>
          } />

          <Route path={ROUTES.PROTECTED.COMPANY.LISTINGS_CREATE} element={
            <ProtectedRoute requireAuth={true} requireProfile="company" requireCompleteProfile={true}>
              <CompanyCreateListing />
            </ProtectedRoute>
          } />

          <Route path={ROUTES.PROTECTED.COMPANY.LISTINGS_DETAIL} element={
            <ProtectedRoute requireAuth={true} requireProfile="company" requireCompleteProfile={true}>
              <CompanyListingDetail />
            </ProtectedRoute>
          } />

          <Route path={ROUTES.PROTECTED.COMPANY.LISTINGS_EDIT} element={
            <ProtectedRoute requireAuth={true} requireProfile="company" requireCompleteProfile={true}>
              <CompanyEditListing />
            </ProtectedRoute>
          } />

          {/* Vendor Protected Routes */}
          <Route path={ROUTES.PROTECTED.VENDOR.DASHBOARD} element={
            <ProtectedRoute requireAuth={true} requireProfile="vendor" requireCompleteProfile={true}>
              <VendorDashboard />
            </ProtectedRoute>
          } />

          <Route path={ROUTES.PROTECTED.VENDOR.COMPANIES} element={
            <ProtectedRoute requireAuth={true} requireProfile="vendor" requireCompleteProfile={true}>
              <ManageCompanies />
            </ProtectedRoute>
          } />

          <Route path={ROUTES.PROTECTED.VENDOR.COMPLETE_PROFILE} element={
            <ProtectedRoute requireAuth={true}>
              <VendorProfileSetup />
            </ProtectedRoute>
          } />

          <Route path={ROUTES.PROTECTED.VENDOR.PROFILE} element={
            <ProtectedRoute requireAuth={true} requireProfile="vendor" requireCompleteProfile={true}>
              <VendorProfile />
            </ProtectedRoute>
          } />

          {/* Vendor Listings and Quotes Routes */}
          <Route path={ROUTES.PROTECTED.VENDOR.LISTINGS} element={
            <ProtectedRoute requireAuth={true} requireProfile="vendor" requireCompleteProfile={true}>
              <VendorListingsBrowser />
            </ProtectedRoute>
          } />

          <Route path={ROUTES.PROTECTED.VENDOR.LISTINGS_DETAIL} element={
            <ProtectedRoute requireAuth={true} requireProfile="vendor" requireCompleteProfile={true}>
              <VendorListingDetail />
            </ProtectedRoute>
          } />

          <Route path={ROUTES.PROTECTED.VENDOR.QUOTES_CREATE} element={
            <ProtectedRoute requireAuth={true} requireProfile="vendor" requireCompleteProfile={true}>
              <VendorCreateQuote />
            </ProtectedRoute>
          } />

          <Route path={ROUTES.PROTECTED.VENDOR.QUOTES} element={
            <ProtectedRoute requireAuth={true} requireProfile="vendor" requireCompleteProfile={true}>
              <VendorQuotesManager />
            </ProtectedRoute>
          } />

          <Route path={ROUTES.PROTECTED.VENDOR.QUOTES_DETAIL} element={
            <ProtectedRoute requireAuth={true} requireProfile="vendor" requireCompleteProfile={true}>
              <VendorQuoteDetail />
            </ProtectedRoute>
          } />

          <Route path={ROUTES.PROTECTED.VENDOR.QUOTES_EDIT} element={
            <ProtectedRoute requireAuth={true} requireProfile="vendor" requireCompleteProfile={true}>
              <VendorEditQuote />
            </ProtectedRoute>
          } />

          {/* Add missing company quotes management route */}
          <Route path={ROUTES.PROTECTED.COMPANY.LISTINGS_QUOTES} element={
            <ProtectedRoute requireAuth={true} requireProfile="company" requireCompleteProfile={true}>
              <CompanyListingsManager />
            </ProtectedRoute>
          } />

          <Route path="/listings/create" element={
            <ProtectedRoute requireAuth={true} requireProfile="company" requireCompleteProfile={true}>
              <CompanyCreateListing />
            </ProtectedRoute>
          } />

          <Route path="/listings/:id" element={
            <ProtectedRoute requireAuth={true} requireCompleteProfile={true}>
              <CompanyListingDetail />
            </ProtectedRoute>
          } />

          <Route path="/listings/:id/edit" element={
            <ProtectedRoute requireAuth={true} requireProfile="company" requireCompleteProfile={true}>
              <CompanyEditListing />
            </ProtectedRoute>
          } />

          <Route path="/quotes" element={
            <ProtectedRoute requireAuth={true} requireProfile="vendor" requireCompleteProfile={true}>
              <VendorQuotesManager />
            </ProtectedRoute>
          } />

          {/* General Protected Routes */}
          <Route path={ROUTES.PROTECTED.DASHBOARD} element={
            <ProtectedRoute requireAuth={true}>
              <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to RAPP</h1>
                  <p className="text-gray-600">Please complete your profile setup to continue.</p>
                </div>
              </div>
            </ProtectedRoute>
          } />

          {/* Error Routes */}
          <Route path={ROUTES.UTILITY.UNAUTHORIZED} element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">401</h1>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Unauthorized</h2>
                <p className="text-gray-600">You don't have permission to access this resource.</p>
              </div>
            </div>
          } />

          <Route path={ROUTES.UTILITY.NOT_FOUND} element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                <p className="text-gray-600">The page you're looking for doesn't exist.</p>
              </div>
            </div>
          } />

          {/* Catch all route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">404</h1>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                <p className="text-gray-600">The page you're looking for doesn't exist.</p>
                <a href={ROUTES.PUBLIC.HOME} className="mt-4 inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Go Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
