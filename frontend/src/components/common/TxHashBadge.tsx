import React, { useState } from 'react';

interface TxHashBadgeProps {
    hash: string | null | undefined;
    label?: string;
    className?: string;
}

export const TxHashBadge: React.FC<TxHashBadgeProps> = ({ hash, label, className = '' }) => {
    const [showToast, setShowToast] = useState(false);

    if (!hash) return null;

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        // Copy to clipboard
        navigator.clipboard.writeText(hash).catch(() => { });

        // Show toast message
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    return (
        <div className={`relative inline-flex items-center ${className}`}>
            <button
                onClick={handleClick}
                className="group flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40 rounded-md transition-all cursor-pointer"
                title="View Transaction Hash"
            >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                    <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                </span>
                <span className="text-[10px] font-mono text-indigo-300 group-hover:text-indigo-200">
                    {label ? `${label}: ` : ''}{hash.substring(0, 6)}...{hash.substring(hash.length - 4)}
                </span>
            </button>

            {/* Toast popup */}
            {showToast && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 whitespace-nowrap z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="bg-gray-900 border border-indigo-500/30 shadow-xl shadow-indigo-500/10 rounded-lg px-4 py-2 flex items-center gap-3">
                        <div className="bg-green-500/20 text-green-400 rounded-full p-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-white text-xs font-semibold mb-0.5">Transaction Hash Copied!</p>
                            <p className="text-indigo-300 text-[10px] font-mono select-all bg-black/30 px-1 py-0.5 rounded">{hash}</p>
                        </div>
                    </div>
                    {/* Arrow */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-0.5 border-4 border-transparent border-t-gray-900" />
                </div>
            )}
        </div>
    );
};
