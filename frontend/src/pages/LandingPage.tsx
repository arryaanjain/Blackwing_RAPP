import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HeroSection from '../components/HeroSection';
import FeaturesSection from '../components/FeaturesSection';
import StatsSection from '../components/StatsSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TestimonialsSection from '../components/TestimonialsSection';
import CallToAction from '../components/CallToAction';
import JoinPlatformSection from '../components/JoinPlatformSection';

import CursorGlow from '../components/ui/CursorGlow';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (location.state?.message && location.state?.type === 'success') {
      setSuccessMessage(location.state.message);
      if (location.state.shouldLogout) {
        logout().catch(console.error);
      }
      const timer = setTimeout(() => setSuccessMessage(null), 10000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location.state, logout]);

  const handleGetStarted = () => navigate('/onboarding');
  const handleContactSales = () => navigate('/contact');

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#020617]">
      {/* Immersive Background System */}
      <div className="bg-mesh" />
      <div className="noise-overlay" />
      <CursorGlow />

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="glass bg-green-500/10 border-green-500/20 text-green-400 px-6 py-4 rounded-2xl flex items-center shadow-premium backdrop-blur-xl">
            <svg className="w-6 h-6 mr-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium">{successMessage}</p>
            <button onClick={() => setSuccessMessage(null)} className="ml-auto hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <main className="relative z-10">
        <HeroSection
          title="Revolutionize Procurement with Blockchain"
          subtitle="RAPP transforms traditional procurement into a transparent, efficient, and secure process using decentralized technology. Reduce costs, eliminate fraud, and build industrial-scale trust."
          ctaText="Start Building"
          onCtaClick={handleGetStarted}
        />

        <FeaturesSection />

        <div className="relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
          <StatsSection />
          <HowItWorksSection />
        </div>

        <div className="glass border-y border-white/5">
          <JoinPlatformSection />
        </div>

        <TestimonialsSection />

        <CallToAction
          title="Ready to Scale Your Procurement Strategy?"
          subtitle="Join thousands of forward-thinking companies and vendors already using RAPP to automate transparency and efficiency."
          primaryButtonText="Get Started Now"
          secondaryButtonText="Book a Demo"
          onPrimaryClick={handleGetStarted}
          onSecondaryClick={handleContactSales}
        />
      </main>
    </div>
  );
};

export default LandingPage;
