import React from 'react';
import BasePage from '../components/BasePage';

const Solutions: React.FC = () => {
  return (
    <BasePage 
      title="Solutions" 
      subtitle="Comprehensive procurement solutions tailored for modern businesses"
    >
      <div className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Enterprise Procurement</h2>
            <p className="text-blue-200 mb-6">
              Streamline your enterprise procurement processes with our blockchain-powered platform. 
              Manage complex supply chains, multiple vendors, and large-scale purchases with confidence.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-blue-200">
                <svg className="h-5 w-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Multi-vendor management
              </li>
              <li className="flex items-center text-blue-200">
                <svg className="h-5 w-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Automated workflows
              </li>
              <li className="flex items-center text-blue-200">
                <svg className="h-5 w-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Compliance management
              </li>
            </ul>
          </div>
          <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-8">
            <h3 className="text-xl font-semibold text-white mb-4">Key Benefits</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Cost Reduction</span>
                <span className="text-white font-bold">30%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Process Efficiency</span>
                <span className="text-white font-bold">65%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-200">Risk Mitigation</span>
                <span className="text-white font-bold">85%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <div className="bg-blue-900/30 backdrop-blur-sm border border-blue-700/30 rounded-xl p-8">
              <h3 className="text-xl font-semibold text-white mb-4">Industry Applications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-blue-200 text-sm">Manufacturing</span>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-blue-200 text-sm">Healthcare</span>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-blue-200 text-sm">Technology</span>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-800 w-12 h-12 rounded-xl mx-auto mb-2 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-blue-200 text-sm">Retail</span>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <h2 className="text-3xl font-bold text-white mb-6">SME Solutions</h2>
            <p className="text-blue-200 mb-6">
              Tailored solutions for small and medium enterprises looking to optimize their procurement 
              processes without the complexity of enterprise-level systems.
            </p>
            <ul className="space-y-3">
              <li className="flex items-center text-blue-200">
                <svg className="h-5 w-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Easy setup and onboarding
              </li>
              <li className="flex items-center text-blue-200">
                <svg className="h-5 w-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Affordable pricing models
              </li>
              <li className="flex items-center text-blue-200">
                <svg className="h-5 w-5 text-green-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Scalable growth options
              </li>
            </ul>
          </div>
        </div>
      </div>
    </BasePage>
  );
};

export default Solutions;
