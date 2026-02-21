import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import auctionService from '../../services/auctionService';
import { ROUTES } from '../../config/routes';
import type { LeaderboardData, LeaderboardEntry } from '../../types/auction';

const POLL_INTERVAL_MS = 3000;

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

const CompanyAuctionRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();  // listing ID
  const { user } = useAuth();
  const navigate = useNavigate();
  const listingId = parseInt(id!);

  const [auctionId, setAuctionId] = useState<number | null>(null);
  const [loadingAuction, setLoadingAuction] = useState(true);
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [ending, setEnding] = useState(false);
  const [endMsg, setEndMsg] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Step 1: resolve listing ID → real auction ID
  useEffect(() => {
    auctionService.getAuctionForListing(listingId)
      .then(res => {
        if (res.data.auction) {
          setAuctionId(res.data.auction.id);
        } else {
          setError('No auction found for this listing.');
        }
      })
      .catch(() => setError('Failed to load auction details.'))
      .finally(() => setLoadingAuction(false));
  }, [listingId]);

  const fetchLeaderboard = useCallback(async () => {
    if (!auctionId) return;
    try {
      const res = await auctionService.getLeaderboard(auctionId);
      setData(res.data);
      setTimeLeft(res.data.time_remaining_sec);
      setError(null);
      if (res.data.status === 'completed' || res.data.status === 'cancelled') {
        clearInterval(pollRef.current!);
        clearInterval(tickRef.current!);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to load leaderboard');
    }
  }, [auctionId]);

  // Step 2: start polling only once the real auctionId is known
  useEffect(() => {
    if (!auctionId) return;
    fetchLeaderboard();
    pollRef.current = setInterval(fetchLeaderboard, POLL_INTERVAL_MS);
    tickRef.current = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => {
      clearInterval(pollRef.current!);
      clearInterval(tickRef.current!);
    };
  }, [auctionId, fetchLeaderboard]);

  const handleEndAuction = async () => {
    if (!auctionId) return;
    if (!window.confirm('Are you sure you want to end this auction now?')) return;
    setEnding(true);
    try {
      await auctionService.endAuction(auctionId);
      setEndMsg('Auction ended successfully.');
      await fetchLeaderboard();
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to end auction');
    } finally {
      setEnding(false);
    }
  };

  const isAntiSnipeWindow = data && data.status === 'running' &&
    timeLeft > 0 && timeLeft <= (60);

  const isFinished = data?.status === 'completed' || data?.status === 'cancelled';

  if (loadingAuction) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => navigate(ROUTES.PROTECTED.COMPANY.LISTINGS_DETAIL.replace(':id', id!))}
              className="text-blue-300 hover:text-blue-100 mb-2 flex items-center gap-2"
            >
              ← Back to Listing
            </button>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              🔨 Reverse Auction Room
            </h1>
          </div>
          {data && !isFinished && (
            <button
              onClick={handleEndAuction}
              disabled={ending}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg font-semibold"
            >
              {ending ? 'Ending…' : 'End Auction Now'}
            </button>
          )}
        </div>

        {endMsg && (
          <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-lg">{endMsg}</div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* Timer + Status */}
        {data && (
          <div className={`rounded-xl p-6 text-center ${isFinished ? 'bg-gray-800/50 border border-gray-600' : isAntiSnipeWindow ? 'bg-orange-900/40 border border-orange-500 animate-pulse' : 'bg-blue-900/30 border border-blue-700/50'}`}>
            {isAntiSnipeWindow && (
              <p className="text-orange-300 text-sm font-semibold mb-2 uppercase tracking-wider">
                ⚠ Anti-Snipe Active — bids now extend the auction by 60 seconds
              </p>
            )}
            <p className="text-blue-300 text-sm mb-1 uppercase tracking-widest">
              {isFinished ? 'Auction Ended' : 'Time Remaining'}
            </p>
            <p className={`text-6xl font-mono font-bold ${isFinished ? 'text-gray-400' : isAntiSnipeWindow ? 'text-orange-300' : 'text-white'}`}>
              {isFinished ? '—' : formatCountdown(timeLeft)}
            </p>
            <p className={`mt-2 text-sm font-medium uppercase ${data.status === 'running' ? 'text-green-400' : 'text-gray-400'}`}>
              {data.status}
            </p>
          </div>
        )}

        {/* Stats row */}
        {data && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-4 text-center">
              <p className="text-blue-300 text-xs uppercase tracking-wider mb-1">Competing Vendors</p>
              <p className="text-3xl font-bold text-white">{data.leaderboard.length}</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-4 text-center">
              <p className="text-blue-300 text-xs uppercase tracking-wider mb-1">Current Lowest Bid</p>
              <p className="text-3xl font-bold text-green-300">
                {data.lowest_bid != null
                  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.lowest_bid)
                  : '—'}
              </p>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">🏆 Live Leaderboard (Top 10)</h2>
          {!data ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500" />
            </div>
          ) : data.leaderboard.length === 0 ? (
            <p className="text-blue-300 text-center py-6">No bids have been placed yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-blue-800/40">
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Rank</th>
                    <th className="text-left py-3 px-4 text-blue-300 font-medium">Vendor</th>
                    <th className="text-right py-3 px-4 text-blue-300 font-medium">Best Bid</th>
                  </tr>
                </thead>
                <tbody>
                  {data.leaderboard.slice(0, 10).map((entry: LeaderboardEntry) => (
                    <tr
                      key={entry.vendor_id}
                      className={`border-b border-blue-800/20 transition-colors ${entry.rank === 1 ? 'bg-yellow-900/20' : 'hover:bg-blue-800/10'}`}
                    >
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${entry.rank === 1 ? 'bg-yellow-500 text-black' : entry.rank === 2 ? 'bg-gray-400 text-black' : entry.rank === 3 ? 'bg-amber-700 text-white' : 'bg-blue-800/40 text-blue-200'}`}>
                          {entry.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-white font-medium">{entry.vendor_name}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-green-300">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(entry.current_best_bid)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Winner banner */}
        {isFinished && data && data.leaderboard.length > 0 && (
          <div className="bg-yellow-900/30 border border-yellow-600 rounded-xl p-6 text-center">
            <p className="text-yellow-400 text-sm uppercase tracking-wider mb-2">🏆 Auction Winner</p>
            <p className="text-3xl font-bold text-white">{data.leaderboard[0].vendor_name}</p>
            <p className="text-xl text-green-300 font-mono mt-1">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(data.leaderboard[0].current_best_bid)}
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanyAuctionRoom;

