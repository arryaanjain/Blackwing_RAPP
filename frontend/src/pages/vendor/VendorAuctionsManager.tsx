import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import auctionService from '../../services/auctionService';
import { ROUTES } from '../../config/routes';
import type { Auction } from '../../types/auction';

interface AuctionWithRelations extends Auction {
    listing?: {
        id: number;
        title: string;
        listing_number?: string;
        category?: string;
        base_price?: number;
        company?: { company_name?: string };
    };
    participants?: Array<{
        vendor_id: number;
        current_rank: number | null;
        current_best_bid: string | null;
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

const VendorAuctionsManager: React.FC = () => {
    const [auctions, setAuctions] = useState<AuctionWithRelations[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [, setTick] = useState(0);

    const fetchAuctions = useCallback(async () => {
        try {
            const res = await auctionService.getMyAuctions();
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

    const getMyParticipant = (auction: AuctionWithRelations) => auction.participants?.[0];

    const statusConfig: Record<string, { label: string; bg: string; dot: string; text: string }> = {
        running: { label: 'LIVE', bg: 'bg-red-900/40', dot: 'bg-red-500 animate-pulse', text: 'text-red-300' },
        scheduled: { label: 'Scheduled', bg: 'bg-blue-900/40', dot: 'bg-blue-500', text: 'text-blue-300' },
        completed: { label: 'Completed', bg: 'bg-gray-900/40', dot: 'bg-gray-500', text: 'text-gray-300' },
        cancelled: { label: 'Cancelled', bg: 'bg-gray-900/40', dot: 'bg-gray-600', text: 'text-gray-400' },
    };

    const renderAuctionCard = (auction: AuctionWithRelations) => {
        const participant = getMyParticipant(auction);
        const config = statusConfig[auction.status] || statusConfig.completed;
        const isLive = auction.status === 'running';
        const isFinished = auction.status === 'completed' || auction.status === 'cancelled';

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
                {/* Live pulsing top border */}
                {isLive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 animate-pulse" />}

                <div className="p-5">
                    {/* Header row */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-semibold text-lg truncate">
                                {auction.listing?.title || `Listing #${auction.listing_id}`}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                                {auction.listing?.company?.company_name && (
                                    <span className="text-gray-400 text-xs">by {auction.listing.company.company_name}</span>
                                )}
                                {auction.listing?.category && (
                                    <span className="bg-white/5 text-gray-400 text-[10px] px-2 py-0.5 rounded-full uppercase">
                                        {auction.listing.category}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${config.bg} ${config.text}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                            {config.label}
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        {/* Timer */}
                        <div className={`rounded-lg p-3 text-center ${isLive ? 'bg-red-900/20 border border-red-800/30' : 'bg-white/3 border border-white/5'}`}>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">
                                {isFinished ? 'Duration' : 'Time Left'}
                            </p>
                            <p className={`text-lg font-mono font-bold ${isLive ? 'text-red-300' : 'text-white'}`}>
                                {isFinished ? '—' : formatTimeRemaining(auction.end_time)}
                            </p>
                        </div>

                        {/* Your Rank */}
                        <div className="bg-white/3 border border-white/5 rounded-lg p-3 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Your Rank</p>
                            <p className={`text-lg font-bold ${participant?.current_rank === 1 ? 'text-yellow-400' :
                                participant?.current_rank ? 'text-white' : 'text-gray-500'
                                }`}>
                                {participant?.current_rank ? `#${participant.current_rank}` : '—'}
                            </p>
                            {participant?.current_rank === 1 && (
                                <p className="text-yellow-400/70 text-[10px]">🏆 Leading</p>
                            )}
                        </div>

                        {/* Your Best Bid */}
                        <div className="bg-white/3 border border-white/5 rounded-lg p-3 text-center">
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">Your Bid</p>
                            <p className="text-lg font-bold text-green-300 font-mono">
                                {participant?.current_best_bid
                                    ? `$${Number(participant.current_best_bid).toLocaleString()}`
                                    : '—'}
                            </p>
                        </div>
                    </div>

                    {/* Action row */}
                    <div className="mt-4 flex justify-end">
                        <Link
                            to={ROUTES.PROTECTED.VENDOR.AUCTION_ROOM.replace(':auctionId', String(auction.id))}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isLive
                                ? 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-lg shadow-red-900/30'
                                : isFinished
                                    ? 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            {isLive ? 'Enter Auction' : isFinished ? 'View Results' : 'View Details'}
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
                        Reverse auctions you've been enrolled in — compete to win contracts with the lowest bid
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
                            When a company escalates a listing you've quoted on to a reverse auction, it will appear here.
                            Start by browsing listings and submitting quotes!
                        </p>
                        <Link
                            to={ROUTES.PROTECTED.VENDOR.LISTINGS}
                            className="inline-block mt-6 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
                        >
                            Browse Listings
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Live Auctions */}
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

                        {/* Scheduled Auctions */}
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

                        {/* Completed Auctions */}
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
        </DashboardLayout>
    );
};

export default VendorAuctionsManager;
