import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import auctionService from '../../services/auctionService';
import { ROUTES } from '../../config/routes';
import type { VendorRankData } from '../../types/auction';

const POLL_INTERVAL_MS = 3000;

function formatCountdown(seconds: number): string {
  if (seconds <= 0) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map(n => String(n).padStart(2, '0')).join(':');
}

const VendorAuctionRoom: React.FC = () => {
  const { auctionId } = useParams<{ auctionId: string }>();
  const navigate = useNavigate();
  const id = parseInt(auctionId!);

  const [rankData, setRankData] = useState<VendorRankData | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [bidInput, setBidInput] = useState('');
  const [bidding, setBidding] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [myBids, setMyBids] = useState<any[]>([]);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchRank = useCallback(async () => {
    try {
      const res = await auctionService.getMyRank(id);
      setRankData(res.data);
      setTimeLeft(res.data.time_remaining_sec);
      setError(null);
      if (res.data.status === 'completed' || res.data.status === 'cancelled') {
        clearInterval(pollRef.current!);
        clearInterval(tickRef.current!);
      }
    } catch (e: any) {
      setError(e.response?.data?.message || 'Could not load your rank');
    }
  }, [id]);

  const fetchMyBids = useCallback(async () => {
    try {
      const res = await auctionService.getMyBids(id);
      setMyBids(res.data?.data ?? res.data ?? []);
    } catch { /* ignore */ }
  }, [id]);

  useEffect(() => {
    fetchRank();
    fetchMyBids();
    pollRef.current = setInterval(() => { fetchRank(); fetchMyBids(); }, POLL_INTERVAL_MS);
    tickRef.current = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => {
      clearInterval(pollRef.current!);
      clearInterval(tickRef.current!);
    };
  }, [fetchRank, fetchMyBids]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(bidInput);
    if (isNaN(amount) || amount <= 0) {
      setBidError('Please enter a valid bid amount.');
      return;
    }
    setBidding(true);
    setBidError(null);
    setBidSuccess(null);
    try {
      await auctionService.placeBid(id, amount);
      setBidSuccess(`Bid of $${amount.toLocaleString()} placed successfully!`);
      setBidInput('');
      await fetchRank();
      await fetchMyBids();
    } catch (e: any) {
      setBidError(e.response?.data?.message || 'Failed to place bid');
    } finally {
      setBidding(false);
    }
  };

  const isFinished = rankData?.status === 'completed' || rankData?.status === 'cancelled';
  const isRunning = rankData?.status === 'running';
  const isAntiSnipe = isRunning && timeLeft > 0 && timeLeft <= 60;

  const rankColor = (rank: number | null) => {
    if (!rank) return 'text-gray-400';
    if (rank === 1) return 'text-yellow-400';
    if (rank <= 3) return 'text-blue-300';
    return 'text-white';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <button
            onClick={() => navigate(ROUTES.PROTECTED.VENDOR.LISTINGS)}
            className="text-blue-300 hover:text-blue-100 mb-2 flex items-center gap-2"
          >
            ← Back to Listings
          </button>
          <h1 className="text-3xl font-bold text-white">⚡ Auction Room</h1>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg">{error}</div>
        )}

        {/* Timer */}
        {rankData && (
          <div className={`rounded-xl p-6 text-center ${isFinished ? 'bg-gray-800/50 border border-gray-600' : isAntiSnipe ? 'bg-orange-900/40 border border-orange-500 animate-pulse' : 'bg-blue-900/30 border border-blue-700/50'}`}>
            {isAntiSnipe && (
              <p className="text-orange-300 text-sm font-semibold mb-2 uppercase tracking-wider">
                ⚠ Last 60 seconds — Anti-snipe active!
              </p>
            )}
            <p className="text-blue-300 text-xs uppercase tracking-widest mb-1">
              {isFinished ? 'Auction Ended' : 'Time Remaining'}
            </p>
            <p className={`text-5xl font-mono font-bold ${isFinished ? 'text-gray-400' : isAntiSnipe ? 'text-orange-300' : 'text-white'}`}>
              {isFinished ? '—' : formatCountdown(timeLeft)}
            </p>
          </div>
        )}

        {/* Your Rank */}
        {rankData && (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-5 text-center">
              <p className="text-blue-300 text-xs uppercase tracking-wider mb-2">Your Current Rank</p>
              <p className={`text-5xl font-bold ${rankColor(rankData.your_rank)}`}>
                {rankData.your_rank != null ? `#${rankData.your_rank}` : '—'}
              </p>
              {rankData.your_rank === 1 && (
                <p className="text-yellow-400 text-xs mt-2 font-semibold">🏆 You're leading!</p>
              )}
              {rankData.your_rank == null && (
                <p className="text-blue-400 text-xs mt-2">Place a bid to get ranked</p>
              )}
            </div>
            <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-5 text-center">
              <p className="text-blue-300 text-xs uppercase tracking-wider mb-2">Your Best Bid</p>
              <p className="text-3xl font-bold font-mono text-green-300">
                {rankData.your_best_bid != null
                  ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(rankData.your_best_bid)
                  : '—'}
              </p>
            </div>
          </div>
        )}

        {/* Bid Form */}
        {isRunning && (
          <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Place a Bid</h2>
            <p className="text-blue-300 text-sm mb-4">
              Enter a bid lower than the current best. Lower is better in a reverse auction.
            </p>
            {bidError && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">{bidError}</div>
            )}
            {bidSuccess && (
              <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-3 rounded-lg mb-4 text-sm">{bidSuccess}</div>
            )}
            <form onSubmit={handlePlaceBid} className="flex gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 font-bold">$</span>
                <input
                  type="number"
                  value={bidInput}
                  onChange={e => setBidInput(e.target.value)}
                  placeholder="Enter your bid amount"
                  min="0"
                  step="0.01"
                  disabled={bidding}
                  className="w-full bg-blue-950/50 border border-blue-700/50 text-white rounded-lg pl-7 pr-4 py-3 focus:outline-none focus:border-blue-400 disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={bidding || !bidInput}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold whitespace-nowrap"
              >
                {bidding ? 'Submitting…' : '⚡ Place Bid'}
              </button>
            </form>
          </div>
        )}

        {/* Auction Ended */}
        {isFinished && rankData && (
          <div className={`rounded-xl p-6 text-center border ${rankData.your_rank === 1 ? 'bg-yellow-900/30 border-yellow-600' : 'bg-gray-800/50 border-gray-600'}`}>
            {rankData.your_rank === 1
              ? <><p className="text-yellow-400 text-lg font-bold">🏆 You Won!</p><p className="text-white text-sm mt-1">Congratulations — your bid was the lowest.</p></>
              : <><p className="text-gray-300 text-lg font-semibold">Auction Ended</p>{rankData.your_rank && <p className="text-blue-300 text-sm mt-1">You finished at rank #{rankData.your_rank}.</p>}</>
            }
          </div>
        )}

        {/* Bid History */}
        {myBids.length > 0 && (
          <div className="bg-blue-900/20 border border-blue-800/40 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Your Bid History</h2>
            <div className="space-y-2">
              {myBids.map((bid: any, i: number) => (
                <div key={bid.id ?? i} className="flex justify-between items-center py-2 border-b border-blue-800/20 last:border-0">
                  <span className="text-blue-300 text-sm">{new Date(bid.timestamp ?? bid.created_at).toLocaleTimeString()}</span>
                  <span className={`font-mono font-semibold ${bid.valid ? 'text-green-300' : 'text-red-400 line-through'}`}>
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(bid.bid_amount)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${bid.valid ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                    {bid.valid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VendorAuctionRoom;

