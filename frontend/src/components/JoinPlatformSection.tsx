import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FcGoogle } from 'react-icons/fc';
import Container from './ui/Container';
import Section from './ui/Section';
import GlassCard from './ui/GlassCard';

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
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login with Google. Please try again.');
    } finally {
      setIsLoggingIn(null);
    }
  };

  return (
    <Section id="join-platform" variant="subtle">
      <Container>
        <div className="text-center mb-16">
          <h2 className="text-indigo-400 font-semibold uppercase tracking-widest text-sm mb-4">Onboarding</h2>
          <h3 className="text-4xl md:text-5xl font-bold mb-6 text-gradient">Ready to join the ecosystem?</h3>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose your entity type to begin. Our platform creates a secure bridge between enterprise buyers and certified suppliers.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 mb-8 max-w-md mx-auto text-center backdrop-blur-md">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Company Card */}
          <GlassCard className="p-10 flex flex-col items-center text-center group border-indigo-500/10 hover:border-indigo-500/30">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-indigo-500 group-hover:text-white text-indigo-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 uppercase tracking-tight">Enterprise</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Manage multi-vendor procurement, automate RFPs, and gain 100% visibility into your supply chain.
            </p>
            <button
              onClick={() => handleLogin('company')}
              disabled={isLoggingIn !== null}
              className="w-full relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoggingIn === 'company' ? (
                <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <FcGoogle className="text-2xl" />
                  <span>CONTINUE AS ENTERPRISE</span>
                </>
              )}
            </button>
          </GlassCard>

          {/* Vendor Card */}
          <GlassCard className="p-10 flex flex-col items-center text-center group border-purple-500/10 hover:border-purple-500/30">
            <div className="w-20 h-20 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 group-hover:bg-purple-500 group-hover:text-white text-purple-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4 uppercase tracking-tight">Supplier</h3>
            <p className="text-gray-400 mb-8 leading-relaxed">
              Access high-value contracts, prove your reliability on-chain, and get paid instantly via smart contracts.
            </p>
            <button
              onClick={() => handleLogin('vendor')}
              disabled={isLoggingIn !== null}
              className="w-full relative flex items-center justify-center gap-3 px-6 py-4 rounded-xl bg-white text-black font-bold hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoggingIn === 'vendor' ? (
                <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <>
                  <FcGoogle className="text-2xl" />
                  <span>CONTINUE AS SUPPLIER</span>
                </>
              )}
            </button>
          </GlassCard>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Real-time Onboarding', desc: 'Active in minutes' },
            { icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944', title: 'Verified Security', desc: 'SOC2 compliant infra' },
            { icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7', title: 'Round-the-clock', desc: 'Global protocol support' }
          ].map((item, i) => (
            <div key={i} className="text-center group">
              <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-500/20 transition-colors">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
              </div>
              <h4 className="text-white font-bold mb-2 uppercase tracking-tight">{item.title}</h4>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default JoinPlatformSection;
