import React from 'react';
import { motion } from 'framer-motion';
import BasePage from '../components/BasePage';

const Demo: React.FC = () => {
  return (
    <BasePage
      title="Interactive Demo"
      subtitle="Experience RAPP in action with our interactive demonstration"
    >
      <div className="space-y-24">
        {/* Demo Video Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          {...({ className: "relative max-w-5xl mx-auto" } as any)}
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-[32px] blur-2xl"></div>
          <div className="relative glass-premium rounded-[32px] p-4 bg-[#05070a]/40 overflow-hidden group">
            <div className="aspect-video bg-[#020617] rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 group-hover:opacity-0 transition-opacity duration-700"></div>
              <div className="relative z-10 text-center">
                <button className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full p-8 mb-6 inline-block hover:scale-110 hover:bg-white/20 transition-all duration-500 hover:shadow-2xl hover:shadow-white/10 group-active:scale-95">
                  <svg className="h-12 w-12 text-white fill-white" viewBox="0 0 20 20">
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.333-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
                  </svg>
                </button>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tighter uppercase">Watch Simulation</h3>
                <p className="text-gray-400 font-medium">Protocol Execution & Vendor Settlement Demo</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Interactive Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="glass-premium rounded-3xl p-10 hover-lift transition-all duration-500 border-indigo-500/10 group">
            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-6">Environment A</h3>
            <h4 className="text-3xl font-black text-white mb-6 tracking-tighter uppercase">Company Console</h4>
            <p className="text-gray-400 mb-10 text-lg leading-relaxed font-medium">
              Explore how companies create listings, manage vendors, and track procurement activities in real-time.
            </p>
            <button className="w-full py-5 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-gray-200 transition-all duration-300 shadow-xl shadow-white/5">
              Launch Company Sandbox
            </button>
          </div>

          <div className="glass-premium rounded-3xl p-10 hover-lift transition-all duration-500 border-purple-500/10 group">
            <h3 className="text-xs font-black text-purple-500 uppercase tracking-[0.3em] mb-6">Environment B</h3>
            <h4 className="text-3xl font-black text-white mb-6 tracking-tighter uppercase">Vendor Terminal</h4>
            <p className="text-gray-400 mb-10 text-lg leading-relaxed font-medium">
              Experience the vendor perspective - browse listings, submit bids, and manage secured contracts.
            </p>
            <button className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all duration-300">
              Launch Vendor Terminal
            </button>
          </div>
        </div>

        {/* Key Demo Features */}
        <div className="relative">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Protocol <span className="text-gradient-brand">Capabilities</span></h2>
            <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full opacity-50"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Live Bidding", desc: "Real-time auction mechanics with automated bid processing", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
              { title: "Quantum Analytics", desc: "Comprehensive reporting and predictive performance metrics", icon: "M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" },
              { title: "Immutable Verification", desc: "See how transactions are secured and verified on-chain", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" }
            ].map((f, i) => (
              <div key={i} className="text-center group">
                <div className="bg-white/[0.03] border border-white/5 w-20 h-20 rounded-3xl mx-auto mb-6 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-all duration-500 hover:border-indigo-500/30">
                  <svg className="h-10 w-10 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={f.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white mb-3 tracking-tight uppercase">{f.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Schedule Demo */}
        <div className="relative rounded-[40px] overflow-hidden p-12 text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-700"></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Request Personalized Audit</h2>
            <p className="text-white/80 mb-10 text-lg font-medium">
              Schedule a deep-dive session with our solutions architects to identify your procurement optimization surface.
            </p>
            <button className="px-12 py-5 rounded-2xl bg-white text-black text-xs font-black uppercase tracking-widest hover:bg-gray-100 transition-all duration-300 shadow-2xl shadow-black/20">
              Book Strategic Call
            </button>
          </div>
        </div>
      </div>
    </BasePage>
  );
};

export default Demo;
