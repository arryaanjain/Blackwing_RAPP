import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import auctionService from '../../services/auctionService';
import { ROUTES } from '../../config/routes';
import type { Auction } from '../../types/auction';
import { TxHashBadge } from '../../components/common/TxHashBadge';

interface AuctionWithRelations extends Auction {
    listing?: {
        id: number;
        title: string;
        listing_number?: string;
        category?: string;
    };
    participants?: Array<{
        vendor_id: number;
        current_rank: number | null;
        current_best_bid: string | null;
        vendor?: { id: number; name: string };
    }>;
}

function formatTimeRemaining(endTime: string): string {
    const diff = Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000));
    if (diff <= 0) return 'Ended';
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

const CompanyAuctionsManager: React.FC = () => {
    const [auctions, setAuctions] = useState<AuctionWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [, setTick] = useState(0);

    // Receipt Modal State
    const [receiptModalOpen, setReceiptModalOpen] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);
    const [loadingReceipt, setLoadingReceipt] = useState(false);

    const fetchAuctions = useCallback(async () => {
        try {
            const res = await auctionService.getCompanyAuctions();
            setAuctions(res.data.auctions || []);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load auctions.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAuctions();
        const poll = setInterval(fetchAuctions, 10000);
        const tick = setInterval(() => setTick(t => t + 1), 1000);
        return () => { clearInterval(poll); clearInterval(tick); };
    }, [fetchAuctions]);

    const liveAuctions = auctions.filter(a => a.status === 'running');
    const scheduledAuctions = auctions.filter(a => a.status === 'scheduled');
    const completedAuctions = auctions.filter(a => a.status === 'completed' || a.status === 'cancelled');

    const statusConfig: Record<string, { label: string; bg: string; dot: string; text: string }> = {
        running: { label: 'LIVE', bg: 'bg-red-900/40', dot: 'bg-red-500 animate-pulse', text: 'text-red-300' },
        scheduled: { label: 'Scheduled', bg: 'bg-blue-900/40', dot: 'bg-blue-500', text: 'text-blue-300' },
        completed: { label: 'Completed', bg: 'bg-gray-900/40', dot: 'bg-gray-500', text: 'text-gray-300' },
        cancelled: { label: 'Cancelled', bg: 'bg-gray-900/40', dot: 'bg-gray-600', text: 'text-gray-400' },
    };

    const getWinner = (auction: AuctionWithRelations) => {
        if (!auction.participants) return null;
        return auction.participants.find(p => p.current_rank === 1);
    };

    const openReceiptModal = async (auctionId: number) => {
        setReceiptModalOpen(true);
        setLoadingReceipt(true);
        try {
            const res = await auctionService.getReceipt(auctionId);
            setReceiptData(res.data);
        } catch (err: any) {
            console.error('Failed to load receipt:', err);
        } finally {
            setLoadingReceipt(false);
        }
    };

    const renderAuctionCard = (auction: AuctionWithRelations) => {
        const config = statusConfig[auction.status] || statusConfig.completed;
        const isLive = auction.status === 'running';
        const isFinished = auction.status === 'completed' || auction.status === 'cancelled';
        const winner = isFinished ? getWinner(auction) : null;

        return (
            <div
                key={auction.id}
                className={`relative overflow-hidden rounded-xl border transition-all hover:scale-[1.01] ${isLive
                    ? 'bg-gradient-to-br from-red-900/20 to-orange-900/10 border-red-700/50 shadow-lg shadow-red-900/20'
                    : isFinished
                        ? 'bg-[#0d1117]/80 border-white/5'
                        : 'bg-blue-900/10 border-blue-700/30'
                    }`}
            >
                {isLive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />}

                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-lg truncate">
                                {auction.listing?.title || `Listing #${auction.listing_id}`}
                            </h3>
                            {auction.listing?.category && (
                                <span className="bg-white/5 text-gray-400 text-[10px] px-2 py-0.5 rounded-full uppercase mt-1 inline-block">
                                    {auction.listing.category}
                                </span>
                            )}
                        </div>
                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                            {config.label}
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className={`rounded-lg p-3 text-center ${isLive ? 'bg-red-900/20 border border-red-800/30' : 'bg-white/3 border border-white/5'}`}>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                                {isFinished ? 'Duration' : 'Time Left'}
                            </p>
                            <p className={`text-lg font-mono font-bold ${isLive ? 'text-red-300' : 'text-white'}`}>
                                {isFinished ? '—' : formatTimeRemaining(auction.end_time)}
                            </p>
                        </div>

                        <div className="bg-white/3 border border-white/5 rounded-lg p-3 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Vendors</p>
                            <p className="text-lg font-bold text-blue-300">
                                {auction.participants?.length ?? 0}
                            </p>
                        </div>

                        <div className="bg-white/3 border border-white/5 rounded-lg p-3 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                                {isFinished ? 'Winner' : 'Leading'}
                            </p>
                            {winner ? (
                                <>
                                    <p className="text-sm font-bold text-yellow-400 truncate">{winner.vendor?.name || `Vendor #${winner.vendor_id}`}</p>
                                    <p className="text-[10px] text-green-300 font-mono">${Number(winner.current_best_bid).toLocaleString()}</p>
                                </>
                            ) : (
                                <p className="text-lg font-bold text-gray-500">—</p>
                            )}
                        </div>
                    </div>

                    {/* Blockchain receipt indicator for completed auctions */}
                    {isFinished && auction.receipt_tx_hash && (
                        <div className="mt-3 flex items-center gap-2 text-[10px] text-green-400 bg-green-900/20 border border-green-800/30 rounded-lg px-3 py-1.5">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            <span className="shrink-0">On-chain receipt verified</span>
                            <div className="ml-auto">
                                <TxHashBadge hash={auction.receipt_tx_hash} />
                            </div>
                        </div>
                    )}

                    {/* Action */}
                    <div className="mt-4 flex items-center justify-between">
                        {isFinished && auction.receipt_tx_hash ? (
                            <button
                                onClick={() => openReceiptModal(auction.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                View History
                            </button>
                        ) : (
                            <div /> // Spacer
                        )}

                        <Link
                            to={ROUTES.PROTECTED.COMPANY.AUCTION_ROOM.replace(':id', String(auction.listing_id))}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isLive
                                ? 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-lg shadow-red-900/30'
                                : isFinished
                                    ? 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                {isFinished ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                )}
                            </svg>
                            {isLive ? 'Monitor Live' : isFinished ? 'View Results' : 'View Details'}
                        </Link>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Page Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <div className="bg-amber-500/20 p-2.5 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        My Auctions
                    </h1>
                    <p className="text-gray-400 mt-1 ml-16">
                        Reverse auctions you've escalated from listings — monitor vendor competition in real-time
                    </p>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-800/40 rounded-lg p-4 text-red-300 text-sm">{error}</div>
                )}

                {auctions.length === 0 && !error ? (
                    <div className="bg-blue-900/10 border border-blue-800/30 rounded-xl p-12 text-center">
                        <div className="bg-blue-500/10 w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3 className="text-white text-lg font-semibold mb-2">No Auctions Yet</h3>
                        <p className="text-gray-400 text-sm max-w-md mx-auto">
                            When you escalate a listing with vendor quotes to a reverse auction, it will appear here.
                            Go to your listings and use "Send to Auction" to get started!
                        </p>
                        <Link
                            to={ROUTES.PROTECTED.COMPANY.LISTINGS}
                            className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            View My Listings
                        </Link>
                    </div>
                ) : (
                    <>
                        {liveAuctions.length > 0 && (
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                    <h2 className="text-xl font-bold text-white">Live Now</h2>
                                    <span className="bg-red-900/40 text-red-300 text-xs px-2 py-0.5 rounded-full font-bold">{liveAuctions.length}</span>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {liveAuctions.map(renderAuctionCard)}
                                </div>
                            </section>
                        )}

                        {scheduledAuctions.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-blue-500" />
                                    Scheduled
                                </h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {scheduledAuctions.map(renderAuctionCard)}
                                </div>
                            </section>
                        )}

                        {completedAuctions.length > 0 && (
                            <section>
                                <h2 className="text-xl font-semibold text-gray-400 mb-4 flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-gray-500" />
                                    Completed
                                </h2>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {completedAuctions.map(renderAuctionCard)}
                                </div>
                            </section>
                        )}
                    </>
                )}
            </div>

            {/* Receipt Modal */}
            {receiptModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between shrink-0 bg-gray-900/50">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                    Blockchain Receipt History
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">
                                    Chronological on-chain transactions for this auction
                                </p>
                            </div>
                            <button
                                onClick={() => setReceiptModalOpen(false)}
                                className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto overflow-x-hidden flex-1">
                            {loadingReceipt ? (
                                <div className="flex flex-col items-center justify-center h-48 space-y-4">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500" />
                                    <p className="text-indigo-400 text-sm font-mono">Fetching receipt records from chain...</p>
                                </div>
                            ) : receiptData?.transactions?.length > 0 ? (
                                <div className="relative border-l-2 border-indigo-500/30 ml-4 py-2 space-y-8">
                                    {receiptData.transactions.map((tx: any, idx: number) => {
                                        const isCreation = tx.event === 'auction_created';
                                        const isEnd = tx.event === 'auction_ended';
                                        const isBid = tx.event === 'bid_placed';

                                        return (
                                            <div key={tx.tx_hash || idx} className="relative pl-6">
                                                {/* Node dot */}
                                                <div className={`absolute -left-[9px] top-1.5 h-4 w-4 rounded-full border-4 border-gray-900 ${isCreation ? 'bg-amber-400' :
                                                    isEnd ? 'bg-green-400' : 'bg-blue-400'
                                                    }`} />

                                                <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-indigo-500/30 transition-colors">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded ${isCreation ? 'bg-amber-500/20 text-amber-300' :
                                                                    isEnd ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'
                                                                    }`}>
                                                                    {isCreation && 'Auction Created'}
                                                                    {isEnd && 'Auction Ended / Receipt Generated'}
                                                                    {isBid && 'Bid Placed'}
                                                                </span>
                                                                <span className="text-xs text-gray-500 font-mono">
                                                                    {new Date(tx.timestamp).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-white font-medium">
                                                                {isCreation && `Listing: ${tx.details?.listing_title || 'N/A'}`}
                                                                {isEnd && (tx.details?.winner_name ? `Winner: ${tx.details.winner_name}` : 'Auction Ended Without Winner')}
                                                                {isBid && `Vendor: ${tx.details?.vendor_name || 'N/A'}`}
                                                            </h4>
                                                        </div>
                                                        {tx.tx_hash && <TxHashBadge hash={tx.tx_hash} />}
                                                    </div>

                                                    {isBid && (
                                                        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/5">
                                                            <div>
                                                                <span className="text-[10px] text-gray-500 uppercase">Amount</span>
                                                                <p className="text-sm text-green-400 font-mono font-bold">${tx.details.bid_amount?.toLocaleString()}</p>
                                                            </div>
                                                            {!tx.details.valid && (
                                                                <span className="text-[10px] text-red-400 border border-red-500/30 bg-red-500/10 px-2 py-0.5 rounded uppercase">Invalidated</span>
                                                            )}
                                                        </div>
                                                    )}

                                                    {isEnd && tx.details?.winner_name && (
                                                        <div className="flex items-center gap-4 mt-2 pt-2 border-t border-white/5">
                                                            <div>
                                                                <span className="text-[10px] text-gray-500 uppercase">Winning Bid</span>
                                                                <p className="text-sm text-green-400 font-mono font-bold">${tx.details.winning_bid?.toLocaleString()}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-[10px] text-gray-500 uppercase">Total Bids</span>
                                                                <p className="text-sm text-blue-300 font-mono font-bold">{tx.details.total_bids}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    No tracked transactions found for this auction.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CompanyAuctionsManager;
