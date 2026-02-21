import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import BasePage from '../components/BasePage';

const Onboarding: React.FC = () => {
    const { loginWithGoogle } = useAuth();

    const handleSelect = (type: 'company' | 'vendor') => {
        localStorage.setItem('intended_profile_type', type);
        loginWithGoogle();
    };

    return (
        <BasePage
            title="Platform Onboarding"
            subtitle="Select your operational role to initialize protocol access"
        >
            <div className="max-w-4xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Company Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        {...({ className: "group cursor-pointer" } as any)}
                        onClick={() => handleSelect('company')}
                    >
                        <div className="glass-premium rounded-[40px] p-12 border-white/5 bg-[#05070a]/40 hover:bg-[#05070a]/60 transition-all duration-500 text-center border-indigo-500/0 hover:border-indigo-500/20 shadow-2xl">
                            <div className="w-24 h-24 bg-indigo-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-black transition-all border border-indigo-500/10">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">Company</h3>
                            <p className="text-gray-400 font-medium leading-relaxed mb-10">
                                Initialize as a procurement entity. Manage listings, verify vendors, and execute high-volume trade protocols.
                            </p>
                            <div className="inline-flex items-center gap-3 text-indigo-400 font-black uppercase tracking-widest text-xs group-hover:text-white transition-colors">
                                Initialize Genesis
                                <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>

                    {/* Vendor Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        {...({ className: "group cursor-pointer" } as any)}
                        onClick={() => handleSelect('vendor')}
                    >
                        <div className="glass-premium rounded-[40px] p-12 border-white/5 bg-[#05070a]/40 hover:bg-[#05070a]/60 transition-all duration-500 text-center border-emerald-500/0 hover:border-emerald-500/20 shadow-2xl">
                            <div className="w-24 h-24 bg-emerald-500/10 rounded-[32px] flex items-center justify-center mx-auto mb-10 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-black transition-all border border-emerald-500/10">
                                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <h3 className="text-3xl font-black text-white mb-6 uppercase tracking-tighter">Vendor</h3>
                            <p className="text-gray-400 font-medium leading-relaxed mb-10">
                                Register as a verified service provider. Access auction streams, submit secured quotes, and scale trade volume.
                            </p>
                            <div className="inline-flex items-center gap-3 text-emerald-400 font-black uppercase tracking-widest text-xs group-hover:text-white transition-colors">
                                Connect Terminal
                                <svg className="w-4 h-4 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-20 text-center">
                    <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">
                        Secure single sign-on powered by RAPP Auth v4
                    </p>
                </div>
            </div>
        </BasePage>
    );
};

export default Onboarding;
