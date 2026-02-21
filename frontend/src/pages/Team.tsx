import React from 'react';
import { motion } from 'framer-motion';
import BasePage from '../components/BasePage';

const Team: React.FC = () => {
  const teamMembers = [
    { name: "Siddharth Anwar", role: "Chief Executive Officer", bio: "Leading the global vision for decentralized procurement solutions.", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=sid" },
    { name: "Dr. Elena Vance", role: "Head of Protocol", bio: "Architect of our recursive consensus mechanism and smart contract security.", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena" },
    { name: "Marcus Thorne", role: "Chief Product Officer", bio: "Translating complex blockchain logic into world-class Company experiences.", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus" },
    { name: "Aisha Chen", role: "Lead Systems Engineer", bio: "Optimizing zero-knowledge verification for high-frequency purchasing.", image: "https://api.dicebear.com/7.x/avataaars/svg?seed=aisha" }
  ];

  return (
    <BasePage
      title="Our Team"
      subtitle="The architects of next-generation procurement protocols"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {teamMembers.map((member, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
            {...({ className: "group relative" } as any)}
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
            <div className="relative glass-premium rounded-3xl p-8 h-full flex flex-col items-center text-center border-white/5 bg-[#05070a]/60">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full group-hover:bg-indigo-500/40 transition-colors"></div>
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-32 h-32 rounded-3xl relative z-10 border border-white/10 group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tight uppercase">{member.name}</h3>
              <p className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4">{member.role}</p>
              <p className="text-gray-500 text-sm font-medium leading-relaxed italic">"{member.bio}"</p>

              <div className="mt-8 flex gap-4 pt-6 border-t border-white/5 w-full justify-center">
                {['M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z', 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z'].map((path, j) => (
                  <a key={j} href="#" className="text-gray-600 hover:text-indigo-400 transition-colors">
                    <svg className="h-5 w-5 fill-currentColor" viewBox="0 0 24 24">
                      <path d={path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-24 glass-premium rounded-[40px] p-16 relative overflow-hidden text-center max-w-5xl mx-auto border-indigo-500/10">
        <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <h2 className="text-4xl font-black text-white mb-6 uppercase tracking-tighter">Join the Engineering <span className="text-indigo-500">Core</span></h2>
        <p className="text-gray-400 mb-10 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
          We are always looking for exceptional engineers, cryptographers, and product designers
          who believe in the power of decentralization.
        </p>
        <button className="px-12 py-5 rounded-2xl bg-indigo-600 text-white text-xs font-black uppercase tracking-widest hover:bg-indigo-500 transition-all duration-300 shadow-2xl shadow-indigo-600/20">
          Explore Open Roles
        </button>
      </div>
    </BasePage>
  );
};

export default Team;
