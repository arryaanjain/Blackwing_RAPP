import React from 'react';
// motion removed as unused
import BasePage from '../components/BasePage';

const Careers: React.FC = () => {
  return (
    <BasePage
      title="Careers"
      subtitle="Build the infrastructure of global procurement"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-24">
        <div>
          <h2 className="text-4xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.9]">
            Work at <span className="text-indigo-500">The Edge</span>
          </h2>
          <p className="text-gray-400 mb-8 text-lg font-medium leading-relaxed">
            We're a fast-growing team of decentralization maximalists and procurement experts
            working on one of most challenging problems in global trade.
          </p>
          <div className="space-y-6">
            {[
              { title: "Remote-First", desc: "Work from anywhere in the world with our globally distributed team structure." },
              { title: "Equity & Ownership", desc: "Every core contributor receives significant token and equity incentives." },
              { title: "Leading Tech Stack", desc: "Work with Solang, Rust, React, and high-performance recursive ZK protocols." }
            ].map((p, i) => (
              <div key={i} className="flex gap-6 group">
                <div className="h-12 w-12 shrink-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-black transition-all">
                  <span className="font-black text-xs">{i + 1}</span>
                </div>
                <div>
                  <h3 className="text-white font-black uppercase tracking-widest text-[10px] mb-1">{p.title}</h3>
                  <p className="text-gray-500 text-sm font-medium">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-premium rounded-[40px] p-12 border-indigo-500/10 relative overflow-hidden flex flex-col items-center justify-center text-center bg-[#05070a]/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>

          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 border border-white/10">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight">Current Openings</h3>
          <p className="text-gray-400 font-medium text-lg mb-8">
            No current openings available.
          </p>
          <p className="text-gray-600 text-sm max-w-xs uppercase tracking-widest font-bold">
            Follow our social channels for future opportunities.
          </p>
        </div>
      </div>
    </BasePage>
  );
};

export default Careers;
