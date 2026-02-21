import React from 'react';
import { motion } from 'framer-motion';
import BasePage from '../components/BasePage';

const NewsList: React.FC = () => {
  return (
    <BasePage
      title="News & Updates"
      subtitle="The latest developments in decentralized procurement"
    >
      <div className="max-w-4xl mx-auto py-24">
        <div className="glass-premium rounded-[40px] p-20 border-white/5 bg-[#05070a]/40 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-500/5 to-purple-600/5 pointer-events-none"></div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            {...({ className: "relative z-10" } as any)}
          >
            <div className="w-24 h-24 bg-indigo-500/10 rounded-3xl flex items-center justify-center mx-auto mb-10 border border-indigo-500/20">
              <svg className="w-12 h-12 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>

            <h2 className="text-5xl font-black text-white mb-6 uppercase tracking-tighter">Coming <span className="text-gradient-brand">Soon</span></h2>
            <p className="text-gray-400 text-xl font-medium max-w-lg mx-auto leading-relaxed">
              Our reporting terminal is undergoing a precision upgrade. Check back soon for protocol updates and ecosystem news.
            </p>

            <div className="mt-12 flex justify-center gap-4">
              <div className="h-1 w-12 bg-indigo-500 rounded-full opacity-20"></div>
              <div className="h-1 w-12 bg-indigo-500 rounded-full"></div>
              <div className="h-1 w-12 bg-indigo-500 rounded-full opacity-20"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </BasePage>
  );
};

export default NewsList;
