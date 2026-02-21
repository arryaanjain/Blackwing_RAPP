import React from 'react';
import BasePage from '../components/BasePage';

const Demo: React.FC = () => {
  return (
    <BasePage 
      title="Interactive Demo" 
      subtitle="Experience RAPP in action with our interactive demonstration"
    >
      <div className="space-y-12">
        {/* Demo Video Section */}
        <div className="text-center">
          <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-8 mb-8">
            <div className="aspect-video bg-gradient-to-br from-blue-800 to-indigo-900 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 mb-4 inline-block">
                  <svg className="h-16 w-16 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Watch Our Platform Demo</h3>
                <p className="text-blue-200">See how RAPP transforms procurement processes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Company Dashboard</h3>
            <p className="text-blue-200 mb-4">
              Explore how companies create listings, manage vendors, and track procurement activities.
            </p>
            <button className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:from-blue-600 hover:to-indigo-700 transition-all">
              Try Company Demo
            </button>
          </div>

          <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Vendor Portal</h3>
            <p className="text-blue-200 mb-4">
              Experience the vendor perspective - browse listings, submit bids, and manage contracts.
            </p>
            <button className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:from-blue-600 hover:to-indigo-700 transition-all">
              Try Vendor Demo
            </button>
          </div>
        </div>

        {/* Key Demo Features */}
        <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">What You'll Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Live Bidding</h3>
              <p className="text-blue-200">Real-time auction mechanics with automated bid processing</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Analytics Dashboard</h3>
              <p className="text-blue-200">Comprehensive reporting and performance metrics</p>
            </div>

            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Blockchain Verification</h3>
              <p className="text-blue-200">See how transactions are secured and verified</p>
            </div>
          </div>
        </div>

        {/* Schedule Demo */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Want a Personalized Demo?</h2>
          <p className="text-blue-100 mb-6">
            Schedule a one-on-one session with our team to see how RAPP can be customized for your specific needs.
          </p>
          <button className="px-8 py-3 rounded-lg bg-white text-blue-700 font-medium hover:bg-blue-50 transition-all">
            Schedule Demo Call
          </button>
        </div>
      </div>
    </BasePage>
  );
};

export default Demo;
