import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import listingService from '../../services/listingService';
import auctionService from '../../services/auctionService';
import { ROUTES } from '../../config/routes';
import type { Listing, Quote } from '../../types/listings';
import type { Auction } from '../../types/auction';

const CompanyListingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Auction state
  const [auction, setAuction] = useState<Auction | null>(null);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [auctionDuration, setAuctionDuration] = useState(30);
  const [auctionDecrement, setAuctionDecrement] = useState<'fixed' | 'percent'>('fixed');
  const [auctionDecrementValue, setAuctionDecrementValue] = useState(0);
  const [launchingAuction, setLaunchingAuction] = useState(false);
  const [auctionError, setAuctionError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadListing(parseInt(id));
      loadQuotes(parseInt(id));
      loadAuction(parseInt(id));
    }
  }, [id]);

  const loadListing = async (listingId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await listingService.getListing(listingId);
      setListing(response.data);
      // Use quotes already embedded in the listing (eager-loaded by show())
      if (response.data.quotes && response.data.quotes.length > 0) {
        setQuotes(response.data.quotes);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load listing');
    } finally {
      setLoading(false);
    }
  };

  const loadQuotes = async (id: number) => {
    try {
      setQuotesLoading(true);
      const response = await listingService.getQuotesForListing(id);
      setQuotes(response.data);
    } catch (err: any) {
      // Log the error so it's visible; keep existing quotes from loadListing()
      console.warn('Could not refresh quotes from dedicated endpoint:', err.response?.data?.message || err.message);
    } finally {
      setQuotesLoading(false);
    }
  };

  const loadAuction = async (id: number) => {
    try {
      const res = await auctionService.getAuctionForListing(id);
      setAuction(res.data.auction);
    } catch {
      // No auction yet — that's fine
    }
  };

  const handleLaunchAuction = async () => {
    if (!id) return;
    setLaunchingAuction(true);
    setAuctionError(null);
    try {
      const res = await auctionService.createAuction({
        listing_id: parseInt(id),
        duration_minutes: auctionDuration,
        minimum_decrement_type: auctionDecrement,
        minimum_decrement_value: auctionDecrementValue,
      });
      setAuction(res.data.auction);
      setShowAuctionModal(false);
    } catch (e: any) {
      setAuctionError(e.response?.data?.message || 'Failed to launch auction');
    } finally {
      setLaunchingAuction(false);
    }
  };

  const handleReviewQuote = async (quoteId: number, status: 'accepted' | 'rejected' | 'under_review', notes?: string) => {
    setReviewingId(quoteId);
    setReviewError(null);
    try {
      await listingService.reviewQuote(quoteId, { status, review_notes: notes });
      await loadQuotes(parseInt(id!));
    } catch (err: any) {
      setReviewError(err.response?.data?.message || 'Failed to update quote status');
    } finally {
      setReviewingId(null);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getQuoteStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-900/50 text-green-300';
      case 'rejected': return 'bg-red-900/50 text-red-300';
      case 'under_review': return 'bg-yellow-900/50 text-yellow-300';
      case 'withdrawn': return 'bg-gray-900/50 text-gray-300';
      default: return 'bg-blue-900/50 text-blue-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/50 text-green-300';
      case 'draft': return 'bg-yellow-900/50 text-yellow-300';
      case 'closed': return 'bg-gray-900/50 text-gray-300';
      case 'cancelled': return 'bg-red-900/50 text-red-300';
      default: return 'bg-gray-900/50 text-gray-300';
    }
  };

  const isOwner = user?.current_profile_type === 'company' &&
    listing?.company.id === user.current_profile_id;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !listing) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg">
            {error || 'Listing not found'}
          </div>
          <button
            onClick={() => navigate(ROUTES.PROTECTED.COMPANY.LISTINGS)}
            className="text-blue-300 hover:text-blue-100 flex items-center gap-2"
          >
            ← Back to Listings
          </button>
        </div>
      </DashboardLayout>
    );
  }

  if (!isOwner) {
    return (
      <DashboardLayout>
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/40 rounded-lg p-6 text-center">
          <p className="text-red-300 mb-4">You are not authorized to view this listing.</p>
          <button
            onClick={() => navigate(ROUTES.PROTECTED.COMPANY.LISTINGS)}
            className="text-blue-300 hover:text-blue-100"
          >
            ← Back to Listings
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <button
              onClick={() => navigate(ROUTES.PROTECTED.COMPANY.LISTINGS)}
              className="text-blue-300 hover:text-blue-100 mb-4 flex items-center gap-2"
            >
              ← Back to Listings
            </button>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{listing.title}</h1>
              <span className="text-2xl">{listing.visibility === 'public' ? '🌐' : '🔒'}</span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(listing.status)}`}>
                <span className={`inline-block h-2 w-2 rounded-full mr-2 ${listing.status === 'active' ? 'bg-green-500' :
                  listing.status === 'draft' ? 'bg-yellow-500' :
                    listing.status === 'closed' ? 'bg-gray-500' : 'bg-red-500'
                  }`}></span>
                {listing.status.toUpperCase()}
              </span>
            </div>
            <p className="text-blue-300 text-lg">
              Listing #{listing.listing_number}
            </p>
          </div>

          <div className="flex gap-3 flex-wrap justify-end">
            <button
              onClick={() => navigate(ROUTES.PROTECTED.COMPANY.LISTINGS_EDIT.replace(':id', listing.id.toString()))}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Edit Listing
            </button>
            <button
              onClick={() => document.getElementById('quotes-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              View Quotes ({quotes.length || listing.quotes?.length || 0})
            </button>
            {/* Auction CTA */}
            {auction && (auction.status === 'running' || auction.status === 'scheduled') && (
              <button
                onClick={() => navigate(ROUTES.PROTECTED.COMPANY.AUCTION_ROOM.replace(':id', listing.id.toString()))}
                className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2"
              >
                🔨 View Auction Room
              </button>
            )}
            {auction && auction.status === 'completed' && (
              <button
                onClick={() => navigate(ROUTES.PROTECTED.COMPANY.AUCTION_ROOM.replace(':id', listing.id.toString()))}
                className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
              >
                📊 View Auction Results
              </button>
            )}
            {!auction && quotes.length >= 2 && (
              <button
                onClick={() => setShowAuctionModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
              >
                🔨 Send to Reverse Auction
              </button>
            )}
          </div>
        </div>

        {/* Auction Status Banner */}
        {auction && (
          <div className={`rounded-lg px-5 py-4 flex items-center justify-between ${auction.status === 'running'
            ? 'bg-yellow-900/30 border border-yellow-600'
            : auction.status === 'completed'
              ? 'bg-gray-800/50 border border-gray-600'
              : 'bg-blue-900/30 border border-blue-700'
            }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{auction.status === 'running' ? '🔨' : auction.status === 'completed' ? '✅' : '🕐'}</span>
              <div>
                <p className="text-white font-semibold">
                  {auction.status === 'running' ? 'Reverse Auction In Progress' : auction.status === 'completed' ? 'Auction Completed' : 'Auction Scheduled'}
                </p>
                <p className="text-blue-300 text-sm">
                  {auction.status === 'running' ? `Ends at ${new Date(auction.end_time).toLocaleTimeString()}` : `Ended at ${new Date(auction.end_time).toLocaleString()}`}
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate(ROUTES.PROTECTED.COMPANY.AUCTION_ROOM.replace(':id', listing.id.toString()))}
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${auction.status === 'running' ? 'bg-yellow-500 hover:bg-yellow-400 text-black' : 'bg-gray-600 hover:bg-gray-500 text-white'}`}
            >
              {auction.status === 'running' ? '🔨 Enter Auction Room' : '📊 View Results'}
            </button>
          </div>
        )}

        {/* Encourage auction when 2+ quotes and no auction */}
        {!auction && quotes.length >= 2 && (
          <div className="bg-purple-900/20 border border-purple-700/50 rounded-lg px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">🔨 Ready for Reverse Auction</p>
              <p className="text-purple-300 text-sm">{quotes.length} vendors have submitted quotes. Launch a timed reverse auction to get the best price.</p>
            </div>
            <button
              onClick={() => setShowAuctionModal(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap ml-4"
            >
              Launch Auction
            </button>
          </div>
        )}

        {/* Launch Auction Modal */}
        {showAuctionModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 border border-blue-800/60 rounded-2xl p-8 w-full max-w-md">
              <h2 className="text-2xl font-bold text-white mb-2">🔨 Launch Reverse Auction</h2>
              <p className="text-blue-300 text-sm mb-6">
                {quotes.length} vendors will be auto-enrolled. They can only see their rank — you see the full leaderboard.
              </p>

              {auctionError && (
                <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm">{auctionError}</div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">
                    Auction Duration: <span className="text-white font-bold">{auctionDuration} minutes</span>
                  </label>
                  <input
                    type="range" min={5} max={180} step={5}
                    value={auctionDuration}
                    onChange={e => setAuctionDuration(parseInt(e.target.value))}
                    className="w-full accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-blue-400 mt-1">
                    <span>5 min</span><span>1 hr</span><span>3 hrs</span>
                  </div>
                </div>

                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">Minimum Decrement Type</label>
                  <select
                    value={auctionDecrement}
                    onChange={e => setAuctionDecrement(e.target.value as 'fixed' | 'percent')}
                    className="w-full bg-blue-950/50 border border-blue-700/50 text-white rounded-lg px-3 py-2"
                  >
                    <option value="fixed">Fixed Amount ($)</option>
                    <option value="percent">Percentage (%)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-blue-300 text-sm font-medium mb-2">
                    Minimum Decrement Value {auctionDecrement === 'fixed' ? '($)' : '(%)'}
                  </label>
                  <input
                    type="number" min={0} step={auctionDecrement === 'percent' ? 0.1 : 1}
                    value={auctionDecrementValue}
                    onChange={e => setAuctionDecrementValue(parseFloat(e.target.value) || 0)}
                    className="w-full bg-blue-950/50 border border-blue-700/50 text-white rounded-lg px-3 py-2"
                  />
                </div>

                <div className="bg-blue-900/30 rounded-lg p-3 text-sm text-blue-300">
                  ⚠ <strong className="text-white">Anti-snipe enabled:</strong> Bids placed in the last 60 seconds automatically extend the auction by 60 seconds.
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowAuctionModal(false); setAuctionError(null); }}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLaunchAuction}
                  disabled={launchingAuction}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-4 py-3 rounded-lg font-bold"
                >
                  {launchingAuction ? 'Launching…' : '🔨 Launch Auction'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Description and Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
              <div className="prose max-w-none">
                <p className="text-blue-100 whitespace-pre-wrap">{listing.description}</p>
              </div>
            </div>

            {listing.requirements && listing.requirements.length > 0 && (
              <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
                <ul className="list-disc list-inside space-y-2">
                  {listing.requirements.map((req, index) => (
                    <li key={index} className="text-blue-100">{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {listing.specifications && listing.specifications.length > 0 && (
              <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Specifications</h2>
                <ul className="list-disc list-inside space-y-2">
                  {listing.specifications.map((spec, index) => (
                    <li key={index} className="text-blue-100">{spec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Sidebar with key information */}
          <div className="space-y-6">
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Listing Details</h3>
              <div className="space-y-4">
                <div>
                  <span className="text-sm font-medium text-blue-300">Company</span>
                  <p className="text-white">{listing.company.name}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-blue-300">Category</span>
                  <p className="text-white">{listing.category}</p>
                </div>

                {listing.base_price && (
                  <div>
                    <span className="text-sm font-medium text-blue-300">Base Price</span>
                    <p className="text-white text-xl font-bold">
                      ${listing.base_price.toLocaleString()}
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-blue-300">Visibility</span>
                  <p className="text-white capitalize">{listing.visibility}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-blue-300">Created</span>
                  <p className="text-white">
                    {new Date(listing.created_at).toLocaleDateString()}
                  </p>
                </div>

                {listing.opens_at && (
                  <div>
                    <span className="text-sm font-medium text-blue-300">Opens</span>
                    <p className="text-white">
                      {new Date(listing.opens_at).toLocaleString()}
                    </p>
                  </div>
                )}

                {listing.closes_at && (
                  <div>
                    <span className="text-sm font-medium text-blue-300">Closes</span>
                    <p className="text-white">
                      {new Date(listing.closes_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {listing.blockchain_enabled && (
              <div className="bg-blue-800/30 backdrop-blur-sm border border-blue-600/50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-100 mb-2 flex items-center gap-2">
                  ⛓ Blockchain Enabled
                </h3>
                <p className="text-blue-200 text-sm">
                  This listing is blockchain-verified for enhanced transparency and security.
                </p>
                {listing.blockchain_tx_hash && (
                  <div className="mt-3">
                    <span className="text-xs font-medium text-blue-300">Transaction Hash:</span>
                    <p className="text-xs font-mono text-blue-200 break-all">
                      {listing.blockchain_tx_hash}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-300">Total Quotes:</span>
                  <span className="text-white font-medium">{listing.quotes?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300">Status:</span>
                  <span className="text-white font-medium capitalize">{listing.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-300">Visibility:</span>
                  <span className="text-white font-medium capitalize">{listing.visibility}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quotes Panel — full width below grid */}
        <div id="quotes-section" className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/40 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Vendor Quotes ({quotes.length})
          </h2>

          {reviewError && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-4">
              {reviewError}
            </div>
          )}

          {quotesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : quotes.length === 0 ? (
            <p className="text-blue-300 text-center py-8">No quotes received yet.</p>
          ) : (
            <div className="space-y-4">
              {quotes.map((quote) => (
                <div key={quote.id} className="bg-blue-800/20 border border-blue-700/40 rounded-lg p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-white">Quote #{quote.quote_number}</h3>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getQuoteStatusColor(quote.status)}`}>
                          {quote.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </div>
                      <p className="text-blue-300 text-sm">
                        Vendor: <span className="text-white font-medium">{quote.vendor?.name || `User #${quote.vendor_user_id}`}</span>
                        &nbsp;·&nbsp; Submitted: {new Date(quote.submitted_at).toLocaleDateString()}
                        {quote.expires_at && <>&nbsp;·&nbsp; Expires: {new Date(quote.expires_at).toLocaleDateString()}</>}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-white">{formatCurrency(quote.quoted_price)}</p>
                      <p className="text-blue-300 text-sm">{quote.delivery_days} days delivery</p>
                    </div>
                  </div>

                  <div className="bg-blue-900/30 rounded-lg p-3 mb-4">
                    <p className="text-blue-100 text-sm whitespace-pre-wrap line-clamp-3">{quote.proposal_details}</p>
                  </div>

                  {quote.review_notes && (
                    <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3 mb-4">
                      <p className="text-yellow-300 text-xs font-medium mb-1">Review Notes</p>
                      <p className="text-yellow-100 text-sm">{quote.review_notes}</p>
                    </div>
                  )}

                  {(quote.status === 'submitted' || quote.status === 'under_review') && (
                    <div className="flex gap-2 flex-wrap">
                      {quote.status === 'submitted' && (
                        <button
                          onClick={() => handleReviewQuote(quote.id, 'under_review')}
                          disabled={reviewingId === quote.id}
                          className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                          Mark Under Review
                        </button>
                      )}
                      <button
                        onClick={() => handleReviewQuote(quote.id, 'accepted')}
                        disabled={reviewingId === quote.id}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        {reviewingId === quote.id ? 'Saving…' : 'Accept'}
                      </button>
                      <button
                        onClick={() => handleReviewQuote(quote.id, 'rejected')}
                        disabled={reviewingId === quote.id}
                        className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyListingDetail;
