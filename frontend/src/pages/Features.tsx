import React from 'react';
import BasePage from '../components/BasePage';

const Features: React.FC = () => {
  return (
    <BasePage 
      title="Features" 
      subtitle="Discover the powerful capabilities that make RAPP the leading blockchain procurement platform"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-12 h-12 rounded-xl mb-4 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Blockchain Security</h3>
          <p className="text-blue-200">Every transaction is secured with blockchain technology, ensuring complete transparency and immutability.</p>
        </div>

        <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-12 h-12 rounded-xl mb-4 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Smart Contracts</h3>
          <p className="text-blue-200">Automated contract execution with predefined terms and conditions, reducing manual oversight.</p>
        </div>

        <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-12 h-12 rounded-xl mb-4 flex items-center justify-center">
            <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">Real-time Analytics</h3>
          <p className="text-blue-200">Comprehensive dashboards and reporting tools to track procurement performance.</p>
        </div>
      </div>
    </BasePage>
  );
};

export default Features;
