import React from 'react';
import BasePage from '../components/BasePage';

const About: React.FC = () => {
  return (
    <BasePage
      title="About RAPP"
      subtitle="Revolutionizing procurement through blockchain innovation"
    >
      <div className="space-y-24">
        {/* Mission Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tighter uppercase leading-[0.9]">
              Our <span className="text-indigo-500">Mission</span>
            </h2>
            <p className="text-gray-400 mb-8 text-lg font-medium leading-relaxed">
              At RAPP, we're transforming the procurement landscape by leveraging blockchain technology
              to create transparent, efficient, and secure procurement processes for businesses worldwide.
            </p>
            <p className="text-gray-400 mb-10 text-lg font-medium leading-relaxed">
              Our platform eliminates traditional procurement pain points including lack of transparency,
              manual processes, and trust issues between buyers and suppliers.
            </p>
            <div className="grid grid-cols-2 gap-8">
              {[
                { label: "Companies", value: "500+" },
                { label: "Vendors", value: "2000+" },
                { label: "Processed", value: "$50M+" },
                { label: "Uptime", value: "99.9%" }
              ].map((stat, i) => (
                <div key={i} className="glass-premium rounded-2xl p-6 text-center border-white/5 bg-white/[0.02]">
                  <div className="text-3xl font-black text-white tracking-tighter mb-1">{stat.value}</div>
                  <div className="text-indigo-500 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[32px] blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
            <div className="relative glass-premium bg-gradient-to-br from-indigo-600 to-purple-800 rounded-[32px] p-12 border-0 shadow-2xl">
              <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">Our Vision</h3>
              <p className="text-white/80 mb-10 text-lg font-medium leading-relaxed">
                To become the global standard for blockchain-powered procurement,
                enabling businesses of all sizes to access fair, transparent, and efficient
                procurement processes.
              </p>
              <div className="space-y-5">
                {[
                  "Democratize access to opportunities",
                  "Reduce procurement costs globally",
                  "Establish trust through transparency"
                ].map((text, i) => (
                  <div key={i} className="flex items-center group/item">
                    <div className="bg-white/20 rounded-full p-1.5 mr-4 group-hover/item:bg-white group-hover/item:text-indigo-600 transition-all">
                      <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white/90 font-bold uppercase tracking-widest text-[10px]">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="text-center">
          <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase">Core <span className="text-indigo-500">Values</span></h2>
          <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full opacity-50 mb-16"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Transparency", desc: "Every transaction is visible and verifiable on the blockchain, ensuring complete transparency in all processes.", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
              { title: "Innovation", desc: "We continuously push the boundaries of what's possible in procurement technology, staying ahead of trends.", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
              { title: "Community", desc: "We believe in building a strong community of buyers and suppliers who support each other's success.", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857" }
            ].map((v, i) => (
              <div key={i} className="glass-premium rounded-3xl p-10 hover-lift transition-all duration-500 border-white/5 group">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-700 w-16 h-16 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-lg group-hover:scale-110 transition-all duration-500">
                  <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={v.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white mb-4 tracking-tight uppercase">{v.title}</h3>
                <p className="text-gray-500 font-medium leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-black text-white mb-4 tracking-tighter uppercase text-center">Our <span className="text-indigo-500">Evolution</span></h2>
          <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full opacity-50 mb-20"></div>
          <div className="space-y-12">
            {[
              { year: "2023", title: "Protocol Founded", desc: "RAPP was founded with the vision to revolutionize procurement using decentralized architecture." },
              { year: "2024", title: "Mainnet Beta Launch", desc: "Launched our MVP with core features including reverse auctions and integrated smart contracts." },
              { year: "2025", title: "Global Expansion", desc: "Expanded to serve companies and vendors across multiple industrial sectors and global territories." }
            ].map((entry, i) => (
              <div key={i} className="flex group items-center">
                <div className="text-center mr-12 hidden md:block">
                  <div className="text-2xl font-black text-indigo-500 tracking-tighter">{entry.year}</div>
                  <div className="h-1 w-8 bg-indigo-500/20 mx-auto mt-2"></div>
                </div>
                <div className="flex-1 glass-premium rounded-3xl p-8 hover-lift border-white/5 relative">
                  <div className="absolute left-0 top-1/2 -translate-x-1/2 md:-translate-x-[72px] w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] group-hover:scale-150 transition-all"></div>
                  <h3 className="text-xl font-black text-white mb-3 tracking-tight uppercase">{entry.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed">{entry.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </BasePage>
  );
};

export default About;
