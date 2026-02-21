import React from 'react';
import { motion } from 'framer-motion';
import BasePage from '../../components/BasePage';

const VendorOnboardingGuide: React.FC = () => {
    const steps = [
        { title: "Terminal Connection", desc: "Link your service provider terminal to the RAPP network using secure OAuth or wallet protocols." },
        { title: "Capability Mapping", desc: "List your service categories, operational regions, and technical capacity for automated listing matching." },
        { title: "Security Attestation", desc: "Pass the protocol's security attestation to verify your operational reliability and secured bidding capacity." },
        { title: "Bidding Activation", desc: "Activate your bidding terminal to receive real-time auction streams and submit secured quotes." }
    ];

    return (
        <BasePage
            title="Vendor Onboarding"
            subtitle="Establish your provider presence and activate bidding terminals"
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
                            <div className="relative glass-premium rounded-3xl p-8 border-white/5 bg-[#05070a]/40 flex gap-6 items-start border-emerald-500/0 hover:border-emerald-500/10 transition-colors">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-black transition-all font-black">
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

export default VendorOnboardingGuide;
