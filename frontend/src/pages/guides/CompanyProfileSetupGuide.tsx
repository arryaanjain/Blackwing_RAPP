import React from 'react';
import { motion } from 'framer-motion';
import BasePage from '../../components/BasePage';

const CompanyProfileSetupGuide: React.FC = () => {
    const steps = [
        { title: "Initialize Identity", desc: "Connect your corporate wallet and verify ownership to initialize your company identity on-chain." },
        { title: "Profile Configuration", desc: "Define your company metadata, operational industry, and procurement preferences." },
        { title: "Verification Stack", desc: "Submit necessary documentation for the automated ZK-verification process to achieve 'Verified' status." },
        { title: "Console Access", desc: "Once verified, access your advanced Company Console to begin creating procurement listings." }
    ];

    return (
        <BasePage
            title="Company Profile Setup"
            subtitle="Initialize your corporate infrastructure on the RAPP protocol"
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
                            <div className="relative glass-premium rounded-3xl p-8 border-white/5 bg-[#05070a]/40 flex gap-6 items-start">
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

export default CompanyProfileSetupGuide;
