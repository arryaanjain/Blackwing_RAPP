import React from 'react';
import { motion } from 'framer-motion';
import BasePage from '../components/BasePage';

const NewsList: React.FC = () => {
  const newsItems = [
    {
      date: "Oct 24, 2025",
      title: "RAPP Protocol v4.0 Mainnet Deployment",
      excerpt: "Introducing recursive ZK-proofs for near-instant settlement performance.",
      tag: "Protocol"
    },
    {
      date: "Oct 12, 2025",
      title: "Strategic Partnership with Global Logix",
      excerpt: "Integrating blockchain transparency into international shipping lanes.",
      tag: "Partnership"
    },
    {
      date: "Sep 28, 2025",
      title: "Security Audit Completion by Trail of Bits",
      excerpt: "The RAPP smart contract suite has passed a comprehensive security audit.",
      tag: "Security"
    }
  ];

  return (
    <BasePage
      title="News & Updates"
      subtitle="The latest developments in decentralized procurement"
    >
      <div className="max-w-4xl mx-auto space-y-8">
        {newsItems.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            {...({ className: "group relative" } as any)}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/0 to-purple-600/0 group-hover:from-indigo-500/10 group-hover:to-purple-600/10 rounded-3xl transition-all duration-500"></div>
            <div className="relative glass-premium rounded-3xl p-8 border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row gap-8 items-start">
              <div className="md:w-32 shrink-0">
                <div className="text-indigo-500 font-black text-xs uppercase tracking-[0.2em] mb-2">{item.date}</div>
                <div className="inline-block px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-gray-500">{item.tag}</div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed mb-6">{item.excerpt}</p>
                <button className="flex items-center text-[10px] font-black uppercase tracking-widest text-indigo-500 group-hover:text-white transition-colors">
                  Read Full Update
                  <svg className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 text-center">
        <button className="px-8 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
          View Archive
        </button>
      </div>
    </BasePage>
  );
};

export default NewsList;
