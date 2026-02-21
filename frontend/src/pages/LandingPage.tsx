import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import StatsSection from '../components/StatsSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TestimonialsSection from '../components/TestimonialsSection';
import CallToAction from '../components/CallToAction';
import JoinPlatformSection from '../components/JoinPlatformSection';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check for success message from profile creation and handle logout
  useEffect(() => {
    if (location.state?.message && location.state?.type === 'success') {
      setSuccessMessage(location.state.message);
      
      // If shouldLogout flag is present, logout the user
      if (location.state.shouldLogout) {
        logout().then(() => {
          console.log('User logged out successfully after profile creation');
        }).catch((error) => {
          console.error('Error during logout:', error);
        });
      }
      
      // Clear the message after 10 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 10000);
      
      // Clear location state to prevent message from showing again on refresh
      window.history.replaceState({}, document.title);
      
      return () => clearTimeout(timer);
    }
  }, [location.state, logout]);

  const handleGetStarted = () => {
    navigate('/');
  };

  // Function for future use when we add a features page
  // const handleLearnMore = () => {
  //   navigate('/features');
  // };

  const handleContactSales = () => {
    navigate('/contact');
  };

  return (
    <div className="min-h-screen bg-blue-950">
      <Header />
      
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-green-500 text-white px-6 py-4 rounded-lg shadow-lg border-l-4 border-green-700">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">{successMessage}</p>
              <button 
                onClick={() => setSuccessMessage(null)}
                className="ml-auto text-green-200 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className="pt-16">
        {/* Hero Section */}
        <HeroSection
          title="Revolutionize Procurement with Blockchain Technology"
          subtitle="RAPP transforms traditional procurement into a transparent, efficient, and secure process using blockchain technology. Reduce costs, eliminate fraud, and build trust between buyers and suppliers."
          ctaText="Get Started"
          onCtaClick={handleGetStarted}
        />
        
        {/* Features Section */}
        <FeaturesSection />
        
        {/* Stats Section */}
        <StatsSection />
        
        {/* How It Works */}
        <HowItWorksSection />
        
        {/* Join Platform Section */}
        <JoinPlatformSection />
        
        {/* Testimonials */}
        <TestimonialsSection />
        
        {/* Call to Action */}
        <CallToAction
          title="Ready to Transform Your Procurement Process?"
          subtitle="Join thousands of companies and vendors already using RAPP to streamline procurement, reduce costs, and build trust."
          primaryButtonText="Get Started"
          secondaryButtonText="Contact Sales"
          onPrimaryClick={handleGetStarted}
          onSecondaryClick={handleContactSales}
        />
      </main>
      
      <Footer />
    </div>
  );
};

export default LandingPage;
