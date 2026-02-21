import React from 'react';
import { motion } from 'framer-motion';
import BasePage from '../../components/BasePage';

const SecurityBestPracticesGuide: React.FC = () => {
    const practices = [
        { title: "Private Key Isolation", desc: "Always utilize hardware-based key management for sensitive protocol interactions and settlement approvals." },
        { title: "Listing Anonymization", desc: "Leverage RAPP's native ZK-proofs to anonymize sensitive procurement requirements while still ensuring vendor match accuracy." },
        { title: "Multi-Signature Authorization", desc: "Configure multi-sig requirement for high-value settlement finalization to prevent single-point failures." },
        { title: "Regular Audit Cycles", desc: "Periodically review your operational permissions and rotate API keys through the Security Terminal." }
    ];

    return (
        <BasePage
            title="Security Best Practices"
            subtitle="Implement superior security architecture for your procurement operations"
        >
            <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8">
                    {practices.map((practice, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: i * 0.1 }}
                            {...({ className: "group relative" } as any)}
                        >
                            <div className="relative glass-premium rounded-3xl p-8 border-white/5 bg-[#05070a]/40 h-full border-purple-500/0 hover:border-purple-500/20 transition-all duration-500">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{practice.title}</h3>
                                <p className="text-gray-500 font-medium leading-relaxed text-sm">{practice.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </BasePage>
    );
};

export default SecurityBestPracticesGuide;
