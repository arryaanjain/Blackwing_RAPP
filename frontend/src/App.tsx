import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
// import Contact from './pages/Contact'; // Temporarily disabled until file is located
const Contact = () => <div>Contact Page Coming Soon</div>;
import Features from './pages/Features';
import Solutions from './pages/Solutions';
import Pricing from './pages/Pricing';
import Demo from './pages/Demo';
import Team from './pages/Team';
import Careers from './pages/Careers';
import News from './pages/News';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Documentation from './pages/Documentation';
import KnowledgeBase from './pages/KnowledgeBase';
import Blog from './pages/Blog';
import Guides from './pages/Guides';
import CompanyProfileSetupGuide from './pages/guides/CompanyProfileSetupGuide';
import VendorOnboardingGuide from './pages/guides/VendorOnboardingGuide';
import ManagingListingGuide from './pages/guides/ManagingListingGuide';
import SecurityBestPracticesGuide from './pages/guides/SecurityBestPracticesGuide';

import ScrollToTop from './components/ScrollToTop';
import Onboarding from './pages/Onboarding';

import CompanyDashboard from './pages/company/CompanyDashboard';
import CompleteCompanyProfile from './components/profile/CompanyProfileSetup';
import CompanyListings from './pages/company/CompanyListingsManager';
import CreateListing from './pages/company/CompanyCreateListing';
import CompanyVendors from './pages/company/ManageVendors';
import CompanyProfile from './pages/company/CompanyProfile';

import VendorDashboard from './pages/vendor/VendorDashboard';
import CompleteVendorProfile from './components/profile/VendorProfileSetup';
import VendorListings from './pages/vendor/VendorListingsBrowser';
import SearchListings from './pages/vendor/VendorListingsBrowser';
import VendorProfile from './pages/vendor/VendorProfile';

import AuthCallback from './components/AuthCallback';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { AuthProvider } from './context/AuthContext';
import { ROUTES } from './config/routes';

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path={ROUTES.PUBLIC.HOME} element={
                <PublicRoute>
                  <LandingPage />
                </PublicRoute>
              } />

              <Route path={ROUTES.PUBLIC.ONBOARDING} element={
                <PublicRoute>
                  <Onboarding />
                </PublicRoute>
              } />

              <Route path={ROUTES.PUBLIC.ABOUT} element={<About />} />
              <Route path={ROUTES.PUBLIC.CONTACT} element={<Contact />} />
              <Route path={ROUTES.PUBLIC.PRIVACY} element={<Privacy />} />
              <Route path={ROUTES.PUBLIC.TERMS} element={<Terms />} />
              <Route path={ROUTES.PUBLIC.FEATURES} element={<Features />} />
              <Route path={ROUTES.PUBLIC.SOLUTIONS} element={<Solutions />} />
              <Route path={ROUTES.PUBLIC.PRICING} element={<Pricing />} />
              <Route path={ROUTES.PUBLIC.DEMO} element={<Demo />} />
              <Route path={ROUTES.PUBLIC.TEAM} element={<Team />} />
              <Route path={ROUTES.PUBLIC.CAREERS} element={<Careers />} />
              <Route path={ROUTES.PUBLIC.NEWS} element={<News />} />
              <Route path={ROUTES.PUBLIC.DOCS} element={<Documentation />} />
              <Route path={ROUTES.PUBLIC.KNOWLEDGE_BASE} element={<KnowledgeBase />} />
              <Route path={ROUTES.PUBLIC.BLOG} element={<Blog />} />
              <Route path={ROUTES.PUBLIC.GUIDES} element={<Guides />} />
              <Route path={ROUTES.PUBLIC.GUIDE_COMPANY_SETUP} element={<CompanyProfileSetupGuide />} />
              <Route path={ROUTES.PUBLIC.GUIDE_VENDOR_ONBOARDING} element={<VendorOnboardingGuide />} />
              <Route path={ROUTES.PUBLIC.GUIDE_MANAGING_LISTING} element={<ManagingListingGuide />} />
              <Route path={ROUTES.PUBLIC.GUIDE_SECURITY_BEST_PRACTICES} element={<SecurityBestPracticesGuide />} />

              {/* Auth Callback */}
              <Route path={ROUTES.AUTH.CALLBACK} element={<AuthCallback />} />

              {/* Protected Company Routes */}
              <Route path={ROUTES.PROTECTED.COMPANY.DASHBOARD} element={
                <ProtectedRoute profileType="company">
                  <CompanyDashboard />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.PROTECTED.COMPANY.COMPLETE_PROFILE} element={
                <ProtectedRoute profileType="company">
                  <CompleteCompanyProfile />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.PROTECTED.COMPANY.LISTINGS} element={
                <ProtectedRoute profileType="company">
                  <CompanyListings />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.PROTECTED.COMPANY.CREATE_LISTING} element={
                <ProtectedRoute profileType="company">
                  <CreateListing />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.PROTECTED.COMPANY.VENDORS} element={
                <ProtectedRoute profileType="company">
                  <CompanyVendors />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.PROTECTED.COMPANY.PROFILE} element={
                <ProtectedRoute profileType="company">
                  <CompanyProfile />
                </ProtectedRoute>
              } />

              {/* Protected Vendor Routes */}
              <Route path={ROUTES.PROTECTED.VENDOR.DASHBOARD} element={
                <ProtectedRoute profileType="vendor">
                  <VendorDashboard />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.PROTECTED.VENDOR.COMPLETE_PROFILE} element={
                <ProtectedRoute profileType="vendor">
                  <CompleteVendorProfile />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.PROTECTED.VENDOR.MY_LISTINGS} element={
                <ProtectedRoute profileType="vendor">
                  <VendorListings />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.PROTECTED.VENDOR.SEARCH_LISTINGS} element={
                <ProtectedRoute profileType="vendor">
                  <SearchListings />
                </ProtectedRoute>
              } />
              <Route path={ROUTES.PROTECTED.VENDOR.PROFILE} element={
                <ProtectedRoute profileType="vendor">
                  <VendorProfile />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;
