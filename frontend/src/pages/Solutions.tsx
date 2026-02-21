import React from 'react';
import { motion } from 'framer-motion';
import BasePage from '../components/BasePage';

const Solutions: React.FC = () => {
  return (
    <BasePage
      title="Solutions"
      subtitle="Comprehensive procurement solutions tailored for modern businesses"
    >
      <div className="space-y-24">
        {/* Company Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.9]">
              Company <span className="text-indigo-500">Protocol</span>
            </h2>
            <p className="text-gray-400 mb-8 text-lg font-medium leading-relaxed">
              Streamline your Company procurement processes with our blockchain-powered platform.
              Manage complex supply chains, multiple vendors, and large-scale purchases with confidence.
            </p>
            <ul className="space-y-4">
              {[
                "Strategic Multi-vendor management",
                "Automated decentralized workflows",
                "Real-time recursive compliance"
              ].map((text, i) => (
                <li key={i} className="flex items-center text-gray-300 font-medium group">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mr-4 group-hover:bg-indigo-500 group-hover:text-black transition-all duration-300">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>
          <div className="order-1 lg:order-2 glass-premium rounded-3xl p-10 border-indigo-500/20 shadow-2xl shadow-indigo-500/5">
            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-8">Performance Metrics</h3>
            <div className="space-y-8">
              {[
                { label: "Cost Reduction", value: "30%", color: "indigo" },
                { label: "Process Efficiency", value: "65%", color: "blue" },
                { label: "Risk Mitigation", value: "85%", color: "purple" }
              ].map((stat, i) => (
                <div key={i} className="group">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">{stat.label}</span>
                    <span className="text-white font-black text-2xl tracking-tighter">{stat.value}</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: stat.value }}
                      transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                      {...({ className: `h-full bg-gradient-to-r from-indigo-600 to-purple-600` } as any)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global SME Solutions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="glass-premium rounded-3xl p-10 group bg-[#05070a]/60">
            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-10 text-center">Industry Applications</h3>
            <div className="grid grid-cols-2 gap-6">
              {[
                { name: "Manufacturing", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
                { name: "Healthcare", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
                { name: "Technology", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
                { name: "Infrastructure", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" }
              ].map((item, i) => (
                <div key={i} className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-gray-300 font-black uppercase tracking-widest text-[10px]">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.9]">
              SME <span className="text-purple-500">Optimization</span>
            </h2>
            <p className="text-gray-400 mb-8 text-lg font-medium leading-relaxed">
              Tailored solutions for small and medium Companys looking to optimize their procurement
              processes without the complexity of Company-level systems.
            </p>
            <ul className="space-y-4">
              {[
                "Zero-config secure onboarding",
                "Value-based liquidity models",
                "Vertical scaling architecture"
              ].map((text, i) => (
                <li key={i} className="flex items-center text-gray-300 font-medium group">
                  <div className="w-6 h-6 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mr-4 group-hover:bg-purple-500 group-hover:text-black transition-all duration-300">
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </BasePage>
  );
};

export default Solutions;
