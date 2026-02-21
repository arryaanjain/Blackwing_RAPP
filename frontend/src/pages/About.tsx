import React from 'react';
import BasePage from '../components/BasePage';

const About: React.FC = () => {
  return (
    <BasePage 
      title="About RAPP" 
      subtitle="Revolutionizing procurement through blockchain innovation"
    >
      <div className="space-y-16">
        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-blue-200 mb-6 text-lg">
              At RAPP, we're transforming the procurement landscape by leveraging blockchain technology 
              to create transparent, efficient, and secure procurement processes for businesses worldwide.
            </p>
            <p className="text-blue-200 mb-6">
              Our platform eliminates traditional procurement pain points including lack of transparency, 
              manual processes, and trust issues between buyers and suppliers.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">500+</div>
                <div className="text-blue-200 text-sm">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">2000+</div>
                <div className="text-blue-200 text-sm">Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">$50M+</div>
                <div className="text-blue-200 text-sm">Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">99.9%</div>
                <div className="text-blue-200 text-sm">Uptime</div>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-white mb-4">Our Vision</h3>
            <p className="text-blue-100 mb-6">
              To become the global standard for blockchain-powered procurement, 
              enabling businesses of all sizes to access fair, transparent, and efficient 
              procurement processes.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-blue-100 text-sm">Democratize access to procurement opportunities</span>
              </div>
              <div className="flex items-start">
                <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-blue-100 text-sm">Reduce procurement costs globally</span>
              </div>
              <div className="flex items-start">
                <div className="bg-white/20 rounded-full p-1 mr-3 mt-1">
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-blue-100 text-sm">Establish trust through transparency</span>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-12">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Transparency</h3>
              <p className="text-blue-200">Every transaction is visible and verifiable on the blockchain, ensuring complete transparency in all procurement processes.</p>
            </div>

            <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Innovation</h3>
              <p className="text-blue-200">We continuously push the boundaries of what's possible in procurement technology, staying ahead of industry trends.</p>
            </div>

            <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-16 h-16 rounded-xl mx-auto mb-4 flex items-center justify-center">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Community</h3>
              <p className="text-blue-200">We believe in building a strong community of buyers and suppliers who support each other's success.</p>
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Journey</h2>
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-full p-3 mr-6">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <div className="flex-1 bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">Founded</h3>
                  <span className="text-blue-200 text-sm">2023</span>
                </div>
                <p className="text-blue-200">RAPP was founded with the vision to revolutionize procurement using blockchain technology.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-full p-3 mr-6">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <div className="flex-1 bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">Platform Launch</h3>
                  <span className="text-blue-200 text-sm">2024</span>
                </div>
                <p className="text-blue-200">Launched our MVP with core features including reverse auctions and smart contracts.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-full p-3 mr-6">
                <div className="w-6 h-6 bg-white rounded-full"></div>
              </div>
              <div className="flex-1 bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-white">Global Expansion</h3>
                  <span className="text-blue-200 text-sm">2025</span>
                </div>
                <p className="text-blue-200">Expanded to serve companies and vendors across multiple countries and industries.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BasePage>
  );
};

export default About;
