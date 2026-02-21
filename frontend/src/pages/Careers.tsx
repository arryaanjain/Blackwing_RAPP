import React from 'react';
import { motion } from 'framer-motion';
import BasePage from '../components/BasePage';

const Careers: React.FC = () => {
  const jobOpenings = [
    { title: "Protocol Engineer", department: "Engineering", location: "Remote / Dubai", type: "Full-time" },
    { title: "Smart Contract Auditor", department: "Security", location: "Remote", type: "Full-time" },
    { title: "Senior UI Designer", department: "Product", location: "Global Remote", type: "Full-time" },
    { title: "Head of Growth", department: "Marketing", location: "London / Hybrid", type: "Full-time" }
  ];

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

        <div className="glass-premium rounded-[40px] p-10 border-indigo-500/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
          <h3 className="text-2xl font-black text-white mb-10 tracking-tight uppercase">Current Openings</h3>
          <div className="space-y-4">
            {jobOpenings.map((job, i) => (
              <motion.div
                key={i}
                whileHover={{ x: 8 }}
                {...({ className: "p-6 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] hover:border-indigo-500/30 transition-all cursor-pointer group" } as any)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-black uppercase tracking-tight mb-1 group-hover:text-indigo-400 transition-colors">{job.title}</h4>
                    <div className="flex gap-4">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{job.department}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500/70">{job.location}</span>
                    </div>
                  </div>
                  <svg className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
          <button className="w-full mt-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all">
            View All Positions
          </button>
        </div>
      </div>
    </BasePage>
  );
};

export default Careers;
