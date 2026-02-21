import React from 'react';
import BasePage from '../components/BasePage';

const Features: React.FC = () => {
  return (
    <BasePage
      title="Features"
      subtitle="Discover the powerful capabilities that make RAPP the leading blockchain procurement platform"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="glass-premium rounded-3xl p-8 hover-lift transition-all duration-500 group">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 w-14 h-14 rounded-2xl mb-6 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Blockchain Security</h3>
          <p className="text-gray-400 leading-relaxed">Every transaction is secured with blockchain technology, ensuring complete transparency and immutability.</p>
        </div>

        <div className="glass-premium rounded-3xl p-8 hover-lift transition-all duration-500 group">
          <div className="bg-gradient-to-br from-blue-500 to-cyan-600 w-14 h-14 rounded-2xl mb-6 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Smart Contracts</h3>
          <p className="text-gray-400 leading-relaxed">Automated contract execution with predefined terms and conditions, reducing manual oversight.</p>
        </div>

        <div className="glass-premium rounded-3xl p-8 hover-lift transition-all duration-500 group">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-14 h-14 rounded-2xl mb-6 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500">
            <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Real-time Analytics</h3>
          <p className="text-gray-400 leading-relaxed">Comprehensive dashboards and reporting tools to track procurement performance.</p>
        </div>
      </div>
    </BasePage>
  );
};

export default Features;
