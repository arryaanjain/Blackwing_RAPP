import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import BasePage from '../components/BasePage';
import { ROUTES } from '../config/routes';

const Guides: React.FC = () => {
  const guides = [
    {
      title: "Setting up your Company profile",
      time: "5 min",
      level: "Beginner",
      href: ROUTES.PUBLIC.GUIDE_COMPANY_SETUP,
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
    },
    {
      title: "Onboarding as a verified Vendor",
      time: "8 min",
      level: "Beginner",
      href: ROUTES.PUBLIC.GUIDE_VENDOR_ONBOARDING,
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    },
    {
      title: "Managing Listing",
      time: "12 min",
      level: "Intermediate",
      href: ROUTES.PUBLIC.GUIDE_MANAGING_LISTING,
      icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    },
    {
      title: "Smart Contract security best practices",
      time: "20 min",
      level: "Advanced",
      href: ROUTES.PUBLIC.GUIDE_SECURITY_BEST_PRACTICES,
      icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    }
  ];

  return (
    <BasePage
      title="Guides"
      subtitle="Step-by-step instructions to master the RAPP protocol"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {guides.map((guide, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            {...({ className: "group relative" } as any)}
          >
            <div className="relative glass-premium rounded-[32px] p-10 border-white/5 bg-[#05070a]/40 hover:bg-[#05070a]/60 transition-all duration-500 flex flex-col sm:flex-row gap-8 items-center border-indigo-500/0 hover:border-indigo-500/10">
              <div className="w-20 h-20 shrink-0 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-black transition-all">
                <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={guide.icon} />
                </svg>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mb-3">
                  <span className="text-indigo-500 text-[10px] font-black uppercase tracking-widest">{guide.time}</span>
                  <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">•</span>
                  <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{guide.level}</span>
                </div>
                <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-tight group-hover:text-indigo-400 transition-colors leading-tight">{guide.title}</h3>
                <Link to={guide.href}>
                  <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all">
                    Start Guide
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 relative rounded-[40px] overflow-hidden p-16 text-center border-white/5 glass-premium">
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Contributor <span className="text-indigo-500">Playbook</span></h2>
          <p className="text-gray-400 mb-10 text-lg font-medium leading-relaxed">
            Want to contribute to the protocol? Review our architect guides for recursive ZK implementors and node operators.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to={ROUTES.PUBLIC.DOCS}>
              <button className="px-10 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all">
                Developer Docs
              </button>
            </Link>
          </div>
        </div>
      </div>
    </BasePage>
  );
};

export default Guides;
