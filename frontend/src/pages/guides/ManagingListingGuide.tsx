import React from 'react';
import { motion } from 'framer-motion';
import BasePage from '../../components/BasePage';

const ManagingListingGuide: React.FC = () => {
    const steps = [
        { title: "Listing Genesis", desc: "Define your requirements, budget parameters, and technical specifications for the new procurement listing." },
        { title: "Market Deployment", desc: "Deploy your listing to the RAPP marketplace with specific vendor visibility filters and ZK-privacy settings." },
        { title: "Auction Execution", desc: "Monitor real-time reverse auction progress. RAPP's automated matching engine handles bid validation and ranking." },
        { title: "Settlement & Finalization", desc: "Review the top-ranked bids, select the winning vendor, and initialize the automated smart contract settlement." }
    ];

    return (
        <BasePage
            title="Managing Listing"
            subtitle="Full lifecycle management of your procurement listings and auctions"
        >
            <div className="max-w-4xl mx-auto">
                <div className="space-y-8">
                    {steps.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: i * 0.1 }}
                            {...({ className: "group relative" } as any)}
                        >
                            <div className="relative glass-premium rounded-3xl p-8 border-white/5 bg-[#05070a]/40 flex gap-6 items-start border-indigo-500/0 hover:border-indigo-500/10 transition-colors">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500 group-hover:text-black transition-all font-black">
                                    {i + 1}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{step.title}</h3>
                                    <p className="text-gray-500 font-medium leading-relaxed">{step.desc}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </BasePage>
    );
};

export default ManagingListingGuide;
