import React from 'react';
import { motion } from 'framer-motion';

interface BlockchainExplorerLinkProps {
    txHash: string;
    className?: string;
}

/**
 * A reusable component that displays an info icon linking to a transaction on the Sepolia Etherscan.
 * Designed with a premium dark glass aesthetic.
 */
const BlockchainExplorerLink: React.FC<BlockchainExplorerLinkProps> = ({ txHash, className = "" }) => {
    if (!txHash) return null;

    const explorerUrl = `https://sepolia.etherscan.io/tx/${txHash}`;

    return (
        <div className={`relative group inline-block ${className}`}>
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-slate-900/90 border border-white/10 backdrop-blur-md rounded-lg text-[10px] font-black text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap shadow-2xl z-50">
                View on Etherscan
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900/90" />
            </div>

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-6 h-6 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white/70 hover:text-indigo-400 hover:border-indigo-500/50 hover:bg-indigo-500/10 transition-all duration-300 shadow-sm hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] cursor-pointer"
                >
                    <span className="text-[10px] font-bold leading-none italic font-serif">i</span>
                </a>
            </motion.div>
        </div>
    );
};

export default BlockchainExplorerLink;
