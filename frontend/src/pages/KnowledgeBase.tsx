import React from 'react';
import { motion } from 'framer-motion';
import BasePage from '../components/BasePage';

const KnowledgeBase: React.FC = () => {
  const topics = [
    { title: "Protocol FAQ", count: 24, icon: "M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: "Smart Contracts", count: 18, icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { title: "Tokens & Rewards", count: 12, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { title: "Dispute Resolution", count: 9, icon: "M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" }
  ];

  return (
    <BasePage
      title="Knowledge Base"
      subtitle="Find answers to common questions and technical details"
    >
      <div className="mb-16">
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-14 pr-6 py-5 bg-white/[0.03] border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
            placeholder="Search the RAPP registry..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {topics.map((topic, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            {...({ className: "group cursor-pointer" } as any)}
          >
            <div className="glass-premium rounded-3xl p-8 border-white/5 hover:border-indigo-500/20 transition-all h-full bg-[#05070a]/60">
              <div className="bg-white/5 w-12 h-12 rounded-xl mb-6 flex items-center justify-center text-gray-400 group-hover:text-indigo-400 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={topic.icon} />
                </svg>
              </div>
              <h3 className="text-lg font-black text-white mb-2 tracking-tight uppercase">{topic.title}</h3>
              <p className="text-indigo-500 text-[10px] font-black uppercase tracking-widest">{topic.count} Articles</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="glass-premium rounded-3xl p-10 border-white/5 bg-[#05070a]/40">
          <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Recent Updates</h3>
          <div className="space-y-6">
            {[
              "Standardizing RFP recursive bids",
              "Vendor staking mechanism update",
              "Mainnet gas optimization guides"
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center group cursor-pointer">
                <span className="text-gray-400 font-medium group-hover:text-white transition-colors">{item}</span>
                <svg className="h-4 w-4 text-gray-600 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-premium rounded-3xl p-10 border-white/5 bg-[#05070a]/40">
          <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Community Help</h3>
          <p className="text-gray-500 mb-8 font-medium">Join our Discord community to get real-time help from RAPP developers and other users.</p>
          <button className="flex items-center gap-3 px-6 py-3 rounded-xl bg-[#5865F2] text-white text-xs font-black uppercase tracking-widest hover:bg-[#4752C4] transition-all">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.23 10.23 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" /></svg>
            Join Discord
          </button>
        </div>
      </div>
    </BasePage>
  );
};

export default KnowledgeBase;
